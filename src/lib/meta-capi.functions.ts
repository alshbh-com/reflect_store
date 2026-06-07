import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHash } from "node:crypto";

// Meta Conversions API server-side dispatcher.
// Token is read at request time from process.env — never bundled to client.

const EVENT_NAMES = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
] as const;

const userDataSchema = z
  .object({
    email: z.string().optional(),
    phone: z.string().optional(),
    external_id: z.string().optional(),
    fbp: z.string().optional(),
    fbc: z.string().optional(),
  })
  .partial();

const customDataSchema = z
  .object({
    currency: z.string().default("EGP"),
    value: z.number().optional(),
    content_ids: z.array(z.union([z.string(), z.number()])).optional(),
    content_name: z.string().optional(),
    content_type: z.string().optional(),
    content_category: z.string().optional(),
    contents: z
      .array(
        z.object({
          id: z.union([z.string(), z.number()]),
          quantity: z.number().optional(),
          item_price: z.number().optional(),
        }),
      )
      .optional(),
    num_items: z.number().optional(),
    order_id: z.union([z.string(), z.number()]).optional(),
  })
  .partial();

const inputSchema = z.object({
  event_name: z.enum(EVENT_NAMES),
  event_id: z.string().min(1).max(120),
  event_source_url: z.string().url().optional(),
  user_data: userDataSchema.optional(),
  custom_data: customDataSchema.optional(),
  test_event_code: z.string().optional(),
});

function sha256(value?: string) {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  return createHash("sha256").update(v).digest("hex");
}

function normalizePhone(p?: string) {
  if (!p) return undefined;
  const digits = p.replace(/\D+/g, "");
  return digits || undefined;
}

export const sendMetaCapiEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
    const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;

    if (!accessToken || !pixelId) {
      console.error("[meta-capi] missing token or pixel id");
      return { ok: false, error: "not_configured" as const };
    }

    const ip =
      getRequestIP({ xForwardedFor: true }) ||
      getRequestHeader("cf-connecting-ip") ||
      undefined;
    const userAgent = getRequestHeader("user-agent") || undefined;

    const ud = data.user_data ?? {};
    const userData: Record<string, unknown> = {
      em: sha256(ud.email) ? [sha256(ud.email)] : undefined,
      ph: sha256(normalizePhone(ud.phone)) ? [sha256(normalizePhone(ud.phone))] : undefined,
      external_id: sha256(ud.external_id) ? [sha256(ud.external_id)] : undefined,
      client_ip_address: ip,
      client_user_agent: userAgent,
      fbp: ud.fbp,
      fbc: ud.fbc,
    };
    Object.keys(userData).forEach((k) => userData[k] === undefined && delete userData[k]);

    const payload = {
      data: [
        {
          event_name: data.event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.event_id,
          event_source_url: data.event_source_url,
          action_source: "website",
          user_data: userData,
          custom_data: data.custom_data ?? { currency: "EGP" },
        },
      ],
      ...(data.test_event_code ? { test_event_code: data.test_event_code } : {}),
    };

    try {
      const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        console.error("[meta-capi] failed", res.status, json);
        return { ok: false, error: "request_failed" as const, status: res.status, details: json };
      }
      console.log("[meta-capi] sent", data.event_name, data.event_id, json);
      return { ok: true, response: json };
    } catch (err) {
      console.error("[meta-capi] exception", err);
      return { ok: false, error: "exception" as const, message: String(err) };
    }
  });

export const getMetaCapiStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    token_configured: Boolean(process.env.META_CAPI_ACCESS_TOKEN),
    pixel_id: process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID || null,
  };
});

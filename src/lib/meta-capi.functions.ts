import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Meta Conversions API server-side dispatcher.
// Access Token is read at request time from process.env — never bundled to client.
// Pixel ID and Test Event Code can be overridden live from the `meta_settings` table.

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

async function loadSettings() {
  try {
    const { data } = await supabaseAdmin
      .from("meta_settings")
      .select("pixel_id,test_event_code,access_token")
      .eq("id", "main")
      .maybeSingle();
    return {
      pixel_id: (data as any)?.pixel_id || process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID || null,
      test_event_code: (data as any)?.test_event_code || null,
      access_token: (data as any)?.access_token || process.env.META_CAPI_ACCESS_TOKEN || null,
    };
  } catch {
    return {
      pixel_id: process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID || null,
      test_event_code: null,
      access_token: process.env.META_CAPI_ACCESS_TOKEN || null,
    };
  }
}

async function writeLog(row: {
  event_name: string;
  event_id: string;
  status: "success" | "error" | "skipped";
  http_status?: number;
  message?: string;
  source_url?: string;
  custom_data?: unknown;
}) {
  try {
    await supabaseAdmin.from("meta_event_logs").insert({
      event_name: row.event_name,
      event_id: row.event_id,
      status: row.status,
      http_status: row.http_status ?? null,
      message: row.message ?? null,
      source_url: row.source_url ?? null,
      custom_data: (row.custom_data as any) ?? null,
    });
  } catch (e) {
    console.warn("[meta-capi] log insert failed", e);
  }
}

export const sendMetaCapiEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const settings = await loadSettings();
    const accessToken = settings.access_token;
    const pixelId = settings.pixel_id;

    if (!accessToken || !pixelId) {
      await writeLog({
        event_name: data.event_name,
        event_id: data.event_id,
        status: "skipped",
        message: !accessToken ? "missing access token" : "missing pixel id",
        source_url: data.event_source_url,
        custom_data: data.custom_data,
      });
      return { ok: false as const, status: 0, message: "not_configured" };
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

    const testCode = data.test_event_code || settings.test_event_code || undefined;

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
      ...(testCode ? { test_event_code: testCode } : {}),
    };

    try {
      const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      await writeLog({
        event_name: data.event_name,
        event_id: data.event_id,
        status: res.ok ? "success" : "error",
        http_status: res.status,
        message: text.slice(0, 1000),
        source_url: data.event_source_url,
        custom_data: data.custom_data,
      });
      if (!res.ok) {
        return { ok: false as const, status: res.status, message: text.slice(0, 500) };
      }
      return { ok: true as const, status: res.status };
    } catch (err) {
      await writeLog({
        event_name: data.event_name,
        event_id: data.event_id,
        status: "error",
        message: String(err).slice(0, 1000),
        source_url: data.event_source_url,
        custom_data: data.custom_data,
      });
      return { ok: false as const, status: 0, message: String(err).slice(0, 500) };
    }
  });

export const getMetaCapiStatus = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await loadSettings();
  return {
    token_configured: Boolean(settings.access_token),
    pixel_id: settings.pixel_id,
    test_event_code: settings.test_event_code,
  };
});

// Public, safe-to-call: returns only the pixel_id so the browser pixel script can stay in sync with admin changes.
export const getPublicPixelId = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await loadSettings();
  return { pixel_id: settings.pixel_id };
});

const updateSchema = z.object({
  pixel_id: z.string().trim().max(64).optional(),
  test_event_code: z.string().trim().max(64).nullable().optional(),
  access_token: z.string().trim().max(1024).nullable().optional(),
});

export const updateMetaSettings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }) => {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.pixel_id !== undefined) patch.pixel_id = data.pixel_id || null;
    if (data.test_event_code !== undefined) patch.test_event_code = data.test_event_code || null;
    if (data.access_token !== undefined) patch.access_token = data.access_token || null;
    const { error } = await supabaseAdmin
      .from("meta_settings")
      .upsert({ id: "main", ...patch });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const getMetaEventLogs = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("meta_event_logs")
    .select("id,event_name,event_id,status,http_status,message,source_url,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return { logs: [] as any[], error: error.message };
  return { logs: data ?? [] };
});

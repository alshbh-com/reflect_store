// Client-side Meta Pixel + Conversions API helper.
// Generates a shared event_id used by both fbq and CAPI for deduplication.

import { sendMetaCapiEvent } from "./meta-capi.functions";

type EventName = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

type UserData = {
  email?: string;
  phone?: string;
  external_id?: string;
};

type CustomData = {
  currency?: string;
  value?: number;
  content_ids?: (string | number)[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  contents?: { id: string | number; quantity?: number; item_price?: number }[];
  num_items?: number;
  order_id?: string | number;
};

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function trackMetaEvent(
  event: EventName,
  opts: { user_data?: UserData; custom_data?: CustomData } = {},
) {
  const eventId = uuid();

  // Browser pixel
  if (typeof window !== "undefined" && (window as any).fbq) {
    try {
      (window as any).fbq("track", event, opts.custom_data ?? {}, { eventID: eventId });
    } catch (e) {
      console.warn("[meta-pixel] fbq failed", e);
    }
  }

  // Server-side CAPI (fire and forget)
  const fbp = getCookie("_fbp");
  const fbc = getCookie("_fbc");
  const url = typeof window !== "undefined" ? window.location.href : undefined;

  sendMetaCapiEvent({
    data: {
      event_name: event,
      event_id: eventId,
      event_source_url: url,
      user_data: { ...opts.user_data, fbp, fbc },
      custom_data: opts.custom_data,
    },
  }).catch((e) => console.warn("[meta-capi] dispatch failed", e));

  return eventId;
}

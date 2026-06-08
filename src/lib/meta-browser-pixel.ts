type MetaEventName = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

type Fbq = {
  (command: "init", pixelId: string): void;
  (command: "track", event: MetaEventName, params?: object, options?: object): void;
  (
    command: "trackSingle",
    pixelId: string,
    event: MetaEventName,
    params?: object,
    options?: object,
  ): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: Fbq;
};

type MetaWindow = Window & {
  fbq?: Fbq;
  _fbq?: Fbq;
  __reflectActivePixelId?: string;
};

const PIXEL_STORAGE_KEY = "reflect-meta-pixel-id";
const FB_SCRIPT_ID = "facebook-jssdk-pixel";

function cleanPixelId(pixelId?: string | null) {
  const id = String(pixelId ?? "").replace(/\D+/g, "");
  return id.length >= 8 ? id : "";
}

export function getStoredMetaPixelId() {
  if (typeof window === "undefined") return "";
  return cleanPixelId(
    (window as MetaWindow).__reflectActivePixelId || window.localStorage.getItem(PIXEL_STORAGE_KEY),
  );
}

export function rememberMetaPixelId(pixelId: string) {
  if (typeof window === "undefined") return "";
  const id = cleanPixelId(pixelId);
  if (!id) return "";
  (window as MetaWindow).__reflectActivePixelId = id;
  window.localStorage.setItem(PIXEL_STORAGE_KEY, id);
  return id;
}

export function ensureMetaPixel() {
  if (typeof window === "undefined" || typeof document === "undefined") return undefined;
  const w = window as MetaWindow;
  if (w.fbq) return w.fbq;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  }) as Fbq;

  w.fbq = fbq;
  w._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  if (!document.getElementById(FB_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = FB_SCRIPT_ID;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }

  return fbq;
}

export function initMetaPixel(pixelId: string) {
  const id = rememberMetaPixelId(pixelId);
  const fbq = ensureMetaPixel();
  if (!id || !fbq) return false;
  fbq("init", id);
  return true;
}

export function trackMetaBrowserEvent(
  event: MetaEventName,
  options: { pixelId?: string | null; eventId?: string; customData?: object } = {},
) {
  const pixelId = cleanPixelId(options.pixelId) || getStoredMetaPixelId();
  const fbq = ensureMetaPixel();
  if (!fbq) return false;

  if (pixelId) {
    rememberMetaPixelId(pixelId);
    fbq("init", pixelId);
    fbq(
      "trackSingle",
      pixelId,
      event,
      options.customData ?? {},
      options.eventId ? { eventID: options.eventId } : {},
    );
    return true;
  }

  fbq(
    "track",
    event,
    options.customData ?? {},
    options.eventId ? { eventID: options.eventId } : {},
  );
  return true;
}
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
  // Force-on Nitro with the Cloudflare module preset so that `vite build` produces
  // a deployable Worker bundle (dist/server/index.mjs + dist/client) even outside
  // the Lovable sandbox. This resolves "No Lovable context detected — skipping nitro deploy plugin"
  // when deploying via Wrangler from GitLab/Cloudflare.
  nitro: {
    preset: "cloudflare-module",
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
    cloudflare: {
      nodeCompat: true,
      // We provide our own wrangler.jsonc so disable auto-generated deploy config.
      deployConfig: false,
    },
  },
});

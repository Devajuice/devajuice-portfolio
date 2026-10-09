import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sendHtmlError } from "./api/_lib/error-page.js";

const LASTFM_USERNAME = "Devajuice";

/**
 * Serves /api/nowplaying during `vite dev` and `vite preview` so the browser
 * never talks to Last.fm directly.
 *
 * This matters for security, not just convenience: Vite statically replaces
 * `import.meta.env.VITE_*` in *production* builds too. A key exposed as
 * `VITE_LASTFM_API_KEY` is therefore inlined into the shipped bundle as
 * plaintext even though the production code path never reads it — anyone can
 * copy it from the JS. Reading a plain (unprefixed) `LASTFM_API_KEY` here keeps
 * it server-side in both dev and production, and makes one variable name work
 * everywhere.
 */
function lastfmDevApi(env) {
  const handler = async (req, res, next) => {
    if (!req.url?.startsWith("/api/nowplaying")) return next();

    const apiKey = env.LASTFM_API_KEY || env.VITE_LASTFM_API_KEY;
    const sendJson = (code, payload) => {
      res.statusCode = code;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(payload));
    };
    // Mirror api/nowplaying.js: browsers get an explanatory page, the app's
    // fetch keeps getting JSON.
    const sendError = (code, { title, message, cause, detail, hint }) => {
      if (
        sendHtmlError(res, req, {
          status: code,
          title,
          message,
          endpoint: "/api/nowplaying",
          cause,
          detail,
          hint,
          backLabel: "Back to site",
        })
      ) {
        return;
      }
      sendJson(code, { error: true, message });
    };

    if (!apiKey) {
      const msg =
        "Last.fm API key missing. Add LASTFM_API_KEY=<your key> to a .env file in the project root (see README).";
      console.error(`\n[lastfm] ${msg}\n`);
      sendError(500, {
        title: "Last.fm music proxy is not configured",
        message: "The now-playing service cannot reach Last.fm because no API key is set.",
        cause: "LASTFM_API_KEY (or VITE_LASTFM_API_KEY) is missing from the dev environment.",
        detail: ".env — no LASTFM_API_KEY found",
        hint: "Add LASTFM_API_KEY=<your key> to .env in the project root and restart the dev server.",
      });
      return;
    }

    const params = new URL(req.url, "http://localhost").searchParams;
    const method = params.get("method") || "user.getrecenttracks";

    let target;
    if (method === "track.getInfo") {
      const artist = params.get("artist");
      const track = params.get("track");
      if (!artist || !track) {
        sendError(400, {
          title: "Missing request parameters",
          message: "The track lookup could not run because its query parameters are incomplete.",
          cause: "track.getInfo was called without both `artist` and `track`.",
          detail: `artist=${artist ?? "(missing)"} track=${track ?? "(missing)"}`,
          hint: "Call with ?method=track.getInfo&artist=...&track=...",
        });
        return;
      }
      target =
        `https://ws.audioscrobbler.com/2.0/?method=track.getInfo` +
        `&api_key=${apiKey}&artist=${encodeURIComponent(artist)}` +
        `&track=${encodeURIComponent(track)}&format=json&username=${LASTFM_USERNAME}`;
    } else if (method === "user.getrecenttracks") {
      target =
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
        `&user=${LASTFM_USERNAME}&api_key=${apiKey}&format=json&limit=1&extended=1`;
    } else {
      sendError(400, {
        title: "Unsupported method",
        message: "This proxy only forwards a fixed set of Last.fm methods.",
        cause: `The requested method "${method}" is not handled by this function.`,
        detail: "Supported: user.getrecenttracks, track.getInfo",
        hint: "Use one of the supported methods listed above.",
      });
      return;
    }

    try {
      const upstream = await fetch(target);
      const body = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      res.end(body);
    } catch (err) {
      sendError(502, {
        title: "Last.fm is unreachable",
        message: "The music proxy could not complete its request to Last.fm.",
        cause: "The upstream request to ws.audioscrobbler.com failed.",
        detail: err.message,
        hint: "Usually temporary — retry in a moment. If it persists, check Last.fm status and the API key.",
      });
    }
  };

  return {
    name: "lastfm-dev-api",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => ({
  // loadEnv with an empty prefix reads unprefixed vars into this config process
  // only — Vite never injects them into the client bundle.
  plugins: [react(), tailwindcss(), lastfmDevApi(loadEnv(mode, process.cwd(), ""))],

  build: {
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["react-helmet-async"],
          motion: ["framer-motion"],
        },
      },
    },

    // Inline small assets to reduce HTTP requests
    assetsInlineLimit: 4096,

    // Generate source maps only for non-production (can be disabled entirely)
    sourcemap: false,

    // Minify with esbuild (faster than terser)
    minify: "esbuild",

    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: "esbuild",

    // Report compressed size
    reportCompressedSize: true,

    // Chunk size warning threshold (in KB)
    chunkSizeWarningLimit: 500,

    // Output directory
    outDir: "dist",

    // Empty output dir before build
    emptyOutDir: true,
  },

  // Optimize dependency pre-bundling
  //
  // Declare every React entry point the app imports up front. If these are left
  // to lazy discovery, Vite can re-optimise mid-session (e.g. after a lockfile
  // change) and leave the browser holding two pre-bundled copies of React —
  // which surfaces as "can't access property 'useState', dispatcher is null".
  optimizeDeps: {
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "react-helmet-async",
      "clsx",
      "tailwind-merge",
      "framer-motion",
      "lucide-react",
    ],
    // Exclude rarely-used dependencies from pre-bundling
    exclude: [],
  },

  // Server configuration for development
  server: {
    // Use native ES modules in development
    middlewareMode: false,
  },

  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
  },
}));

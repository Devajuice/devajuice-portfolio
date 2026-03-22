import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["react-helmet-async"],
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
  optimizeDeps: {
    include: ["react", "react-dom", "react-helmet-async"],
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
});

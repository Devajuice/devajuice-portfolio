import { renderErrorPage, wantsHtml } from './_lib/error-page.js';

// Edge, matching where OG image generation is meant to run. `vercel.json`
// rewrites both /api/og and /api/og.png here.
export const config = {
  runtime: 'edge',
};

const STATIC_OG = '/og-image-v2.png';

const EXPLANATION = {
  status: 501,
  endpoint: '/api/og',
  title: 'Dynamic OG image generation is not deployed',
  message:
    'The link-preview image generator has not been built, so this endpoint has no image to return. Social previews still work via the static fallback image.',
  cause:
    'This route used to be served by an @vercel/og edge function (api/og.png.js). That generator is missing from the deployment, so the rewrite in vercel.json has nothing to invoke.',
  detail: 'vercel.json → /api/og → /api/og.png.js (function not implemented)',
  hint: 'Nothing to do for visitors — previews use /og-image-v2.png. To restore dynamic cards, re-add the @vercel/og generator at api/og.png.js (the dependency is already installed).',
  backLabel: 'Back to site',
  retry: false,
};

export default function handler(req) {
  // Image scrapers and any non-HTML caller are sent to the working static
  // image so link previews keep rendering. The explanation is reserved for a
  // human who opens the URL in a browser.
  if (!wantsHtml(req)) {
    return Response.redirect(new URL(STATIC_OG, new URL(req.url).origin), 302);
  }

  return new Response(renderErrorPage(EXPLANATION), {
    status: EXPLANATION.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

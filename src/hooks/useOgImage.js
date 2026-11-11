/**
 * useOgImage — returns the OG image URL for the site.
 *
 * The dynamic /api/og generator is not deployed; social previews should use the
 * static image directly so crawlers receive an image URL without redirects.
 */
export function useOgImage() {
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'https://devajuice.com';

  return `${base}/og-image-v2.png`;
}

/**
 * useOgImage — builds the OG image URL for a given page.
 *
 * Usage:
 *   const ogImage = useOgImage({ title: 'About Me', description: '...', author: 'Dev' });
 *   // Returns: https://your-site.vercel.app/api/og?title=About+Me&description=...&author=Dev
 */
export function useOgImage({ title = '', description = '', author = '' } = {}) {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://devajuice-portfolio.vercel.app'; // fallback for SSR / meta tags

  const params = new URLSearchParams({
    ...(title && { title }),
    ...(description && { description }),
    ...(author && { author }),
  });

  return `${base}/api/og?${params.toString()}`;
}

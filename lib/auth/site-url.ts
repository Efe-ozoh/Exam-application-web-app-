/**
 * Resolve the public origin used for Supabase email / OAuth redirects.
 *
 * Set NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_APP_URL) in every environment.
 * VERCEL_URL is used as a fallback for Vercel preview deployments.
 * Remember to add the resulting `${siteUrl}/auth/callback` URL to
 * Supabase → Authentication → URL Configuration → Redirect URLs.
 */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

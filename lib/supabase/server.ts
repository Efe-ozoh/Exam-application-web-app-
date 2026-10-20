import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CreateClientOptions = {
  /**
   * Called with the cache headers that @supabase/ssr requires whenever auth
   * cookies are written (`Cache-Control: private, no-store`, etc.).
   * Route handlers can copy these onto the response they return.
   */
  onResponseHeaders?: (headers: Record<string, string>) => void;
};

export async function createClient(options: CreateClientOptions = {}) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies. The proxy refreshes
            // the session on the next request that can write them.
          }

          options.onResponseHeaders?.(headers);
        },
      },
    },
  );
}

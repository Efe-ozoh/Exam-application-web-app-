import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | undefined;

function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

/**
 * True when the server has a secret key that can write past RLS.
 *
 * This function is safe to call from server code. It must never be imported
 * from a client component.
 */
export function isSupabaseAdminConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && getServiceRoleKey(),
  );
}

/**
 * Returns a server-only Supabase client backed by the service-role/secret key.
 *
 * The key bypasses RLS, so callers must always scope writes to the
 * authenticated user's ID and validate every field they accept from a browser.
 * Never import this module from a client component, and never expose the key
 * through a NEXT_PUBLIC_ environment variable.
 */
export function getSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "The Supabase admin client cannot be used in the browser.",
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = getServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server credentials are not configured. Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) on the server.",
    );
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

import { createClient } from "@supabase/supabase-js";

/**
 * For public, unauthenticated reads only (published recipes, etc.) on pages
 * that need to stay cacheable/ISR-eligible. Unlike lib/supabase/server.ts,
 * this never touches cookies(), so using it doesn't force the whole route
 * into dynamic rendering. Relies on RLS already permitting anon SELECT on
 * whatever it queries — never use this where the result should differ by
 * requester identity.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

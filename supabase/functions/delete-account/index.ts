import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Check for required secrets
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl) {
      return new Response(JSON.stringify({ success: false, error: "Missing SUPABASE_URL secret in Edge Function environment." }), { status: 500 });
    }
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY secret in Edge Function environment. You must use the service role key, not the anon key." }), { status: 500 });
    }
    if (!anonKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing SUPABASE_ANON_KEY secret in Edge Function environment." }), { status: 500 });
    }

    // Use anon client to verify JWT & get the caller
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });
    const { data: { user }, error: jwtErr } = await authClient.auth.getUser();
    if (jwtErr || !user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized: Invalid or missing JWT." }), { status: 401 });
    }

    // Use service role for privileged deletes
    const admin = createClient(supabaseUrl, serviceRoleKey);
    // Delete profile from profiles table
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("user_id", user.id);
    if (profileError) {
      return new Response(JSON.stringify({ success: false, error: profileError.message }), { status: 500 });
    }

    // Delete user from auth
    const { error: authError } = await admin.auth.admin.deleteUser(user.id);
    if (authError) {
      console.log('Auth delete error:', authError);
      return new Response(JSON.stringify({
        success: false,
        error: authError.message || JSON.stringify(authError),
        diagnostic: {
          type: typeof authError,
          raw: authError,
        }
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), { status: 500 });
  }
});

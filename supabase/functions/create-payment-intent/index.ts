import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Stripe payment logic removed. IAP is handled client-side.
serve(async (req) => {
  return new Response(JSON.stringify({ error: "Stripe payments are disabled. Use Apple In-App Purchases (IAP) in the client app." }), { status: 400 });
});

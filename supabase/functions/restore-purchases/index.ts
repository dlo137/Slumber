import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.6.0";

serve(async (req) => {
  const { customerId } = await req.json();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2022-11-15" });

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    return new Response(JSON.stringify({ subscriptions: subscriptions.data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
});

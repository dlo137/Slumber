import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.6.0";

serve(async (req) => {
  const { planType, customerId } = await req.json();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2022-11-15" });

  // Example plan price IDs (replace with your actual Stripe price IDs)
  const priceIds: Record<string, string> = {
    monthly: "price_1RyO2AI3Uf0Ofl4lkDgFDS35", // replace with your Stripe price ID
    yearly: "price_1RyO0BI3Uf0Ofl4lcPuXEY8z", // replace with your Stripe price ID
  };

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceIds[planType] }],
      trial_period_days: 3,
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    return new Response(JSON.stringify({ subscription }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
});

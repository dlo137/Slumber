import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.6.0";

serve(async (req) => {
  const { planType, customerId } = await req.json();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2022-11-15" });

  // Example plan price IDs (replace with your actual Stripe price IDs)
  const priceIds: Record<string, string> = {
    weekly: "price_1RrtaQI3Uf0Ofl4lDkHXOnTC", // replace with your Stripe price ID
    yearly: "price_1RrtahI3Uf0Ofl4lbqz9Th6Y", // replace with your Stripe price ID
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

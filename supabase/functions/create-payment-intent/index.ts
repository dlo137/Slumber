import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.6.0";

serve(async (req) => {
  const { planType, customerId, freeTrialEnabled } = await req.json();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2022-11-15" });

  // Example plan price IDs (replace with your actual Stripe price IDs)
  const priceIds: Record<string, string> = {
    weekly: "price_1RyO2AI3Uf0Ofl4lkDgFDS35", // replace with your Stripe price ID
    yearly: "price_1RyO0BI3Uf0Ofl4lcPuXEY8z", // replace with your Stripe price ID
  };

  try {
    let client_secret: string | undefined;
    let customer_id = customerId;
    let setup_intent = false;
    let payment_method_id: string | undefined = undefined;

    if (!customer_id) {
      const customer = await stripe.customers.create();
      customer_id = customer.id;
    }

    let subscription_id: string | undefined;
    if (freeTrialEnabled) {
      // SetupIntent for free trial (no immediate charge)
      const setupIntent = await stripe.setupIntents.create({
        customer: customer_id,
        payment_method_types: ["card"],
      });
      client_secret = setupIntent.client_secret!;
      setup_intent = true;
      // Do NOT create subscription yet; wait until payment method is attached after trial
  subscription_id = undefined;
    } else {
      // PaymentIntent for immediate charge
      const paymentIntent = await stripe.paymentIntents.create({
        amount: planType === "yearly" ? 9999 : 599, // cents
        currency: "usd",
        customer: customer_id,
        payment_method_types: ["card"],
        metadata: { planType },
      });
      client_secret = paymentIntent.client_secret!;
      // Only create subscription after payment is confirmed (frontend should call a separate endpoint)
  subscription_id = undefined;
      payment_method_id = paymentIntent.payment_method as string;
    }

    return new Response(
      JSON.stringify({
        client_secret,
        customer_id,
        setup_intent,
        subscription_id,
        payment_method_id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
  const err = e as Error;
  return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});

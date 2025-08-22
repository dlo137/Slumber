import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.6.0";

serve(async (req) => {
  const { planType, customerId, freeTrialEnabled } = await req.json();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2022-11-15" });

  // Example plan price IDs (replace with your actual Stripe price IDs)
  const priceIds: Record<string, string> = {
    monthly: "price_1RyO2AI3Uf0Ofl4lkDgFDS35", // replace with your Stripe price ID
    yearly: "price_1RyO0BI3Uf0Ofl4lcPuXEY8z", // replace with your Stripe price ID
  };

  try {
    let client_secret: string | undefined;
    let customer_id = customerId;
    let setup_intent = false;
    let subscription_id: string | undefined;

    if (!customer_id) {
      const customer = await stripe.customers.create();
      customer_id = customer.id;
    }

    if (freeTrialEnabled) {
      // SetupIntent for free trial (no immediate charge)
      const setupIntent = await stripe.setupIntents.create({
        customer: customer_id,
        payment_method_types: ["card"],
        statement_descriptor: "Slumber Pro",
      });
      client_secret = setupIntent.client_secret!;
      setup_intent = true;
      subscription_id = undefined;
    } else {
      // Subscription-first flow for non-trial
      // If planType is yearly and freeTrialEnabled, add trial_period_days
      const subscriptionParams: any = {
        customer: customer_id,
        items: [{ price: priceIds[planType] }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        statement_descriptor: "Slumber Pro",
      };
      // Defensive: if planType is yearly and freeTrialEnabled, add trial
      if (planType === 'yearly' && freeTrialEnabled) {
        subscriptionParams.trial_period_days = 3;
      }
      const subscription = await stripe.subscriptions.create(subscriptionParams);
      // Get client_secret from the subscription's invoice PaymentIntent
      client_secret = (subscription.latest_invoice as any).payment_intent.client_secret;
      subscription_id = subscription.id;
      setup_intent = false;
    }

    return new Response(
      JSON.stringify({
        client_secret,
        customer_id,
        setup_intent,
        subscription_id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const err = e as Error;
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@12.6.0";

serve(async (req) => {
  const { planType, trialEnabled, userId, stripeCustomerId, setupIntentId, paymentMethodId } = await req.json();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2022-11-15" });

  // Example plan price IDs (replace with your actual Stripe price IDs)
  const priceIds: Record<string, string> = {
    monthly: Deno.env.get("STRIPE_MONTHLY_PRICE_ID"),
    yearly: Deno.env.get("STRIPE_YEARLY_PRICE_ID"),
  };

  // Debug logging
  console.log("Incoming planType:", planType);
  console.log("Price IDs:", priceIds);
  console.log("Selected priceId:", priceIds[planType]);

  try {
    // Use provided Stripe customer ID
    if (!stripeCustomerId) {
      console.error('No stripeCustomerId provided');
      return new Response(JSON.stringify({ error: 'No stripeCustomerId provided' }), { status: 400 });
    }

    // Free trial flow: set default payment method from SetupIntent
    if (trialEnabled && setupIntentId) {
      // 1) Retrieve the SetupIntent, get the PM that was just saved
      const si = await stripe.setupIntents.retrieve(setupIntentId, { expand: ['payment_method'] });
      // 2) Make that PM the customer default for invoices
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: si.payment_method as string },
      });
      // 3) Create the subscription with a trial
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceIds[planType] }],
        trial_period_days: 3,
        expand: ['pending_setup_intent'],
      });
      console.log("Stripe subscription response (trial):", subscription);
      if (!subscription || !subscription.id) {
        console.error('Stripe subscription creation failed:', subscription);
        return new Response(JSON.stringify({ error: 'Stripe subscription creation failed', details: subscription }), { status: 400 });
      }
      return new Response(JSON.stringify({
        subscription_id: subscription.id,
        status: subscription.status
      }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Regular flow
      let pmId = paymentMethodId;
      // If not provided, try to extract from latest PaymentIntent for this customer
      if (!pmId) {
        // Find latest payment intent for this customer
        const paymentIntents = await stripe.paymentIntents.list({ customer: stripeCustomerId, limit: 1 });
        if (paymentIntents.data.length > 0) {
          pmId = paymentIntents.data[0].payment_method as string;
        }
      }
      if (pmId) {
        // Attach payment method to customer before setting as default
        try {
          await stripe.paymentMethods.attach(pmId, { customer: stripeCustomerId });
        } catch (attachErr) {
          // Ignore if already attached
          const errMsg = String((attachErr as any)?.message);
          if (!errMsg.includes('already attached')) {
            console.error('Error attaching payment method:', attachErr);
            return new Response(JSON.stringify({ error: 'Error attaching payment method', details: attachErr }), { status: 400 });
          }
        }
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: { default_payment_method: pmId },
        });
      }
      const subscriptionParams = {
        customer: stripeCustomerId,
        items: [{ price: priceIds[planType] }],
        trial_period_days: trialEnabled ? 3 : undefined,
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      };
      console.log("Stripe subscription params:", subscriptionParams);
      const subscription = await stripe.subscriptions.create(subscriptionParams);
      console.log("Stripe subscription response:", subscription);
      if (!subscription || !subscription.id) {
        console.error('Stripe subscription creation failed:', subscription);
        return new Response(JSON.stringify({ error: 'Stripe subscription creation failed', details: subscription }), { status: 400 });
      }
      return new Response(JSON.stringify({
        subscription_id: subscription.id,
        status: subscription.status
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (e) {
  // Print error stack and message for debugging
  const err = e as any;
  console.error('Subscription creation error:', err && (err.stack || err.message || err));
  return new Response(JSON.stringify({ error: err && err.message ? err.message : String(err), details: err }), { status: 400 });
  }
});

// Subscription plan IDs and metadata for Stripe
export const SUBSCRIPTION_PLANS = {
  weekly: {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 599, // price in cents
    interval: 'week',
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 9999, // price in cents
    interval: 'year',
  },
};

export default function StripeLib() {
  return null;
}

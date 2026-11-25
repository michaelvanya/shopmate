import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_build", {
  apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion,
});

export default stripe;

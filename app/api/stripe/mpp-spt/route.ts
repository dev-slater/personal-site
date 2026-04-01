import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
import { stripeErrorResponse } from "@/lib/stripe-error";

// Test: /v1/test_helpers/shared_payment/granted_tokens
// Live: /v1/shared_payment/granted_tokens
const SPT_ENDPOINT = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
  ? "/v1/shared_payment/granted_tokens"
  : "/v1/test_helpers/shared_payment/granted_tokens";

// Generates a demo Shared Payment Token (SPT) using Stripe's test helper.
// Requires a Stripe Profile to be set up under Machine Payments in the Dashboard.
//
// In production, SPTs are created by the PAYING CLIENT (machine/agent) using their
// own payment method — not by the merchant. This demo simulates the flow using a
// disposable test card so visitors can see what an SPT looks like and try it in
// the mppx CLI.
//
// Real production flow (handled by mppx/client):
//   1. Client enters card → Stripe Elements creates a PaymentMethod
//   2. Client's mppx sends PM + challenge params to this endpoint (or similar)
//   3. Server calls POST /v1/shared_payment/granted_tokens (prod) or test helper
//   4. Returns spt_... → mppx retries original request with SPT in Authorization header
//   5. Server (mppx) creates PaymentIntent with shared_payment_granted_token: spt

export async function POST(req: Request) {
  try {
    // Accept params forwarded by mppx/client's createToken callback:
    //   { paymentMethod, amount, currency, networkId, expiresAt }
    // When called from the demo UI (no body), fall back to a test card.
    const body = await req.json().catch(() => ({})) as {
      paymentMethod?: string;
      expiresAt?: number;
      amount?: string;
      currency?: string;
      networkId?: string;
      quantity?: number;
    };

    const expiresAt = body.expiresAt ?? Math.floor(Date.now() / 1000) + 3600;
    // Stripe SPT minimum is $0.50. Default to 10 widgets × $0.05 = $0.50.
    const quantity = Math.min(Math.max(body.quantity ?? 10, 10), 20);
    const amountCents = quantity * 5; // 5 cents per widget

    // Use the client-provided payment method (production/client flow).
    // Fall back to tok_visa only for the demo UI (no paymentMethod in body).
    let paymentMethodId = body.paymentMethod;
    if (!paymentMethodId) {
      const pm = await stripe.paymentMethods.create({
        type: "card",
        card: { token: "tok_visa" } as unknown as Stripe.PaymentMethodCreateParams.Card,
      });
      paymentMethodId = pm.id;
    }

    const sptResponse = await stripe.rawRequest("POST", SPT_ENDPOINT, {
      payment_method: paymentMethodId,
      "usage_limits[currency]": body.currency ?? "usd",
      "usage_limits[max_amount]": amountCents,
      "usage_limits[expires_at]": expiresAt,
      ...(body.networkId ? { "seller_details[network_id]": body.networkId } : {}),
    });

    const spt = sptResponse as unknown as {
      id: string;
      usage_limits: { currency: string; max_amount: number; expires_at: number };
    };

    // When called from the demo UI (no real card), create a separate fresh pm for the CLI
    // example — the one above was consumed by SPT creation and can't be reused.
    // When a real card pm is provided, skip this: the user completes payment via the UI instead.
    let exampleCli: string | undefined;
    if (!body.paymentMethod) {
      const cliPm = await stripe.paymentMethods.create({
        type: "card",
        card: { token: "tok_visa" } as unknown as Stripe.PaymentMethodCreateParams.Card,
      });
      exampleCli = `MPPX_STRIPE_SECRET_KEY=sk_test_... npx mppx 'https://matthewslater.xyz/api/mpp/widgets?quantity=${quantity}' -M paymentMethod=${cliPm.id}`;
    }

    return NextResponse.json({
      // `spt` key: consumed by mppx/client's createToken callback (`const { spt } = await res.json()`)
      spt: spt.id,
      // `token` key: consumed by the demo UI
      token: spt.id,
      usage_limits: spt.usage_limits,
      ...(exampleCli ? { example_cli: exampleCli } : {}),
    });
  } catch (err) {
    return stripeErrorResponse(err);
  }
}

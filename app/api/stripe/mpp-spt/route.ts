import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { stripeErrorResponse } from "@/lib/stripe-error";

// Swap for the production endpoint once Stripe Profile is approved.
const SPT_ENDPOINT = "/v1/test_helpers/shared_payment/granted_tokens";

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
  if (!process.env.NEXT_PUBLIC_STRIPE_PROFILE_ID) {
    return NextResponse.json(
      {
        error:
          "Stripe Profile not yet activated. Create one at Dashboard → Developers → Machine Payments → Profiles.",
      },
      { status: 503 }
    );
  }

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
    };

    const expiresAt = body.expiresAt ?? Math.floor(Date.now() / 1000) + 3600;

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
      "usage_limits[max_amount]": 100, // $1.00 ceiling
      "usage_limits[expires_at]": expiresAt,
    });

    const spt = sptResponse as unknown as {
      id: string;
      usage_limits: { currency: string; max_amount: number; expires_at: number };
    };

    return NextResponse.json({
      // `spt` key: consumed by mppx/client's createToken callback (`const { spt } = await res.json()`)
      spt: spt.id,
      // `token` key: consumed by the demo UI
      token: spt.id,
      usage_limits: spt.usage_limits,
      example_header: `Authorization: Bearer ${spt.id}`,
      example_cli: `npx mppx --auth ${spt.id} https://matthewslater.xyz/api/mpp/widgets?quantity=1`,
    });
  } catch (err) {
    return stripeErrorResponse(err);
  }
}

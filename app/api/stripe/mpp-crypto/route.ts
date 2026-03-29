import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripeErrorResponse } from "@/lib/stripe-error";

// Crypto PaymentIntents require the 2026-03-04.preview API version.
// Per Stripe's official sample (stripe-samples/machine-payments), the only
// supported approach is a separate client with @ts-expect-error at construction.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — preview version string not yet in SDK types
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-04.preview" });

// Shape of next_action returned for a crypto deposit PaymentIntent.
// Not yet in SDK types — confirmed from Stripe MPP docs.
interface CryptoDisplayDetails {
  deposit_addresses: {
    tempo?: {
      address: string;
      supported_tokens: Array<{
        token_currency: string;
        token_contract_address: string;
      }>;
    };
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pi = searchParams.get("pi");
    if (!pi) return NextResponse.json({ error: "Missing pi param" }, { status: 400 });
    const paymentIntent = await stripe.paymentIntents.retrieve(pi);
    return NextResponse.json({ status: paymentIntent.status, amount_received: paymentIntent.amount_received });
  } catch (err) {
    return stripeErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount_cents = Math.max(1, Math.min(1000, Number(body.amount_cents ?? 10)));

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amount_cents,
        currency: "usd",
        payment_method_types: ["crypto"],
        payment_method_data: { type: "crypto" },
        payment_method_options: {
          crypto: {
            mode: "deposit",
            deposit_options: { networks: ["tempo"] },
          } as Stripe.PaymentIntentCreateParams.PaymentMethodOptions.Crypto,
        },
        confirm: true,
      },
      { idempotencyKey: crypto.randomUUID() }
    );

    const nextAction = paymentIntent.next_action as
      | { type: string; crypto_display_details?: CryptoDisplayDetails }
      | null;
    const depositDetails = nextAction?.crypto_display_details?.deposit_addresses?.tempo;

    return NextResponse.json({
      deposit_address: depositDetails?.address ?? null,
      supported_tokens: depositDetails?.supported_tokens ?? [],
      network: "Tempo",
      amount_usd: (amount_cents / 100).toFixed(2),
      payment_intent_id: paymentIntent.id,
    });
  } catch (err) {
    return stripeErrorResponse(err);
  }
}

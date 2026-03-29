import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { stripeErrorResponse } from "@/lib/stripe-error";

// Shape of the next_action returned for a crypto deposit PaymentIntent.
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // Default $0.10 demo amount; clamp to reasonable range
    const amount_cents = Math.max(1, Math.min(1000, Number(body.amount_cents ?? 10)));

    // Create a crypto PaymentIntent using Stripe's machine payments API.
    // Requires "Stablecoins and Crypto" to be enabled on the Stripe account.
    // `mode` and `deposit_options` are not yet in SDK types — cast per Stripe docs.
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
      {
        idempotencyKey: crypto.randomUUID(),
        apiVersion: "2026-03-04.preview",
      } as Stripe.RequestOptions
    );

    // Extract deposit address from next_action.crypto_display_details
    const nextAction = paymentIntent.next_action as
      | ({ type: string; crypto_display_details?: CryptoDisplayDetails })
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

import { NextResponse } from "next/server";
import Stripe from "stripe";

export function stripeErrorResponse(err: unknown) {
  if (err instanceof Stripe.errors.StripeError) {
    return NextResponse.json(
      { error: err.message, code: err.code ?? err.type },
      { status: err.statusCode ?? 500 }
    );
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json({ error: message }, { status: 500 });
}

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(_req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 100,
          product_data: { name: "Widget", description: "SKU-0042" },
        },
      },
    ],
    success_url: `${siteUrl}/payment-demos/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/payment-demos`,
  });

  return NextResponse.json({ url: session.url });
}

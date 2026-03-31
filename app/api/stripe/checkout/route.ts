import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(_req: NextRequest) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is not set");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 50,
            product_data: { name: "Widget", description: "SKU-0042" },
          },
        },
      ],
      success_url: `${siteUrl}/payment-demos/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-demos`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

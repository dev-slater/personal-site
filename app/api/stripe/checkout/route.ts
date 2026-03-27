import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(_req: NextRequest) {
  // TODO: create a Stripe Checkout session
  // const session = await stripe.checkout.sessions.create({ ... });
  // return NextResponse.json({ url: session.url });
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

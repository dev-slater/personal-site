import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe requires the raw body for webhook signature verification.
// Next.js App Router passes the raw body via req.text() / req.arrayBuffer().

export async function POST(req: NextRequest) {
  // TODO: verify and handle Stripe webhook events
  // const body = await req.text();
  // const sig = req.headers.get("stripe-signature")!;
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  // switch (event.type) { ... }
  void req;
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

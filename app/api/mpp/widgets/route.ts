import { Mppx, stripe, tempo } from "mppx/server";

// MPP_SECRET_KEY is auto-detected from env.
// Two payment methods: Tempo USDC (mainnet) and Stripe card (requires machine payments access).
// TODO: Add tempo.session() for pay-as-you-go channel payments (coming soon).
//       Requires a server-side signing account (TEMPO_SERVER_PRIVATE_KEY) for channel management.
const mppx = Mppx.create({
  methods: [
    // Stripe first — mppx CLI picks the first challenge from WWW-Authenticate.
    // Set MPPX_STRIPE_SECRET_KEY + -M paymentMethod=pm_... to pay via card.
    stripe({
      secretKey: process.env.STRIPE_SECRET_KEY!,
      // networkId is included in the 402 challenge so mppx/client knows which
      // Stripe Profile to target when creating an SPT. Use the actual profile_...
      // ID in production; falls back to "internal" until profile is activated.
      networkId: process.env.NEXT_PUBLIC_STRIPE_PROFILE_ID ?? "internal",
      paymentMethodTypes: ["card"],
      currency: "usd",
      decimals: 2,
    }),
    tempo.charge({
      recipient: "0x458cdBCE20B710052Eb052aaB2D0322D6Bff1dE8",
      // Defaults to mainnet USDC (0x20C000000000000000000000b9537d11c60E8b50) and 6 decimals
    }),
  ],
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const quantity = Math.min(
    Math.max(parseInt(url.searchParams.get("quantity") ?? "1"), 1),
    20
  );
  const amount = (quantity * 0.05).toFixed(2);

  const description = `${quantity}x ms_dev widget`;
  const result = await mppx.compose(
    ["stripe/charge", { amount, description }],
    ["tempo/charge", { amount, currency: "0x20C000000000000000000000b9537d11c60E8b50", description }],
  )(req);

  if (result.status === 402) return result.challenge;

  const widgets = Array.from({ length: quantity }, (_, i) => ({
    id: `ms_dev_${Date.now()}_${i}`,
    sku: "ms_dev",
    name: "Widget",
  }));

  return result.withReceipt(
    Response.json({ widgets, quantity, total_charged: `${amount} usd` })
  );
}

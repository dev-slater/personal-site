export async function GET() {
  return Response.json({
    version: "1",
    endpoints: [
      {
        path: "/api/mpp/widgets",
        method: "GET",
        description: "Purchase ms_dev widget tokens",
        pricing: {
          unit_price: "0.05",
          currency: "usd",
          unit: "per widget",
          min_quantity: 1,
          max_quantity: 10,
          formula: "quantity * 0.05 usd",
        },
        params: {
          quantity: {
            type: "integer",
            default: 1,
            min: 1,
            max: 10,
            description: "Number of widget tokens to purchase",
          },
        },
        payment_methods: [
          {
            method: "tempo",
            intent: "charge",
            currency: "USDC",
            token_address: "0x20C000000000000000000000b9537d11c60E8b50",
            network: "Tempo mainnet",
          },
          {
            method: "stripe",
            intent: "charge",
            currency: "usd",
            payment_method_types: ["card"],
            note: "Requires Stripe machine payments access",
          },
        ],
      },
    ],
  });
}

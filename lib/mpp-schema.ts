export const MPP_SCHEMA = {
  endpoint: "/api/mpp/widgets",
  method: "GET",
  description: "Purchase ms_dev widget tokens. Returns a JSON array of widget objects.",
  params: {
    quantity: {
      type: "integer",
      default: 1,
      min: 1,
      max: 10,
      description: "Number of widget tokens to purchase",
    },
  },
  pricing: {
    unit_price: "0.05",
    currency: "usd",
    unit: "per widget",
    min_quantity: 1,
    max_quantity: 10,
    formula: "quantity * 0.05 usd",
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
      type: "spt",
      currency: "usd",
      payment_method_types: ["card"],
      note: "Requires Stripe machine payments access",
    },
    {
      method: "stripe",
      intent: "charge",
      type: "crypto",
      currency: "usd",
      network: "Tempo",
      endpoint: "/api/stripe/mpp-crypto",
      note: "Stripe-managed deposit address; on-chain settlement via Tempo",
    },
  ],
  example_requests: [
    {
      description: "Buy 1 widget (default)",
      command: 'tempo request "https://matthewslater.xyz/api/mpp/widgets"',
    },
    {
      description: "Buy 3 widgets",
      command: 'tempo request "https://matthewslater.xyz/api/mpp/widgets?quantity=3"',
    },
  ],
  discovery: {
    machine_readable: "/.well-known/mpp.json",
    human_readable: "/api/mpp/widgets/docs",
  },
} as const;

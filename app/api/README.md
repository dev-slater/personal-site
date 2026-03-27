# API Routes

Payment and integration endpoints live here.

## Planned routes

### Stripe
- `POST /api/stripe/checkout` — create a Stripe Checkout session
- `POST /api/stripe/webhook` — handle Stripe webhook events (use raw body)

### Tempo MPP
- `POST /api/mpp/[endpoint]` — pay-per-use API endpoints gated by Tempo MPP

## Setup (when ready)

```bash
npm install stripe @stripe/stripe-js
```

Add to Vercel environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ANTHROPIC_API_KEY` (for MPP/agent features)

Reference: `/Users/mslater/Desktop/code/agent-with-wallet-template/` for MPP integration patterns.

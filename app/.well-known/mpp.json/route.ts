import { MPP_SCHEMA } from "@/lib/mpp-schema";

export async function GET() {
  return Response.json({
    version: "1",
    endpoints: [
      {
        path: MPP_SCHEMA.endpoint,
        method: MPP_SCHEMA.method,
        description: MPP_SCHEMA.description,
        pricing: MPP_SCHEMA.pricing,
        params: MPP_SCHEMA.params,
        payment_methods: MPP_SCHEMA.payment_methods,
      },
    ],
  });
}

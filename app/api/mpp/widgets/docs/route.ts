import { MPP_SCHEMA } from "@/lib/mpp-schema";

export async function GET() {
  return Response.json(MPP_SCHEMA);
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Le March\u00e9 Africain API",
    version: "1.0.0",
    status: "operational",
    endpoints: [
      "GET /api/categories",
      "GET /api/products",
      "GET /api/products/:slug",
      "GET /api/search?q=&category=&minPrice=&maxPrice=",
      "POST /api/orders",
      "GET /api/orders/:orderNumber",
      "POST /api/coupons/validate",
      "GET /api/stats",
    ],
  });
}

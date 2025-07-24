// /api/payment-status.ts
import { getOrderByIntent } from "@/services/ticket.service";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const payment_intent = searchParams.get("payment_intent");

  if (!payment_intent) {
    return NextResponse.json(
      { error: "Missing payment_intent" },
      { status: 400 }
    );
  }

  // Option 1: Check from your database
  const order = await getOrderByIntent(payment_intent);

  if (!order) {
    return NextResponse.json({ message: "not created" });
  }

  return NextResponse.json(order);
}

// app/api/cards/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    options: [
      { label: "신용카드222", value: "credit" },
      { label: "체크카드", value: "debit" },
      { label: "기프트카드", value: "gift" },
      { label: "서울역", value: "939393" },
      { label: "20230505", value: "rt001" },
    ],
  });
}

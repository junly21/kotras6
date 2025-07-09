import { NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    // Mock 거래일자 데이터 (3개)
    const dates = [
      { value: "2024-01-15", label: "2024년 1월 15일" },
      { value: "2024-01-16", label: "2024년 1월 16일" },
      { value: "2024-01-17", label: "2024년 1월 17일" },
    ];

    return NextResponse.json(
      { options: dates },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("거래일자 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    // Mock 카드구분 데이터
    const cardTypes = [
      { value: "선후불권", label: "선후불권" },
      { value: "정기권", label: "정기권" },
      { value: "1회권", label: "1회권" },
    ];

    return NextResponse.json(
      { options: cardTypes },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("카드구분 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

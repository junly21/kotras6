import { NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    // Mock 기관 데이터 (13개)
    const agencies = [
      { value: "용인경전철", label: "용인경전철" },
      { value: "공항철도", label: "공항철도" },
      { value: "새서울철도", label: "새서울철도" },
      { value: "인천교통공사", label: "인천교통공사" },
      { value: "서울시메트로9호선", label: "서울시메트로9호선" },
      { value: "의정부경전철", label: "의정부경전철" },
      { value: "서울교통공사", label: "서울교통공사" },
      { value: "김포시청", label: "김포시청" },
      { value: "한국철도공사", label: "한국철도공사" },
      { value: "우이신설경전철", label: "우이신설경전철" },
      { value: "신림선", label: "신림선" },
      { value: "신분당선", label: "신분당선" },
      { value: "경기철도", label: "경기철도" },
    ];

    return NextResponse.json(
      { options: agencies },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("기관 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

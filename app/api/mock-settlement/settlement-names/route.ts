import { NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

// Mock 정산명 목록 데이터
const mockSettlementNames = [
  { label: "2024년 1월 정산", value: "2024년 1월 정산" },
  { label: "2024년 2월 정산", value: "2024년 2월 정산" },
  { label: "2024년 3월 정산", value: "2024년 3월 정산" },
  { label: "2024년 4월 정산", value: "2024년 4월 정산" },
  { label: "2024년 5월 정산", value: "2024년 5월 정산" },
  { label: "2024년 6월 정산", value: "2024년 6월 정산" },
  { label: "2024년 7월 정산", value: "2024년 7월 정산" },
  { label: "2024년 8월 정산", value: "2024년 8월 정산" },
  { label: "2024년 9월 정산", value: "2024년 9월 정산" },
  { label: "2024년 10월 정산", value: "2024년 10월 정산" },
  { label: "2024년 11월 정산", value: "2024년 11월 정산" },
  { label: "2024년 12월 정산", value: "2024년 12월 정산" },
];

export async function GET() {
  try {
    console.log("정산명 목록 API 호출됨 (GET)");

    // Mock 데이터 사용 (실제 백엔드가 없을 때)
    const mockResponse = {
      options: mockSettlementNames,
    };

    console.log("Mock API 정산명 목록 결과:", mockResponse);

    return NextResponse.json(mockResponse, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("정산명 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

export async function POST() {
  try {
    console.log("정산명 목록 API 호출됨 (POST)");

    // Mock 데이터 사용 (실제 백엔드가 없을 때)
    const mockResponse = {
      options: mockSettlementNames,
    };

    console.log("Mock API 정산명 목록 결과:", mockResponse);

    return NextResponse.json(mockResponse, { headers: createCorsHeaders() });

    // 실제 백엔드가 있을 때는 아래 코드 사용
    /*
    const { data } = await callExternalApi("selectSettlementNameList.do", {
      method: "POST",
      body: {},
    });

    console.log("외부 API 정산명 목록 결과:", data);

    return NextResponse.json(data, { headers: createCorsHeaders() });
    */
  } catch (error) {
    console.error("정산명 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

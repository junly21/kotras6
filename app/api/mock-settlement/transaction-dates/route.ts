import { NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

// Mock 거래일자 목록 데이터
const mockTransactionDates = [
  { label: "2024-01-15", value: "2024-01-15" },
  { label: "2024-02-15", value: "2024-02-15" },
  { label: "2024-03-15", value: "2024-03-15" },
  { label: "2024-04-15", value: "2024-04-15" },
  { label: "2024-05-15", value: "2024-05-15" },
  { label: "2024-06-15", value: "2024-06-15" },
  { label: "2024-07-15", value: "2024-07-15" },
  { label: "2024-08-15", value: "2024-08-15" },
  { label: "2024-09-15", value: "2024-09-15" },
  { label: "2024-10-15", value: "2024-10-15" },
  { label: "2024-11-15", value: "2024-11-15" },
  { label: "2024-12-15", value: "2024-12-15" },
];

export async function GET() {
  try {
    console.log("거래일자 목록 API 호출됨 (GET)");

    // Mock 데이터 사용 (실제 백엔드가 없을 때)
    const mockResponse = {
      options: mockTransactionDates,
    };

    console.log("Mock API 거래일자 목록 결과:", mockResponse);

    return NextResponse.json(mockResponse, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("거래일자 목록 API 처리 중 오류 발생:", error);
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
    console.log("거래일자 목록 API 호출됨 (POST)");

    // Mock 데이터 사용 (실제 백엔드가 없을 때)
    const mockResponse = {
      options: mockTransactionDates,
    };

    console.log("Mock API 거래일자 목록 결과:", mockResponse);

    return NextResponse.json(mockResponse, { headers: createCorsHeaders() });

    // 실제 백엔드가 있을 때는 아래 코드 사용
    /*
    const { data } = await callExternalApi("selectTransactionDateList.do", {
      method: "POST",
      body: {},
    });

    console.log("외부 API 거래일자 목록 결과:", data);

    return NextResponse.json(data, { headers: createCorsHeaders() });
    */
  } catch (error) {
    console.error("거래일자 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

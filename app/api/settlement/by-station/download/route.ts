import { NextRequest, NextResponse } from "next/server";
import {
  createCorsHeaders,
  EXTERNAL_BASE_URL,
} from "../../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("역사별 정산 CSV 다운로드 API 호출됨");
    console.log("Body:", body);

    // 외부 API에서 CSV 다운로드 요청 - 직접 fetch 사용
    const externalUrl = `${EXTERNAL_BASE_URL}/downLoadPayRecvNode.do`;

    const response = await fetch(externalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvData = await response.text();
    const contentType = response.headers.get("content-type");

    console.log("외부 API CSV 다운로드 응답:", {
      contentType,
      dataLength: csvData.length,
    });

    // CSV 응답인 경우 파일 다운로드로 처리
    if (contentType && contentType.includes("text/csv")) {
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            "attachment; filename=settlement_by_station.csv",
          ...createCorsHeaders(),
        },
      });
    }

    // CSV가 아닌 경우 에러
    return NextResponse.json(
      { error: "CSV 데이터가 아닙니다." },
      { status: 400, headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("역사별 정산 CSV 다운로드 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

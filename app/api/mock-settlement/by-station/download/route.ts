import { NextRequest, NextResponse } from "next/server";
import {
  createCorsHeaders,
  EXTERNAL_BASE_URL,
} from "../../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { settlementName, STN_ID1, STN_ID2, STN_ID3, STN_ID4, STN_ID5 } =
      await request.json();
    console.log("모의정산 역사별 CSV 다운로드 API 호출됨");
    console.log("Body:", {
      settlementName,
      STN_ID1,
      STN_ID2,
      STN_ID3,
      STN_ID4,
      STN_ID5,
    });

    if (!settlementName) {
      return NextResponse.json(
        { success: false, error: "정산명이 필요합니다." },
        { status: 400 }
      );
    }

    // 외부 API에서 CSV 다운로드 요청 - 직접 fetch 사용
    const externalUrl = `${EXTERNAL_BASE_URL}/downLoadSimPayRecvNode.do`;

    const response = await fetch(externalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        SIM_STMT_GRP_ID: settlementName,
        STN_ID1: STN_ID1 || "",
        STN_ID2: STN_ID2 || "",
        STN_ID3: STN_ID3 || "",
        STN_ID4: STN_ID4 || "",
        STN_ID5: STN_ID5 || "",
      }),
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
            "attachment; filename=mock_settlement_by_station.csv",
          ...createCorsHeaders(),
        },
      });
    }

    // CSV가 아닌 경우 에러
    return NextResponse.json(
      { error: "CSV 데이터가 아닙니다." },
      { status: 400 }
    );
  } catch (error) {
    console.error("모의정산 역사별 CSV 다운로드 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

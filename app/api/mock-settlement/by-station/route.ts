import { NextRequest, NextResponse } from "next/server";
import { callExternalApi } from "@/app/api/utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { settlementName, STN_ID1, STN_ID2, STN_ID3, STN_ID4, STN_ID5 } =
      await request.json();
    console.log("모의정산 역사별 조회 API 호출됨");
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

    // 외부 API 호출
    console.log("외부 API selectSimPayRecvNode.do 호출 시작");
    const { data } = await callExternalApi("selectSimPayRecvNode.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: settlementName,
        STN_ID1: STN_ID1 || "",
        STN_ID2: STN_ID2 || "",
        STN_ID3: STN_ID3 || "",
        STN_ID4: STN_ID4 || "",
        STN_ID5: STN_ID5 || "",
      },
    });
    console.log("외부 API selectSimPayRecvNode.do 응답 받음:", data);

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "데이터 형식이 올바르지 않습니다." },
        { status: 500 }
      );
    }

    // 정산결과 데이터 매핑 (정산결과>역사별 조회와 동일한 구조)
    const arrayData = Array.isArray(data) ? data : [data];

    const normalized = arrayData.map((item: Record<string, unknown>) => ({
      stn_nm: (item?.["stn_nm"] as string) ?? "-",
      ...item, // 나머지 모든 필드를 그대로 유지
    }));

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error("모의정산 역사별 조회 API 오류:", error);
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

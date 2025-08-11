import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { settlementName, STN_ID1, STN_ID2 } = await request.json();

    if (!settlementName || !STN_ID1 || !STN_ID2) {
      return NextResponse.json(
        { error: "정산명, 출발역, 도착역이 모두 필요합니다." },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    console.log("모의정산 OD별 조회 요청:", {
      settlementName,
      STN_ID1,
      STN_ID2,
    });

    // 외부 API 호출
    const { data } = await callExternalApi("selectSimPayRecvOD.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: settlementName,
        RIDE_STN_ID: STN_ID1,
        ALGH_STN_ID: STN_ID2,
      },
    });

    console.log("외부 API 모의정산 OD별 조회 결과:", data);

    return NextResponse.json(data || [], { headers: createCorsHeaders() });
  } catch (error) {
    console.error("모의정산 OD별 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { settlementName, STN_ID1, STN_ID2 } = await request.json();

    // settlementName이 없으면 빈 문자열로 기본값 설정
    const finalSettlementName = settlementName || "";

    // 출발역과 도착역은 여전히 필수
    if (!STN_ID1 || !STN_ID2) {
      return NextResponse.json(
        { error: "출발역과 도착역이 모두 필요합니다." },
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
        SIM_STMT_GRP_ID: finalSettlementName,
        RIDE_STN_ID: STN_ID1,
        ALGH_STN_ID: STN_ID2,
      },
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
    });

    console.log("by-od 외부 API 응답:", data?.length || 0, "개");

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

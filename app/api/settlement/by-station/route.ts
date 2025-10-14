import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { SettlementByStationFilters } from "@/types/settlementByStation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("역사별 정산 조회 API 호출됨");
    console.log("Body:", body);

    const filter: SettlementByStationFilters = {
      stmtGrpId: body.stmtGrpId || "",
      STN_ID1: body.STN_ID1 || "",
      STN_ID2: body.STN_ID2 || "",
      STN_ID3: body.STN_ID3 || "",
      STN_ID4: body.STN_ID4 || "",
      STN_ID5: body.STN_ID5 || "",
    };

    // 외부 API에서 역사별 정산 데이터 조회
    const { data } = await callExternalApi("selectPayRecvNode.do", {
      method: "POST",
      body: {
        ...filter,
        STMT_GRP_ID: filter.stmtGrpId, // STMT_GRP_ID로 매핑
      },
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
    });

    console.log("외부 API 역사별 정산 결과:", data);

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("역사별 정산 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

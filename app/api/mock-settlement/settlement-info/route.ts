import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { simStmtGrpId } = await request.json();

    if (!simStmtGrpId) {
      return NextResponse.json(
        { error: "정산 ID가 필요합니다." },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    console.log("모의정산 정보 조회 요청:", { simStmtGrpId });

    // 외부 API 호출
    const { data } = await callExternalApi("selectSimPayRecvInfo.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: simStmtGrpId,
      },
    });

    console.log("외부 API 모의정산 정보 결과:", data);

    // 응답 데이터 변환 - 원본 데이터 그대로 전달
    if (Array.isArray(data) && data.length > 0) {
      // 원본 데이터 그대로 반환 (가공하지 않음)
      return NextResponse.json(data, {
        headers: createCorsHeaders(),
      });
    }

    return NextResponse.json([], { headers: createCorsHeaders() });
  } catch (error) {
    console.error("모의정산 정보 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

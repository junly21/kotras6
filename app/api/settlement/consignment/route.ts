import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("위탁구간 조회 API 호출됨:", body);

    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    // 소문자 필드명을 대문자로 변환
    const apiBody = {
      OPER_ID: body.oper_id,
      // STMT_GRP_ID: body.stmtGrpId,
      STMT_GRP_ID: "SG002",
      LINE_CD: body.lineCd,
      TARGET_OPER_ID: body.targetOperId,
    };

    const { data } = await callExternalApi("selectPayRecvConsign.do", {
      method: "POST",
      body: apiBody,
      sessionId: extSid, // 세션 ID 전달
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
    });

    console.log("위탁구간 조회 결과:", data);

    return NextResponse.json({ data }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("위탁구간 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

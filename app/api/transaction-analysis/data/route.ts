import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("거래내역 분석 데이터 API 호출됨");
    console.log("Body:", body);

    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    // body 안의 params 객체에서 agency 추출
    const agency = body.params?.agency || "ALL";
    console.log("Selected agency:", agency);

    // sessionId를 직접 전달하여 세션 쿠키 설정
    const { data } = await callExternalApi("selectCntODPairStatsList.do", {
      method: "POST",
      body: {
        OPER_ID: agency,
      },
      sessionId: extSid, // 세션 ID 전달
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("거래내역 분석 데이터 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

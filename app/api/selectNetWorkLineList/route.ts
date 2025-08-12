import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    console.log("selectNetWorkLineList API 호출됨");
    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    const body = await request.json();
    console.log("selectNetWorkLineList 요청 데이터:", body);

    const { data } = await callExternalApi("selectNetWorkLineList.do", {
      method: "POST",
      body: {
        NET_DT: body.NET_DT,
      },
      sessionId: extSid, // 세션 ID 전달
    });

    return NextResponse.json(data, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("selectNetWorkLineList API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

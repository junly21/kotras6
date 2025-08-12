import { NextRequest, NextResponse } from "next/server";
import {
  callExternalApi,
  createCorsHeaders,
} from "@/app/api/utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    const { network, networkLabel, lineLabel } = await request.json();

    // 외부 API에 POST 요청
    const { data } = await callExternalApi("selectNetWorkLineList.do", {
      method: "POST",
      body: {
        NET_DT: network,
        OPER_NM: networkLabel,
        SUBWAY: lineLabel,
      },
      sessionId: extSid, // 세션 ID 전달
    });

    return NextResponse.json({ data }, { headers: createCorsHeaders() });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

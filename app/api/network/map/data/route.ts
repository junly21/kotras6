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
    const { network, line, networkLabel } = await request.json();

    if (!network || !line || !networkLabel) {
      return NextResponse.json(
        { error: "network, line, networkLabel 값이 필요합니다." },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // 외부 API에 POST 요청 (노드 목록)
    const { data: nodeData } = await callExternalApi(
      "selectNetWorkNodeList.do",
      {
        method: "POST",
        body: {
          NET_DT: network,
          OPER_NM: networkLabel,
          SUBWAY: line,
        },
        sessionId: extSid, // 세션 ID 전달
        request, // 클라이언트 IP 추출을 위한 request 객체 전달
      }
    );
    console.log("[selectNetWorkNodeList.do] nodeData:", nodeData);

    // 외부 API에 POST 요청 (노선 상세 목록)
    const { data: lineData } = await callExternalApi(
      "selectNetWorkLineList.do",
      {
        method: "POST",
        body: {
          NET_DT: network,
          OPER_NM: networkLabel,
          SUBWAY: line,
        },
      }
    );

    return NextResponse.json(
      { nodeData, lineData },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

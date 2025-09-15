import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    const body = await request.json();
    const { type } = body;

    let data;

    switch (type) {
      case "network-nodes":
        // stations API를 재사용하여 역 목록 가져오기
        const stationsResponse = await fetch(
          `${request.nextUrl.origin}/api/selectNetWorkNodeList`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!stationsResponse.ok) {
          throw new Error(`HTTP error! status: ${stationsResponse.status}`);
        }

        const stationsData = await stationsResponse.json();
        data = stationsData.options || [];
        break;

      case "network-lines":
        const { data: lineData } = await callExternalApi(
          "selectNetWorkLineList.do",
          {
            method: "POST",
            body: {
              NET_DT: "LATEST",
            },
            sessionId: extSid, // 세션 ID 전달
            request, // 클라이언트 IP 추출을 위한 request 객체 전달
          }
        );
        data = lineData;
        break;

      case "card-stats":
        const { data: cardData } = await callExternalApi(
          "selectCntStatsList.do",
          {
            method: "POST",
            body: {
              COMMON_CODE: "CARD_DIV",
            },
            request, // 클라이언트 IP 추출을 위한 request 객체 전달
          }
        );
        data = cardData;
        break;

      case "od-pair-stats":
        const { data: odData } = await callExternalApi(
          "selectCntODPairStatsList.do",
          {
            method: "POST",
            body: {},
            request, // 클라이언트 IP 추출을 위한 request 객체 전달
          }
        );
        data = odData;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid request type" },
          { status: 400, headers: createCorsHeaders() }
        );
    }

    return NextResponse.json(
      { success: true, data },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("Main API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

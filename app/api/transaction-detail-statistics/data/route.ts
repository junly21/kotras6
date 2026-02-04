import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("상세통계 데이터 API 호출됨");
    console.log("Body:", body);

    const extSid = request.cookies.get("ext_sid")?.value;
    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    const tradeDates = body.params?.tradeDates ?? [];
    const lineNms = body.params?.lineNms ?? [];
    const agency = body.params?.agency ?? "";
    const stationDiv = body.params?.stationDiv ?? "";
    const cardType = body.params?.cardType ?? "N";

    console.log("Selected filters:", {
      tradeDates,
      lineNms,
      agency,
      stationDiv,
      cardType,
    });

    const { data } = await callExternalApi("selectODConvStnCnt.do", {
      method: "POST",
      body: {
        RIDE_OPRN_DT_LIST: tradeDates,
        LINE_NM_LIST: lineNms,
        OPER_ID: agency,
        RIDE_DIV: stationDiv,
        CARD_SHOW_DIV: cardType,
      },
      sessionId: extSid,
      request,
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("상세통계 데이터 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

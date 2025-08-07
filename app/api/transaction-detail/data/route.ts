import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("상세조회 데이터 API 호출됨");
    console.log("Body:", body);

    // body 안의 params 객체에서 필터 추출
    const tradeDate = body.params?.tradeDate || "";
    const cardType = body.params?.cardType || "";
    const agency = body.params?.agency || "";
    const line = body.params?.line || "";
    const stationDiv = body.params?.stationDiv || "";
    const stations = body.params?.stations || [];

    console.log("Selected filters:", {
      tradeDate,
      cardType,
      agency,
      line,
      stationDiv,
      stations,
    });

    const { data } = await callExternalApi("selectODConvList.do", {
      method: "POST",
      body: {
        RIDE_OPRN_DT: tradeDate,
        CARD_DIV: cardType,
        OPER_NM: agency,
        LINE_NM: line,
        STN_DIV: stationDiv,
        STN_ID_LIST: stations,
      },
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("상세조회 데이터 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

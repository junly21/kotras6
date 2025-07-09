import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("거래내역 분석 데이터 API 호출됨");
    console.log("Body:", body);

    // body 안의 params 객체에서 agency 추출
    const agency = body.params?.agency || "ALL";
    console.log("Selected agency:", agency);

    const { data } = await callExternalApi("selectCntStatsList.do", {
      method: "POST",
      body: {
        OPER_ID: agency,
      },
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

import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("OD별 정산 조회 API 호출됨");
    console.log("Body:", body);

    // 외부 API 파라미터로 변환
    const externalApiBody = {
      RIDE_STN_ID: body.STN_ID1 || "",
      ALGH_STN_ID: body.STN_ID2 || "",
    };

    // 외부 API에서 OD별 정산 데이터 조회
    const { data } = await callExternalApi("selectPayRecvOD.do", {
      method: "POST",
      body: externalApiBody,
    });

    console.log("외부 API OD별 정산 결과:", data);

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("OD별 정산 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

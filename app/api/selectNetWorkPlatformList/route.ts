import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("selectNetWorkPlatformList API 호출됨");

    const body = await request.json();
    console.log("selectNetWorkPlatformList 요청 데이터:", body);

    const { data } = await callExternalApi("selectNetWorkPlatformList.do", {
      method: "POST",
      body: {
        NET_DT: body.NET_DT,
      },
    });

    return NextResponse.json(data, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("selectNetWorkPlatformList API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

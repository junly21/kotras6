import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { RouteSearchFilter } from "@/types/routeSearch";

export async function POST(request: Request) {
  try {
    console.log("경로탐색 결과 API 호출됨");

    const body = await request.json();
    console.log("Body:", body);

    const filter: RouteSearchFilter = {
      PATH_GRP_ID: body.PATH_GRP_ID,
      RIDE_STN_ID: body.RIDE_STN_ID,
      ALGH_STN_ID: body.ALGH_STN_ID,
    };

    // 외부 API에서 경로탐색 결과 조회 (원래 API 사용)
    const { data } = await callExternalApi("selectPathResultCntTestPage.do", {
      method: "POST",
      body: filter,
    });

    console.log("외부 API 경로탐색 결과:", data);

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("경로탐색 결과 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

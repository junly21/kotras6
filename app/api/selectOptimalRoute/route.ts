import { NextResponse } from "next/server";
import { callOptimalRouteApi, createCorsHeaders } from "../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("selectOptimalRoute API 호출됨");

    const body = await request.json();
    console.log("selectOptimalRoute 요청 데이터:", body);

    const result = await callOptimalRouteApi("api/generate-path", {
      method: "POST",
      // body: {
      //   start_station: body.start_station,
      //   end_station: body.end_station,
      //   network_timestamp: body.network_timestamp,
      // },
      body: {
        start_station: "(경부선)1_서울(1001)",
        end_station: "(신분당선)S_강남(4307)",
        network_timestamp: "0730_1027",
      },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "최적경로 조회 실패",
          details: result.error,
        },
        { status: 500, headers: createCorsHeaders() }
      );
    }

    return NextResponse.json(result.data, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("selectOptimalRoute API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

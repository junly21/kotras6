import { NextResponse } from "next/server";
import { callOptimalRouteApi, createCorsHeaders } from "../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("selectOptimalRoute API 호출됨");

    const body = await request.json();
    console.log("selectOptimalRoute 요청 데이터:", body);

    // FilterForm에서 전달되는 데이터 구조:
    // - start_station: 출발역 value
    // - end_station: 도착역 value
    // - network_timestamp: 네트워크 value (NET_DT)

    if (!body.start_station || !body.end_station || !body.network_timestamp) {
      return NextResponse.json(
        {
          error: "필수 파라미터가 누락되었습니다",
          details: "start_station, end_station, network_timestamp가 필요합니다",
        },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // 외부 API 호출 - FilterForm에서 전달된 값을 그대로 사용
    const result = await callOptimalRouteApi("api/generate-path", {
      method: "POST",
      body: {
        start_station: body.start_station,
        end_station: body.end_station,
        network_timestamp: body.network_timestamp,
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

import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    console.log("route-search/stations API 호출됨 (GET)");

    // GET 요청으로는 출발역 목록을 반환
    const { data } = await callExternalApi("selectPathListRideSelectBox.do", {
      method: "POST",
      body: {}, // 빈 POST 요청
    });

    console.log("출발역 API 응답:", data);

    return NextResponse.json(
      { options: data || [] },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("route-search/stations API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("route-search/stations API 호출됨 (POST)");

    const body = await request.json();
    console.log("route-search/stations 요청 데이터:", body);

    // 출발역 ID가 있으면 도착역 목록을 요청
    if (body.RIDE_STN_ID) {
      const { data } = await callExternalApi("selectPathListAlghSelectBox.do", {
        method: "POST",
        body: {
          RIDE_STN_ID: body.RIDE_STN_ID,
        },
      });

      console.log("도착역 API 응답:", data);

      return NextResponse.json(
        { options: data || [] },
        { headers: createCorsHeaders() }
      );
    } else {
      // 출발역 ID가 없으면 출발역 목록을 요청
      const { data } = await callExternalApi("selectPathListRideSelectBox.do", {
        method: "POST",
        body: {},
      });

      console.log("출발역 API 응답:", data);

      return NextResponse.json(
        { options: data || [] },
        { headers: createCorsHeaders() }
      );
    }
  } catch (error) {
    console.error("route-search/stations API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

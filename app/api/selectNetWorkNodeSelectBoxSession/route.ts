import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";

export async function GET(request: NextRequest) {
  try {
    console.log("selectNetWorkNodeSelectBoxSession API 호출됨 (GET)");
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);
    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }
    const { data } = await callExternalApi(
      "selectNetWorkNodeSelectBoxSession.do",
      {
        method: "POST",
        body: {
          NET_DT: "LATEST",
        },
        sessionId: extSid, // 세션 ID 전달
      }
    );

    // console.log("외부 API 응답:", data);

    // 외부 API 응답을 그대로 반환
    return NextResponse.json(
      { options: data || [] },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error(
      "selectNetWorkNodeSelectBoxSession API 처리 중 오류 발생:",
      error
    );
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
    console.log("selectNetWorkNodeSelectBoxSession API 호출됨 (POST)");

    const body = await request.json();
    console.log("selectNetWorkNodeSelectBoxSession 요청 데이터:", body);

    const { data } = await callExternalApi(
      "selectNetWorkNodeSelectBoxSession.do",
      {
        method: "POST",
        body: {
          NET_DT: body.NET_DT || "LATEST",
        },
      }
    );

    // console.log("외부 API 응답:", data);

    // 외부 API 응답을 그대로 반환
    return NextResponse.json(
      { options: data || [] },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error(
      "selectNetWorkNodeSelectBoxSession API 처리 중 오류 발생:",
      error
    );
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

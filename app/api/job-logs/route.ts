import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("작업로그 목록 API 호출됨");

    const body = await request.json();
    console.log("작업로그 목록 요청 데이터:", body);

    const { data } = await callExternalApi("selectJobLogList.do", {
      method: "POST",
      body: {
        PROCESS_DIV: body.processDiv || "",
      },
    });

    return NextResponse.json(data, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("작업로그 목록 API 처리 중 오류 발생:", error);
    // 에러 발생 시에도 빈 배열 반환
    return NextResponse.json([], { headers: createCorsHeaders() });
  }
}

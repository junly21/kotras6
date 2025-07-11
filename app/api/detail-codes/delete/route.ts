import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("상세코드 삭제 API 호출됨");

    const body = await request.json();
    console.log("상세코드 삭제 요청 데이터:", body);

    await callExternalApi("deleteDetailCode.do", {
      method: "POST",
      body,
    });

    return NextResponse.json(
      { success: true },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("상세코드 삭제 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "상세코드 삭제에 실패했습니다." },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    console.log("기관 목록 API 호출됨");

    const { data } = await callExternalApi("getSelectBox.do", {
      method: "POST",
      body: {
        COMMON_CODE: "OPER_ID",
      },
    });

    // data가 배열인지 확인하고, 아니면 빈 배열 반환
    const options = Array.isArray(data) ? data : [];

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("기관 목록 API 처리 중 오류 발생:", error);
    // 에러 발생 시에도 빈 배열 반환
    return NextResponse.json({ options: [] }, { headers: createCorsHeaders() });
  }
}

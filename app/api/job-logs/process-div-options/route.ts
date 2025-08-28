import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    console.log("프로세스구분 옵션 API 호출됨");

    const { data } = await callExternalApi("getSelectBox.do", {
      method: "POST",
      body: {
        COMMON_CODE: "PROCESS_DIV",
      },
    });

    // data가 배열인지 확인하고, 아니면 빈 배열 반환
    const options = Array.isArray(data) ? data : [];

    return NextResponse.json(
      { options: options },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("프로세스구분 옵션 API 처리 중 오류 발생:", error);
    // 에러 발생 시 빈 배열 반환
    return NextResponse.json(
      {
        options: [],
      },
      { headers: createCorsHeaders() }
    );
  }
}

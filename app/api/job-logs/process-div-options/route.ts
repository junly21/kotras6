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

    // "전체" 옵션을 맨 위에 추가
    const optionsWithAll = [{ label: "전체", value: "ALL" }, ...options];

    return NextResponse.json(
      { options: optionsWithAll },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("프로세스구분 옵션 API 처리 중 오류 발생:", error);
    // 에러 발생 시에도 "전체" 옵션만 포함하여 반환
    return NextResponse.json(
      {
        options: [{ label: "전체", value: "ALL" }],
      },
      { headers: createCorsHeaders() }
    );
  }
}

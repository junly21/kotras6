import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET(request: Request) {
  try {
    console.log("공통 기관 목록 API 호출됨");

    // URL에서 쿼리 파라미터 확인
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("includeAll") === "true";

    const { data } = await callExternalApi("getSelectBox.do", {
      method: "POST",
      body: {
        COMMON_CODE: "OPER_ID",
      },
    });

    // data가 배열인지 확인하고, 아니면 빈 배열 반환
    const options = Array.isArray(data) ? data : [];

    // includeAll이 true일 때만 "전체" 옵션 추가
    const finalOptions = includeAll
      ? [{ label: "전체", value: "ALL" }, ...options]
      : options;

    return NextResponse.json(
      { options: finalOptions },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("공통 기관 목록 API 처리 중 오류 발생:", error);

    // 에러 발생 시에도 includeAll에 따라 반환
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("includeAll") === "true";

    const errorOptions = includeAll ? [{ label: "전체", value: "ALL" }] : [];

    return NextResponse.json(
      {
        options: errorOptions,
      },
      { headers: createCorsHeaders() }
    );
  }
}

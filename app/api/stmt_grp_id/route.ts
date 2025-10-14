import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";

export async function GET() {
  try {
    console.log("STMT_GRP_ID 옵션 조회 API 호출됨");

    const { data } = await callExternalApi("getSelectBox.do", {
      method: "POST",
      body: {
        COMMON_CODE: "STMT_GRP_ID",
      },
    });

    console.log("STMT_GRP_ID 옵션 조회 결과:", data);

    // 응답 데이터를 options 형태로 변환
    const options = Array.isArray(data)
      ? data.map((item: any) => ({
          value: item.CODE_VALUE || item.value || item.code,
          label: item.CODE_NAME || item.label || item.name,
        }))
      : [];

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("STMT_GRP_ID 옵션 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

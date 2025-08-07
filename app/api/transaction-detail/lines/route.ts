import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("노선 목록 API 호출됨");

    const body = await request.json();
    console.log("노선 목록 요청 데이터:", body);

    // 상세조회에서는 agency가 기관명 label이므로 그대로 사용
    const { data } = await callExternalApi("/selectNetWorkLineSelectBox.do", {
      method: "POST",
      body: {
        OPER_NM: body.agency,
        NET_DT: "LATEST",
      },
    });

    console.log("외부 API 응답:", data);

    // data가 배열인지 확인하고, 아니면 빈 배열 반환
    const options = Array.isArray(data) ? data : [];

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("노선 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        options: [],
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    console.log("노선 목록 API 호출됨");

    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    const body = await request.json();
    console.log("노선 목록 요청 데이터:", body);

    // 상세조회에서는 agency가 기관명 label이므로 그대로 사용
    const { data } = await callExternalApi("/selectNetWorkLineSelectBox.do", {
      method: "POST",
      body: {
        OPER_NM: body.agency,
        NET_DT: "LATEST",
      },
      sessionId: extSid, // 세션 ID 전달
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
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

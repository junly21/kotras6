import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("LINE_CD 옵션 조회 API 호출됨");

    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    // URL에서 oper_id 파라미터 추출
    const { searchParams } = new URL(request.url);
    const operId = searchParams.get("oper_id");

    const { data } = await callExternalApi("sessionGetLineCDSelectBox.do", {
      method: "POST",
      body: {
        OPER_ID: operId,
      },
      sessionId: extSid, // 세션 ID 전달
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
    });

    console.log("LINE_CD 옵션 조회 결과:", data);

    // 응답 데이터를 options 형태로 변환
    const options = Array.isArray(data)
      ? data
          .filter((item: any) => {
            // 현재 선택된 oper_id와 같은 값은 제외
            const itemValue = item.CODE_VALUE || item.value || item.code;
            return itemValue !== operId;
          })
          .map((item: any) => ({
            value: item.CODE_VALUE || item.value || item.code,
            label: item.CODE_NAME || item.label || item.name,
          }))
      : [];

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("LINE_CD 옵션 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

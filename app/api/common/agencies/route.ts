import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("공통 기관 목록 API 호출됨");

    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    // sessionId를 직접 전달하여 세션 쿠키 설정
    const { data } = await callExternalApi("sessionGetOperSelectBox.do", {
      method: "POST",
      body: {},
      sessionId: extSid, // 세션 ID 전달
    });

    // data가 배열인지 확인하고, 아니면 빈 배열 반환
    const options = Array.isArray(data) ? data : [];

    return NextResponse.json(
      { options: options },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("공통 기관 목록 API 처리 중 오류 발생:", error);

    return NextResponse.json({ headers: createCorsHeaders() });
  }
}

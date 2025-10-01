import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("공통 기관 목록 API 호출됨");

    // ext_sid 쿠키 확인
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    // ✅ 세션이 없으면 에러 반환 (Race Condition 방지)
    if (!extSid) {
      console.error(
        "❌ ext_sid 쿠키가 없습니다. 세션이 아직 초기화되지 않았습니다."
      );
      return NextResponse.json(
        {
          error: "세션이 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.",
        },
        {
          status: 400,
          headers: createCorsHeaders(),
        }
      );
    }

    // sessionId를 직접 전달하여 세션 쿠키 설정
    const { data } = await callExternalApi("sessionGetOperSelectBox.do", {
      method: "POST",
      body: {},
      sessionId: extSid, // 세션 ID 전달
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
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

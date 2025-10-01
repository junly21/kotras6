import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { NextRequest } from "next/server";

/**
 * 엄격한 세션 검증을 수행하는 기관 목록 API
 * 세션이 없으면 401 에러를 반환하여 프론트엔드에서 새로고침 유도
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔒 [STRICT] 공통 기관 목록 API 호출됨");

    // ext_sid 쿠키 확인 (필수)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    // ✅ 세션 쿠키 필수 체크 - 없으면 에러 반환
    if (!extSid) {
      console.error(
        "❌ ext_sid 쿠키가 없습니다. 세션이 만료되었거나 없습니다."
      );
      return NextResponse.json(
        {
          error: "SESSION_EXPIRED",
          message: "세션이 유효하지 않습니다. 페이지를 새로고침해주세요.",
          options: [],
          requireRefresh: true, // 프론트엔드에 새로고침 필요 신호
        },
        {
          status: 401,
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

    console.log(`✅ 기관 목록 조회 성공: ${options.length}개`);

    // 🔍 의심스러운 전체 기관 조회 감지
    if (options.length > 10) {
      console.warn(
        `⚠️ 비정상적으로 많은 기관 반환됨 (${options.length}개). 세션 검증 필요.`
      );
    }

    return NextResponse.json(
      {
        options: options,
        sessionValid: true,
      },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("공통 기관 목록 API 처리 중 오류 발생:", error);

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "기관 목록 조회에 실패했습니다.",
        options: [],
      },
      {
        status: 500,
        headers: createCorsHeaders(),
      }
    );
  }
}

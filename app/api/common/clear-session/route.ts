import { NextRequest, NextResponse } from "next/server";
import { EXTERNAL_BASE_URL, createCorsHeaders } from "../../utils/externalApi";

// 세션 초기화 API (clearSession.do 호출)
export async function POST(request: NextRequest) {
  try {
    console.log("세션 초기화 요청 시작");

    // 우리 쿠키에서 외부 세션 ID 가져오기
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("현재 ext_sid:", extSid);

    if (!extSid) {
      return NextResponse.json(
        {
          success: false,
          error: "세션이 존재하지 않습니다.",
        },
        {
          status: 400,
          headers: createCorsHeaders(),
        }
      );
    }

    // 외부 서버에 세션 초기화 요청
    const externalRes = await fetch(`${EXTERNAL_BASE_URL}/clearSession.do`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `JSESSIONID=${extSid}`,
      },
      body: JSON.stringify({}),
    });

    console.log("외부 세션 초기화 응답 상태:", externalRes.status);

    const bodyText = await externalRes.text();
    console.log("외부 세션 초기화 응답 바디:", bodyText);

    // 성공 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        message: "세션이 초기화되었습니다.",
        data: bodyText,
      },
      {
        status: 200,
        headers: createCorsHeaders(),
      }
    );

    // 우리 도메인의 ext_sid 쿠키도 삭제
    response.cookies.set({
      name: "ext_sid",
      value: "",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 0, // 즉시 삭제
    });

    console.log("ext_sid 쿠키 삭제 완료");

    return response;
  } catch (error) {
    console.error("세션 초기화 중 오류 발생:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "세션 초기화 실패",
      },
      {
        status: 500,
        headers: createCorsHeaders(),
      }
    );
  }
}

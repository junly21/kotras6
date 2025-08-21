import { NextRequest, NextResponse } from "next/server";
import { EXTERNAL_BASE_URL, createCorsHeaders } from "../../utils/externalApi";

// 세션 생성 API
export async function POST() {
  try {
    console.log("세션 생성 요청 시작");

    // 외부 서버에 직접 호출 (빈 바디)
    const externalRes = await fetch(`${EXTERNAL_BASE_URL}/initSession.do`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // 빈 바디
    });

    console.log("외부 세션 생성 응답 상태:", externalRes.status);
    console.log(
      "외부 세션 생성 응답 헤더:",
      Object.fromEntries(externalRes.headers.entries())
    );

    // Set-Cookie 헤더에서 JSESSIONID 추출
    const setCookie = externalRes.headers.get("set-cookie");
    console.log("외부 Set-Cookie:", setCookie);

    if (!setCookie) {
      console.error("외부 서버에서 Set-Cookie를 받지 못함");
      return NextResponse.json(
        {
          success: false,
          error: "외부 서버에서 세션 쿠키를 받지 못했습니다.",
        },
        {
          status: 502,
          headers: createCorsHeaders(),
        }
      );
    }

    // JSESSIONID 값 파싱
    const match = setCookie.match(/JSESSIONID=([^;]+)/i);
    const jsessionId = match?.[1];

    if (!jsessionId) {
      console.error("JSESSIONID 파싱 실패:", setCookie);
      return NextResponse.json(
        {
          success: false,
          error: "외부 세션 ID를 파싱할 수 없습니다.",
        },
        {
          status: 502,
          headers: createCorsHeaders(),
        }
      );
    }

    console.log("파싱된 JSESSIONID:", jsessionId);

    // 외부 응답 바디 읽기 (text/plain)
    const bodyText = await externalRes.text();
    console.log("외부 응답 바디:", bodyText);

    // 세션 생성 후 바로 세션 정보 조회하여 기관명 가져오기
    let sessionData = null;
    try {
      const sessionRes = await fetch(`${EXTERNAL_BASE_URL}/getSession.do`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `JSESSIONID=${jsessionId}`,
        },
        body: JSON.stringify({}),
      });

      if (sessionRes.ok) {
        const sessionBodyText = await sessionRes.text();
        console.log("세션 생성 후 조회 응답:", sessionBodyText);

        try {
          sessionData = JSON.parse(sessionBodyText);
        } catch (parseError) {
          console.warn("세션 정보 JSON 파싱 실패:", parseError);
        }
      }
    } catch (error) {
      console.warn("세션 생성 후 조회 실패:", error);
    }

    // 성공 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        data: {
          message: bodyText,
          sessionCreated: true,
          sessionId: jsessionId,
          sessionData: sessionData, // 세션 정보 포함
        },
        message: "세션이 성공적으로 생성되었습니다.",
      },
      {
        status: 200,
        headers: createCorsHeaders(),
      }
    );

    // 외부 JSESSIONID를 우리 도메인의 HttpOnly 쿠키로 저장
    response.cookies.set({
      name: "ext_sid",
      value: jsessionId,
      httpOnly: true,
      secure: false, // HTTP 환경이므로 false로 설정
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 30, // 30분 (외부 세션 TTL에 맞춰 조정)
    });

    console.log("ext_sid 쿠키 설정 완료:", jsessionId);

    return response;
  } catch (error) {
    console.error("세션 생성 중 오류 발생:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "세션 생성 실패",
      },
      {
        status: 500,
        headers: createCorsHeaders(),
      }
    );
  }
}

// 세션 조회 API
export async function GET(request: NextRequest) {
  try {
    // 우리 쿠키에서 외부 세션 ID 가져오기
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      return NextResponse.json(
        {
          success: false,
          error: "외부 세션이 없습니다. 먼저 initSession을 호출하세요.",
        },
        {
          status: 400,
          headers: createCorsHeaders(),
        }
      );
    }

    // 외부에 쿠키를 붙여서 호출
    const externalRes = await fetch(`${EXTERNAL_BASE_URL}/getSession.do`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 외부 서버가 기대하는 쿠키명은 JSESSIONID
        Cookie: `JSESSIONID=${extSid}`,
      },
      body: JSON.stringify({}), // 빈 바디
    });

    console.log("외부 세션 조회 응답 상태:", externalRes.status);
    console.log(
      "외부 세션 조회 응답 헤더:",
      Object.fromEntries(externalRes.headers.entries())
    );

    const bodyText = await externalRes.text();
    console.log("외부 세션 조회 응답 바디:", bodyText);

    if (!externalRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `외부 서버 오류: ${bodyText}`,
          status: externalRes.status,
        },
        {
          status: externalRes.status,
          headers: createCorsHeaders(),
        }
      );
    }

    // 외부 API 응답 파싱
    let externalData = null;
    try {
      externalData = JSON.parse(bodyText);
    } catch (parseError) {
      console.warn("외부 API 응답 JSON 파싱 실패:", parseError);
    }

    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        data: {
          message: bodyText,
          sessionId: extSid,
          externalData: externalData, // 파싱된 외부 데이터 포함
        },
        message: "세션 정보를 성공적으로 조회했습니다.",
      },
      {
        status: 200,
        headers: createCorsHeaders(),
      }
    );
  } catch (error) {
    console.error("세션 조회 중 오류 발생:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "세션 조회 실패",
      },
      {
        status: 500,
        headers: createCorsHeaders(),
      }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: createCorsHeaders(),
  });
}

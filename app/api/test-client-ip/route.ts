import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "../../../utils/clientIp";
import { callExternalApi } from "../utils/externalApi";

/**
 * 클라이언트 IP 추출 및 전달 테스트용 API
 * 이 API를 호출하면 클라이언트 IP가 톰캣으로 제대로 전달되는지 확인할 수 있습니다.
 */
export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    console.log("=== 클라이언트 IP 테스트 ===");
    console.log("추출된 클라이언트 IP:", clientIp);
    console.log(
      "X-Forwarded-For 헤더:",
      request.headers.get("x-forwarded-for")
    );
    console.log("X-Real-IP 헤더:", request.headers.get("x-real-ip"));
    console.log(
      "CF-Connecting-IP 헤더:",
      request.headers.get("cf-connecting-ip")
    );
    console.log("User-Agent:", request.headers.get("user-agent"));
    console.log("=========================");

    // 톰캣으로 테스트 요청 전송 (세션 초기화)
    const { data, contentType } = await callExternalApi("initSession.do", {
      method: "POST",
      body: {},
      request, // 클라이언트 IP 전달
    });

    return NextResponse.json({
      success: true,
      clientIp,
      headers: {
        "x-forwarded-for": request.headers.get("x-forwarded-for"),
        "x-real-ip": request.headers.get("x-real-ip"),
        "cf-connecting-ip": request.headers.get("cf-connecting-ip"),
        "user-agent": request.headers.get("user-agent"),
      },
      tomcatResponse: {
        data,
        contentType,
      },
      message:
        "클라이언트 IP가 톰캣으로 전달되었습니다. 톰캣 로그를 확인해주세요.",
    });
  } catch (error) {
    console.error("클라이언트 IP 테스트 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

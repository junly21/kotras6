import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    // request.json() 호출하여 body 파싱 (body가 비어있어도)
    await request.json();

    console.log("모의정산 실행여부 체크 API 호출됨");

    // 외부 API 호출 - callExternalApi 사용
    const { data } = await callExternalApi("isSimRunning.do", {
      method: "POST",
      body: {}, // body가 필요없어도 빈 객체 전송
    });

    console.log("외부 API 모의정산 실행여부 체크 결과:", data);

    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("모의정산 실행여부 체크 실패:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

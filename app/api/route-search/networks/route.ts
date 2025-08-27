import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    console.log("경로탐색 네트워크 선택 API GET 호출됨");

    // 외부 API에서 경로탐색 네트워크 정보 조회
    const { data } = await callExternalApi("selectPathInfoSelectBox.do", {
      method: "POST",
      body: {},
    });

    console.log("외부 API 경로탐색 네트워크 결과:", data);

    // FilterForm이 기대하는 형식으로 응답
    const responseData = data as any;
    const options = Array.isArray(responseData?.options)
      ? responseData.options
      : Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
      ? responseData
      : [];

    return NextResponse.json(
      { options },
      {
        headers: createCorsHeaders(),
      }
    );
  } catch (error) {
    console.error("경로탐색 네트워크 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

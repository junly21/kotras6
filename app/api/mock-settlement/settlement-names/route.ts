import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    console.log("정산명 선택 API GET 호출됨");

    // 외부 API에서 정산명 정보 조회
    const { data } = await callExternalApi("selectSimPayRecvInfoSelectBox.do", {
      method: "POST",
      body: {},
    });

    console.log("외부 API 정산명 결과:", data);

    // FilterForm이 기대하는 형식으로 응답
    const responseData = data as any;
    const options = Array.isArray(responseData?.options)
      ? responseData.options
      : Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
      ? responseData
      : [];

    // "전체" 옵션을 맨 앞에 추가
    const optionsWithAll = [{ value: "ALL", label: "전체" }, ...options];

    return NextResponse.json(
      { options: optionsWithAll },
      {
        headers: createCorsHeaders(),
      }
    );
  } catch (error) {
    console.error("정산명 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    console.log("상세코드 존재 여부 확인 API 호출됨");

    const body = await request.json();
    console.log("상세코드 존재 여부 확인 요청 데이터:", body);

    const { data } = await callExternalApi("selectDetailCodeList.do", {
      method: "POST",
      body,
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
    });

    // data가 배열이고 길이가 0보다 크면 상세코드가 존재함
    const hasDetailCodes = Array.isArray(data) && data.length > 0;

    return NextResponse.json(
      { hasDetailCodes, count: Array.isArray(data) ? data.length : 0 },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("상세코드 존재 여부 확인 API 처리 중 오류 발생:", error);
    // 에러 발생 시 상세코드가 없다고 가정
    return NextResponse.json(
      { hasDetailCodes: false, count: 0 },
      { headers: createCorsHeaders() }
    );
  }
}

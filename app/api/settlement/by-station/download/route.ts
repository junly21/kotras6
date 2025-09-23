import { NextRequest, NextResponse } from "next/server";
import { createCorsHeaders, callExternalApi } from "../../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("역사별 정산 CSV 다운로드 API 호출됨", body);

    // 세션 쿠키 추출
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);
    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    // callExternalApi를 사용하여 세션 쿠키와 함께 외부 API 호출
    const { data, contentType } = await callExternalApi(
      "downLoadPayRecvNode.do",
      {
        method: "POST",
        body: body,
        sessionId: extSid, // 세션 ID 전달
        request: request, // 클라이언트 IP 추출용
      }
    );

    console.log("외부 API CSV 다운로드 응답:", {
      contentType,
      dataLength: typeof data === "string" ? data.length : "unknown",
    });

    // CSV 응답인 경우 파일 다운로드로 처리
    if (contentType && contentType.includes("text/csv")) {
      // UTF-8 BOM 추가 (Excel에서 한글 인코딩 문제 해결)
      const bom = "\uFEFF";
      const csvWithBom = bom + data;

      return new NextResponse(csvWithBom, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            "attachment; filename=settlement_by_station.csv",
          ...createCorsHeaders(),
        },
      });
    }

    // CSV가 아닌 경우 에러
    return NextResponse.json(
      { error: "CSV 데이터가 아닙니다." },
      { status: 400, headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("역사별 정산 CSV 다운로드 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

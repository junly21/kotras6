import { NextRequest, NextResponse } from "next/server";
import { callExternalApi } from "@/app/api/utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { settlementName, agency } = await request.json();
    console.log("모의정산 노선별 조회 API 호출됨");
    console.log("Body:", { settlementName, agency });

    if (!settlementName || !agency) {
      return NextResponse.json(
        { success: false, error: "정산명과 보관기관이 필요합니다." },
        { status: 400 }
      );
    }

    // 외부 API 호출
    console.log("외부 API selectSimPayRecvLine.do 호출 시작");
    const { data } = await callExternalApi("selectSimPayRecvLine.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: settlementName,
        OPER_ID: agency,
      },
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
    });
    console.log("외부 API selectSimPayRecvLine.do 응답 받음:", data);

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "데이터 형식이 올바르지 않습니다." },
        { status: 500 }
      );
    }

    console.log("외부 API 노선별 조회 결과:", data);

    // 원본 데이터 그대로 반환 (정산결과 노선별 조회와 동일한 구조)
    const arrayData = Array.isArray(data) ? data : [data];

    return NextResponse.json({
      success: true,
      data: arrayData,
    });
  } catch (error) {
    console.error("모의정산 노선별 조회 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  callExternalApi,
  createCorsHeaders,
} from "@/app/api/utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const { settlementName, STN_ID1, STN_ID2, STN_ID3, STN_ID4, STN_ID5 } =
      await request.json();
    console.log("by-station API 요청:", {
      settlementName,
      STN_ID1,
      STN_ID2,
      STN_ID3,
      STN_ID4,
      STN_ID5,
    });

    // settlementName이 없으면 빈 문자열로 기본값 설정 (by-institution 방식과 동일)
    const finalSettlementName = settlementName || "";

    // 외부 API 호출
    const { data } = await callExternalApi("selectSimPayRecvNode.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: finalSettlementName,
        STN_ID1: STN_ID1 || "",
        STN_ID2: STN_ID2 || "",
        STN_ID3: STN_ID3 || "",
        STN_ID4: STN_ID4 || "",
        STN_ID5: STN_ID5 || "",
      },
      request, // 클라이언트 IP 추출을 위한 request 객체 전달
    });
    console.log("by-station 외부 API 응답:", data?.length || 0, "개");

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "데이터 형식이 올바르지 않습니다." },
        { status: 500, headers: createCorsHeaders() }
      );
    }

    // 정산결과 데이터 매핑 (정산결과>역별 조회와 동일한 구조)
    const arrayData = Array.isArray(data) ? data : [data];

    const normalized = arrayData.map((item: Record<string, unknown>) => ({
      stn_nm: (item?.["stn_nm"] as string) ?? "-",
      ...item, // 나머지 모든 필드를 그대로 유지
    }));

    return NextResponse.json(
      {
        success: true,
        data: normalized,
      },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("모의정산 역별 조회 API 오류:", error);
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

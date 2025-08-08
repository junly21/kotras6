import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { MockSettlementByInstitutionFilters } from "@/types/mockSettlementByInstitution";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("모의정산 기관별 조회 API 호출됨");
    console.log("Body:", body);

    const filters: MockSettlementByInstitutionFilters = {
      settlementName: body.settlementName || "",
      agency: body.agency || "",
    };

    const simStmtGrpId = filters.settlementName;
    const operId = filters.agency;

    const { data } = await callExternalApi("selectSimPayRecvOper.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: simStmtGrpId,
        OPER_ID: operId,
      },
    });

    console.log("외부 API 모의정산 기관별 조회 결과:", data);

    // 정산결과 데이터 매핑 (정산결과>기관별 조회와 동일한 구조)
    type SettlementItem = {
      차액?: number;
      지급액?: number;
      대상기관?: string;
      seq?: number;
      수급액?: number;
    };

    const arrayData: SettlementItem[] = Array.isArray(data)
      ? (data as SettlementItem[])
      : [];

    const normalized = arrayData.map((item) => ({
      대상기관: item?.["대상기관"] ?? "-",
      지급액: item?.["지급액"] ?? 0,
      수급액: item?.["수급액"] ?? 0,
      차액: item?.["차액"] ?? 0,
    }));

    return NextResponse.json(normalized, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("모의정산 기관별 조회 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

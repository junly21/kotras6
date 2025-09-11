import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { AGENCY_MAPPING } from "@/constants/agencyMapping";

// 기관명 변환 함수
function convertAgencyName(agencyName: string): string {
  const nameMapping: Record<string, string> = {
    용인경전철: "용인경량전철",
    신림선: "남서울경전철",
  };

  return nameMapping[agencyName] || agencyName;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("모의정산 결과 API 호출됨");
    console.log("Body:", body);

    const simStmtGrpId = body.simStmtGrpId || "";

    const { data } = await callExternalApi("selectSimPayRecvResult.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: simStmtGrpId,
      },
    });

    console.log("외부 API 정산결과:", data);

    // 정산결과 데이터 매핑 (숫자 키를 한글 기관명으로 변환)
    const settlementData = Array.isArray(data) ? data : [];

    type SettlementItem = {
      pay_oper?: string;
      pay_oper_seq?: number;
      total?: number;
      [key: string]: unknown;
    };

    const normalizedSettlement = settlementData.map((item: SettlementItem) => {
      // pay_oper에서 기관명 추출 및 변환
      const payOper = convertAgencyName(item?.pay_oper || "");

      // 숫자 키를 한글 기관명으로 매핑
      const mappedItem: Record<string, unknown> = {
        pay_oper: payOper,
        pay_oper_seq: item?.pay_oper_seq,
        total: item?.total,
      };

      // 공통 기관 매핑 사용

      // 각 숫자 키를 한글 기관명으로 변환
      Object.keys(AGENCY_MAPPING).forEach((numKey) => {
        const agencyName = AGENCY_MAPPING[numKey];
        if (item[numKey] !== undefined) {
          mappedItem[agencyName] = item[numKey];
        }
      });

      return mappedItem;
    });

    return NextResponse.json(normalizedSettlement, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("모의정산 결과 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("모의정산 정보 API 호출됨");
    console.log("Body:", body);

    const simStmtGrpId = body.simStmtGrpId || "";

    const { data } = await callExternalApi("selectSimPayRecvInfo.do", {
      method: "POST",
      body: {
        SIM_STMT_GRP_ID: simStmtGrpId,
      },
    });

    console.log("외부 API 모의정산 정보 결과:", data);

    // 모의정산 데이터 매핑
    type MockSettlementItem = {
      equal_prop?: number;
      stmt_nm?: string;
      km_wght?: string;
      start_oper_prop?: number;
      km_prop?: number | string;
      row_number?: number;
      card_dt?: number | string;
      u_km_wght?: string;
      to_char?: string;
      sim_stmt_grp_id?: string;
      tag_oper_prop?: number;
      status?: string;
    };

    const formatDate = (ts: number | string | undefined): string => {
      if (ts === undefined || ts === null) return "";
      const num = typeof ts === "string" ? Number(ts) : ts;
      if (!Number.isFinite(num as number)) return "";
      const d = new Date(num as number);
      if (Number.isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const arrayData: MockSettlementItem[] = Array.isArray(data)
      ? (data as MockSettlementItem[])
      : [];

    const normalized = arrayData.map((item) => ({
      settlementName: item?.stmt_nm ?? "-",
      transactionDate:
        item?.card_dt !== undefined && item?.card_dt !== null
          ? formatDate(item.card_dt)
          : item?.to_char ?? "-",
      tagAgency: String(item?.tag_oper_prop ?? 0),
      initialLine: String(item?.start_oper_prop ?? 0),
      lineSection: String(item?.equal_prop ?? 0),
      distanceKm:
        typeof item?.km_prop === "number"
          ? item.km_prop
          : Number(item?.km_prop ?? 0),
    }));

    return NextResponse.json(normalized, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("모의정산 정보 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { MockSettlementRegisterFormData } from "@/types/mockSettlementRegister";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("모의정산 등록 API 호출됨");
    console.log("Body:", body);

    // 등록 요청인지 조회 요청인지 구분
    if (body?.action === "register") {
      const formData: MockSettlementRegisterFormData = body.data;

      // 수송기여도 매핑
      const contributionMapping: Record<string, string> = {
        한국철도공사: "OPER_1_POINT",
        서울교통공사: "OPER_2_POINT",
        인천교통공사: "OPER_3_POINT",
        공항철도: "OPER_4_POINT",
        서울시메트로9호선: "OPER_5_POINT",
        신분당선: "OPER_6_POINT",
        의정부경전철: "OPER_7_POINT",
        용인경전철: "OPER_8_POINT",
        경기철도: "OPER_9_POINT",
        우이신설경전철: "OPER_10_POINT",
        김포시청: "OPER_11_POINT",
        신림선: "OPER_12_POINT",
        새서울철도: "OPER_13_POINT",
      };

      const requestBody: Record<string, string | number> = {
        STMT_NM: formData.settlementName,
        CARD_DT: formData.tradeDate,
        TAG_OPER_PROP: formData.tagAgencyRatio,
        START_OPER_PROP: formData.initialLineRatio,
        EQUAL_PROP: formData.lineSectionRatio,
        KM_PROP: formData.distanceKmRatio,
        KM_UNG_WGHT: formData.undergroundWeight,
        KM_ELEV_WGHT: formData.elevatedWeight,
        U_KM_UNG_WGHT: formData.subwayUndergroundWeight,
        U_KM_ELEV_WGHT: formData.subwayElevatedWeight,
      };

      // 수송기여도 추가
      Object.entries(formData.contribution).forEach(([agency, value]) => {
        const fieldName = contributionMapping[agency];
        if (fieldName) {
          requestBody[fieldName] = value;
        }
      });

      const { data } = await callExternalApi("insertSimPayRecvInfo.do", {
        method: "POST",
        body: requestBody,
      });

      console.log("외부 API 모의정산 등록 결과:", data);
      return NextResponse.json(data, { headers: createCorsHeaders() });
    }

    // 기존 조회 로직
    const stmtNm = (body?.settlementName || "").toString();
    const cardDt = (body?.transactionDate || "ALL").toString() || "ALL";

    const { data } = await callExternalApi("selectSimPayRecvInfo.do", {
      method: "POST",
      body: {
        STMT_NM: stmtNm,
        CARD_DT: cardDt || "ALL",
      },
    });

    console.log("외부 API 모의정산 등록 결과:", data);

    // 그리드 스키마에 맞게 응답 데이터 매핑
    type ExternalItem = {
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

    const arrayData: ExternalItem[] = Array.isArray(data)
      ? (data as ExternalItem[])
      : [];
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

    const normalized = arrayData.map((item) => ({
      simStmtGrpId: item?.sim_stmt_grp_id ?? "",
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
      weightRatio:
        typeof item?.km_wght === "string"
          ? item.km_wght
          : String(item?.km_wght ?? ""),
      registrationDate: item?.to_char ?? "-",
    }));

    return NextResponse.json(normalized, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("모의정산 등록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { RouteSearchKeyFilter, RouteSearchResult } from "@/types/routeSearch";

export async function POST(request: Request) {
  try {
    console.log("경로탐색 Key 검색 API 호출됨");

    const body = await request.json();
    console.log("Body:", body);

    const filter: RouteSearchKeyFilter = {
      PATH_KEY: body.PATH_KEY,
    };

    // 필수 파라미터 검증
    if (!filter.PATH_KEY) {
      return NextResponse.json(
        { error: "PATH_KEY는 필수입니다." },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // 외부 API에서 경로탐색 Key 검색 결과 조회
    const { data } = await callExternalApi("selectPathResultInputText.do", {
      method: "POST",
      body: {
        PATH_KEY: filter.PATH_KEY,
      },
    });

    console.log("외부 API 경로탐색 Key 검색 결과:", data);

    // 응답 데이터를 RouteSearchResult 형태로 변환
    const results: RouteSearchResult[] = Array.isArray(data)
      ? data.map((item: any, index: number) => ({
          id: item.id || index + 1,
          rn: item.rn || index + 1,
          ride_stn_id: item.ride_stn_id || "",
          algh_stn_id: item.algh_stn_id || "",
          start_node: item.start_node || "",
          end_node: item.end_node || "",
          path_nm: item.path_nm || "",
          path_num: item.path_num || "",
          transfer_list: item.transfer_list || "",
          transfer_cnt: item.transfer_cnt || 0,
          km: item.km || 0,
          sta_pass_sec: item.sta_pass_sec || 0,
          cost: item.cost || 0,
          oper_list: item.oper_list || "",
          path_prob: item.path_prob || 0,
          rgb: item.rgb || "#3B82F6",
          path_id: item.path_id || "",
          path_key: item.path_key || "",
          path_seq: item.path_seq || 0,
          operline_list: item.operline_list || "",
          tag_oper: item.tag_oper || "",
          start_oper: item.start_oper || "",
          trans_sty_sec: item.trans_sty_sec || 0,
          trans_mv_sec: item.trans_mv_sec || 0,
          km_oper_list: item.km_oper_list || "",
          km_elev_oper_list: item.km_elev_oper_list || "",
          km_g_oper_list: item.km_g_oper_list || "",
          km_ung_operline_list: item.km_ung_operline_list || "",
          km_ung_oper_list: item.km_ung_oper_list || "",
          km_g_operline_list: item.km_g_operline_list || "",
          km_elev_operline_list: item.km_elev_operline_list || "",
          path_value: item.path_value || 0,
          created_at: item.created_at || Date.now(),
          confirmed_path: item.confirmed_path || "N",
          group_no: item.group_no || 1,
          cnt: item.cnt || 0,
        }))
      : [];

    return NextResponse.json(
      {
        results,
        totalCount: results.length,
        pathKey: filter.PATH_KEY,
      },
      {
        headers: createCorsHeaders(),
      }
    );
  } catch (error) {
    console.error("경로탐색 Key 검색 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

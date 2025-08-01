import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { NetworkNode } from "@/types/network";
import { StationOption } from "@/types/routeSearch";

export async function GET(request: NextRequest) {
  try {
    console.log("역 목록 API 호출됨");

    // 외부 API에서 네트워크 노드 목록 조회
    const { data } = await callExternalApi("selectNetWorkNodeList.do", {
      method: "POST",
      body: {
        NET_DT: "LATEST",
      },
    });

    console.log("외부 API 응답:", data);

    // NetworkNode 배열을 StationOption으로 변환
    const rawData = data as NetworkNode[];
    const stationOptions: StationOption[] = (rawData || []).map((node) => ({
      label: node.sta_nm,
      value: node.sta_num,
    }));

    console.log("변환된 역 옵션:", stationOptions);

    return NextResponse.json(
      { options: stationOptions },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("역 목록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

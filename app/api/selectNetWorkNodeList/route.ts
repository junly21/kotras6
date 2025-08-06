import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";
import { NetworkNode } from "@/types/network";
import { StationOption } from "@/types/routeSearch";

export async function GET() {
  try {
    console.log("selectNetWorkNodeList API 호출됨 (GET)");

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
    console.error("selectNetWorkNodeList API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("selectNetWorkNodeList API 호출됨 (POST)");

    const body = await request.json();
    console.log("selectNetWorkNodeList 요청 데이터:", body);

    const { data } = await callExternalApi("selectNetWorkNodeList.do", {
      method: "POST",
      body: {
        NET_DT: body.NET_DT || "LATEST",
      },
    });

    console.log("외부 API 응답:", data);

    // NetworkNode 배열을 그대로 반환 (StationOption 변환하지 않음)
    const rawData = data as NetworkNode[];

    return NextResponse.json(rawData || [], { headers: createCorsHeaders() });
  } catch (error) {
    console.error("selectNetWorkNodeList API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";
import { StationOption } from "@/types/routeSearch";

export async function GET() {
  try {
    console.log("selectNetWorkNodeSelectBox API 호출됨 (GET)");

    const { data } = await callExternalApi("selectNetWorkNodeSelectBox.do", {
      method: "POST",
      body: {},
    });

    console.log("외부 API 응답:", data);

    // 응답 데이터를 StationOption 형태로 변환
    const stationOptions: StationOption[] = Array.isArray(data)
      ? data.map(
          (item: {
            label?: string;
            value?: string | number;
            sta_nm?: string;
            sta_num?: string | number;
          }) => ({
            label: String(item.label || item.sta_nm || ""),
            value: String(item.value || item.sta_num || ""),
          })
        )
      : [];

    console.log("변환된 역 옵션:", stationOptions);

    return NextResponse.json(
      { options: stationOptions },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("selectNetWorkNodeSelectBox API 처리 중 오류 발생:", error);
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
    console.log("selectNetWorkNodeSelectBox API 호출됨 (POST)");

    const body = await request.json();
    console.log("selectNetWorkNodeSelectBox 요청 데이터:", body);

    const { data } = await callExternalApi("selectNetWorkNodeSelectBox.do", {
      method: "POST",
      body: body,
    });

    console.log("외부 API 응답:", data);

    // 응답 데이터를 StationOption 형태로 변환
    const stationOptions: StationOption[] = Array.isArray(data)
      ? data.map(
          (item: {
            label?: string;
            value?: string | number;
            sta_nm?: string;
            sta_num?: string | number;
          }) => ({
            label: String(item.label || item.sta_nm || ""),
            value: String(item.value || item.sta_num || ""),
          })
        )
      : [];

    console.log("변환된 역 옵션:", stationOptions);

    return NextResponse.json(
      { options: stationOptions },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("selectNetWorkNodeSelectBox API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

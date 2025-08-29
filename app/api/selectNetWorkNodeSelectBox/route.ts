import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";
import { StationOption } from "@/types/routeSearch";

export async function GET(request: NextRequest) {
  try {
    console.log("selectNetWorkNodeSelectBox API 호출됨 (GET)");

    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    // 쿼리 파라미터에서 NET_DT 추출
    const url = new URL(request.url);
    const netDt = url.searchParams.get("NET_DT");
    console.log("GET 요청에서 추출한 NET_DT:", netDt);

    // NET_DT가 없으면 기본값 사용 (LATEST 또는 현재 날짜)
    const requestBody = netDt ? { NET_DT: netDt } : { NET_DT: "LATEST" };

    const { data } = await callExternalApi("selectNetWorkNodeSelectBox.do", {
      method: "POST",
      body: requestBody,
      sessionId: extSid, // 세션 ID 전달
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

export async function POST(request: NextRequest) {
  try {
    console.log("selectNetWorkNodeSelectBox API 호출됨 (POST)");

    const body = await request.json();
    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }
    console.log("selectNetWorkNodeSelectBox 요청 데이터:", body);

    const { data } = await callExternalApi("selectNetWorkNodeSelectBox.do", {
      method: "POST",
      body: body,
      sessionId: extSid, // 세션 ID 전달
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

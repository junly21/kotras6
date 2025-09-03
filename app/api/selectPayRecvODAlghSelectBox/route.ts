import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";
import { StationOption } from "@/types/routeSearch";

export async function POST(request: NextRequest) {
  try {
    console.log("selectPayRecvODAlghSelectBox API 호출됨 (POST)");

    const body = await request.json();
    console.log("selectPayRecvODAlghSelectBox 요청 데이터:", body);

    // ext_sid 쿠키 확인 (로깅용)
    const extSid = request.cookies.get("ext_sid")?.value;
    console.log("쿠키에서 가져온 ext_sid:", extSid);

    if (!extSid) {
      console.warn("ext_sid 쿠키가 없습니다. 세션을 먼저 생성해주세요.");
    }

    // 승차역 ID가 없으면 빈 배열 반환
    if (!body.RIDE_STN_ID) {
      return NextResponse.json(
        { options: [] },
        { headers: createCorsHeaders() }
      );
    }

    const { data } = await callExternalApi("selectPayRecvODAlghSelectBox.do", {
      method: "POST",
      body: {
        RIDE_STN_ID: body.RIDE_STN_ID,
        NET_DT: "LATEST",
      },
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

    console.log("변환된 도착역 옵션:", stationOptions);

    return NextResponse.json(
      { options: stationOptions },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("selectPayRecvODAlghSelectBox API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

import { NextResponse } from "next/server";
import { callOptimalRouteApi, createCorsHeaders } from "../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("selectOptimalRoute API 호출됨");

    const body = await request.json();
    console.log("selectOptimalRoute 요청 데이터:", body);

    // FilterForm에서 전달되는 데이터 구조:
    // - start_station: 출발역 value
    // - end_station: 도착역 value
    // - network_timestamp: 네트워크 value (NET_DT)

    if (!body.start_station || !body.end_station || !body.network_timestamp) {
      return NextResponse.json(
        {
          error: "필수 파라미터가 누락되었습니다",
          details: "start_station, end_station, network_timestamp가 필요합니다",
        },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // 역 번호로 역 이름(sta_nm) 조회
    let startStationName = "";
    let endStationName = "";

    try {
      // 출발역 이름 조회
      const startStationResponse = await fetch(
        `${request.headers.get("origin")}/api/selectNetWorkNodeList`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            NET_DT: body.network_timestamp,
          }),
        }
      );

      if (startStationResponse.ok) {
        const startStationData = await startStationResponse.json();
        const startStation = startStationData.find(
          (station: { sta_num: string | number; sta_nm: string }) =>
            station.sta_num === body.start_station
        );
        if (startStation) {
          startStationName = startStation.sta_nm;
        }
      }

      // 도착역 이름 조회
      const endStationResponse = await fetch(
        `${request.headers.get("origin")}/api/selectNetWorkNodeList`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            NET_DT: body.network_timestamp,
          }),
        }
      );

      if (endStationResponse.ok) {
        const endStationData = await endStationResponse.json();
        const endStation = endStationData.find(
          (station: { sta_num: string | number; sta_nm: string }) =>
            station.sta_num === body.end_station
        );
        if (endStation) {
          endStationName = endStation.sta_nm;
        }
      }
    } catch (error) {
      console.error("역 이름 조회 중 오류:", error);
    }

    // 역 이름이 조회되지 않은 경우 원본 값 사용
    if (!startStationName) startStationName = body.start_station;
    if (!endStationName) endStationName = body.end_station;

    const result = await callOptimalRouteApi("api/generate-path", {
      method: "POST",
      body: {
        start_station: startStationName,
        end_station: endStationName,
        network_timestamp: body.network_timestamp,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "최적경로 조회 실패",
          details: result.error,
        },
        { status: 500, headers: createCorsHeaders() }
      );
    }

    return NextResponse.json(result.data, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("selectOptimalRoute API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

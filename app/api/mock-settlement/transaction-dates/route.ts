import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET() {
  try {
    console.log("거래일자 목록 API 호출됨");

    const { data } = await callExternalApi("getSelectBox.do", {
      method: "POST",
      body: {
        COMMON_CODE: "RIDE_OPRN_DT",
      },
    });

    // data가 배열인지 확인하고, 아니면 빈 배열 반환
    let options = Array.isArray(data) ? data : [];

    // "전체:ALL" 옵션을 맨 앞에 추가
    options = [{ label: "전체", value: "ALL" }, ...options];

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("거래일자 목록 API 처리 중 오류 발생:", error);
    // 에러 발생 시에도 "전체:ALL" 옵션만 포함된 배열 반환
    return NextResponse.json(
      {
        options: [{ label: "전체", value: "ALL" }],
      },
      { headers: createCorsHeaders() }
    );
  }
}

export async function POST() {
  try {
    console.log("거래일자 목록 API 호출됨 (POST)");

    const { data } = await callExternalApi("getSelectBox.do", {
      method: "POST",
      body: {
        COMMON_CODE: "RIDE_OPRN_DT",
      },
    });

    // data가 배열인지 확인하고, 아니면 빈 배열 반환
    let options = Array.isArray(data) ? data : [];

    // "전체:ALL" 옵션을 맨 앞에 추가
    options = [{ label: "전체", value: "ALL" }, ...options];

    console.log("외부 API 거래일자 목록 결과:", { options });

    return NextResponse.json({ options }, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("거래일자 목록 API 처리 중 오류 발생:", error);
    // 에러 발생 시에도 "전체:ALL" 옵션만 포함된 배열 반환
    return NextResponse.json(
      {
        options: [{ label: "전체", value: "ALL" }],
      },
      { headers: createCorsHeaders() }
    );
  }
}

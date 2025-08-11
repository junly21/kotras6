import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("모의정산 OD별 정산 상세정보 API 호출됨");
    console.log("Body:", body);

    const { PATH_KEY, PATH_ID } = body;

    if (!PATH_KEY || !PATH_ID) {
      return NextResponse.json(
        { error: "PATH_KEY와 PATH_ID가 필요합니다." },
        { status: 400, headers: createCorsHeaders() }
      );
    }

    // 외부 API에서 모의정산 OD별 정산 상세정보 조회
    const { data } = await callExternalApi("selectSimPayRecvODDetail.do", {
      method: "POST",
      body: {
        PATH_KEY,
        PATH_ID,
      },
    });

    console.log("외부 API 모의정산 OD별 정산 상세정보 결과:", data);

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("모의정산 OD별 정산 상세정보 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
} 
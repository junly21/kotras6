import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oper_id = searchParams.get("oper_id") || "test";

    console.log("PayRecvOperList API 호출됨 - oper_id:", oper_id);

    const { data } = await callExternalApi("selectPayRecvOperList.do", {
      params: { oper_id },
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("PayRecvOperList Route 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("PayRecvOperList POST API 호출됨");
    console.log("Body:", body);

    // body 안의 params 객체에서 limit 추출
    const limit = body.params?.limit || 3;
    console.log("Extracted limit:", limit);

    const { data } = await callExternalApi("selectPayRecvOperList.do", {
      method: "POST",
      body: {
        limit: limit,
      },
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("PayRecvOperList POST Route 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

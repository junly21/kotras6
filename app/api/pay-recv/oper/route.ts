import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

// CREATE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("PayRecvOper CREATE API 호출됨");

    const { data } = await callExternalApi("createPayRecvOper.do", {
      method: "POST",
      body,
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("PayRecvOper CREATE Route 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oper_id = searchParams.get("oper_id");
    const body = await request.json();

    console.log("PayRecvOper UPDATE API 호출됨 - oper_id:", oper_id);

    const { data } = await callExternalApi("updatePayRecvOper.do", {
      method: "POST", // 외부 API가 POST를 사용할 가능성이 높음
      body: { ...body, oper_id },
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("PayRecvOper UPDATE Route 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oper_id = searchParams.get("oper_id");

    if (!oper_id) {
      return NextResponse.json(
        { error: "oper_id 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    console.log("PayRecvOper DELETE API 호출됨 - oper_id:", oper_id);

    const { data } = await callExternalApi("deletePayRecvOper.do", {
      method: "POST", // 외부 API가 POST를 사용할 가능성이 높음
      params: { oper_id },
    });

    return NextResponse.json(data, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("PayRecvOper DELETE Route 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

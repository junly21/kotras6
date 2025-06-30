import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const oper_id = searchParams.get("oper_id") || "test";

    console.log("프록시 API 호출됨 - oper_id:", oper_id);

    // 실제 외부 API 호출
    const externalUrl = `http://192.168.111.152:8080/kotras6/selectPayRecvOperList.do?oper_id=${oper_id}`;
    console.log("외부 API URL:", externalUrl);

    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("외부 API 응답 상태:", response.status);
    console.log(
      "외부 API 응답 헤더:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("외부 API 응답 에러:", errorText);
      return NextResponse.json(
        {
          error: "외부 API 요청 실패",
          details: `HTTP error! status: ${response.status}, body: ${errorText}`,
        },
        { status: 500 }
      );
    }

    const contentType = response.headers.get("content-type");
    console.log("외부 API Content-Type:", contentType);

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      console.log("외부 API JSON 응답 데이터:", data);
    } else {
      const textData = await response.text();
      console.log(
        "외부 API 텍스트 응답 데이터 (처음 500자):",
        textData.substring(0, 500)
      );

      data = {
        type: "html",
        content: textData.substring(0, 1000),
        message: "HTML 응답을 받았습니다. JSON 데이터가 아닙니다.",
      };
    }

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("Route 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../utils/externalApi";

interface HtmlErrorResponse {
  type: "html";
  content: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    console.log("selectNetWorkList API 호출됨");

    const body = await request.json();
    console.log("selectNetWorkList 요청 데이터:", body);

    const { data } = await callExternalApi("selectNetWorkList.do", {
      method: "POST",
      body: {
        NET_DT: body.NET_DT || "LATEST",
      },
    });

    console.log("네트워크 목록 조회 성공:", data);

    // HTML 에러 응답인지 확인
    if (
      data &&
      typeof data === "object" &&
      "type" in data &&
      (data as HtmlErrorResponse).type === "html"
    ) {
      const htmlError = data as HtmlErrorResponse;
      console.error(
        "외부 API에서 HTML 에러 응답을 받았습니다:",
        htmlError.message
      );

      // 임시 더미 데이터 반환 (API 연결 전까지)
      const dummyOptions = [
        { value: "network1", label: "서울교통공사" },
        { value: "network2", label: "부산교통공사" },
        { value: "network3", label: "대구교통공사" },
        { value: "network4", label: "인천교통공사" },
        { value: "network5", label: "광주교통공사" },
      ];

      return NextResponse.json(
        { options: dummyOptions },
        { headers: createCorsHeaders() }
      );
    }

    // 정상적인 JSON 응답인 경우
    if (data && Array.isArray(data)) {
      const options = data.map((item: Record<string, unknown>) => ({
        value: String(item.net_dt || ""),
        label: String(item.net_nm || ""),
      }));

      return NextResponse.json({ options }, { headers: createCorsHeaders() });
    }

    // 데이터가 배열이 아닌 경우 (예: { options: [...] } 형태)
    if (
      data &&
      typeof data === "object" &&
      "options" in data &&
      Array.isArray(data.options)
    ) {
      const options = data.options.map((item: Record<string, unknown>) => ({
        value: String(item.net_dt || ""),
        label: String(item.net_nm || ""),
      }));

      return NextResponse.json({ options }, { headers: createCorsHeaders() });
    }

    // 예상치 못한 응답 형태인 경우
    console.warn("예상치 못한 응답 형태:", data);

    // 임시 더미 데이터 반환
    const dummyOptions = [
      { value: "network1", label: "서울교통공사" },
      { value: "network2", label: "부산교통공사" },
      { value: "network3", label: "대구교통공사" },
      { value: "network4", label: "인천교통공사" },
      { value: "network5", label: "광주교통공사" },
    ];

    return NextResponse.json(
      { options: dummyOptions },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("selectNetWorkList API 처리 중 오류 발생:", error);

    // 임시 더미 데이터 (API 연결 전까지)
    const dummyOptions = [
      { value: "network1", label: "서울교통공사" },
      { value: "network1", label: "서울교통공사" },
      { value: "network2", label: "부산교통공사" },
      { value: "network3", label: "대구교통공사" },
      { value: "network4", label: "인천교통공사" },
      { value: "network5", label: "광주교통공사" },
    ];

    return NextResponse.json(
      { options: dummyOptions },
      { headers: createCorsHeaders() }
    );
  }
}

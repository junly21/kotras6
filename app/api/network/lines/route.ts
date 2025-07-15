import { NextRequest, NextResponse } from "next/server";
import {
  callExternalApi,
  createCorsHeaders,
} from "@/app/api/utils/externalApi";

interface HtmlErrorResponse {
  type: "html";
  content: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network, networkLabel } = body;

    if (!network) {
      return NextResponse.json(
        { options: [] },
        { headers: createCorsHeaders() }
      );
    }

    console.log("노선 요청 바디:", { network, networkLabel });

    // 외부 API 호출
    const { data } = await callExternalApi("selectNetWorkLineSelectBox.do", {
      method: "POST",
      body: {
        NET_DT: network, // 네트워크명 VALUE (net_dt)
        OPER_NM: networkLabel, // 기관명 LABEL (net_nm)
      },
    });

    console.log("노선 목록 조회 성공:", data);

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
        { value: "line1", label: "1호선" },
        { value: "line2", label: "2호선" },
        { value: "line3", label: "3호선" },
        { value: "line4", label: "4호선" },
        { value: "line5", label: "5호선" },
      ];

      return NextResponse.json(
        { options: dummyOptions },
        { headers: createCorsHeaders() }
      );
    }

    // 정상적인 JSON 응답인 경우
    if (data && Array.isArray(data)) {
      // FilterForm이 기대하는 형식으로 변환 - value와 label을 문자열로 통일
      const options = data.map((item: Record<string, unknown>) => ({
        value: String(item.value || item.LINE_DT || item.id || ""),
        label: String(item.label || item.LINE_NM || item.name || ""),
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
        value: String(item.value || item.LINE_DT || item.id || ""),
        label: String(item.label || item.LINE_NM || item.name || ""),
      }));

      return NextResponse.json({ options }, { headers: createCorsHeaders() });
    }

    // 예상치 못한 응답 형태인 경우
    console.warn("예상치 못한 응답 형태:", data);

    // 임시 더미 데이터 반환
    const dummyOptions = [
      { value: "line1", label: "1호선" },
      { value: "line2", label: "2호선" },
      { value: "line3", label: "3호선" },
      { value: "line4", label: "4호선" },
      { value: "line5", label: "5호선" },
    ];

    return NextResponse.json(
      { options: dummyOptions },
      { headers: createCorsHeaders() }
    );
  } catch (error) {
    console.error("노선 목록 조회 오류:", error);

    // 임시 더미 데이터 (API 연결 전까지)
    const dummyOptions = [
      { value: "line1", label: "1호선" },
      { value: "line2", label: "2호선" },
      { value: "line3", label: "3호선" },
      { value: "line4", label: "4호선" },
      { value: "line5", label: "5호선" },
    ];

    return NextResponse.json(
      { options: dummyOptions },
      { headers: createCorsHeaders() }
    );
  }
}

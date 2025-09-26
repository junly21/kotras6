import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";

// 기관명 변환 함수
function convertAgencyName(agencyName: string): string {
  const nameMapping: Record<string, string> = {
    용인경전철: "용인경량전철",
    신림선: "남서울경전철",
    신분당선: "신분당선주식회사",
  };

  return nameMapping[agencyName] || agencyName;
}

export async function GET(request: NextRequest) {
  try {
    console.log("PayRecvOperList GET API 호출됨");

    const { data } = await callExternalApi("selectPayRecvResult.do", {
      method: "POST",
      body: {}, // 빈 body로 요청
    });

    // pay_oper 필드 변환
    const transformedData = Array.isArray(data)
      ? data.map((item: any) => ({
          ...item,
          pay_oper: convertAgencyName(item.pay_oper || ""),
        }))
      : data;

    return NextResponse.json(transformedData, {
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

    try {
      const { data } = await callExternalApi("selectPayRecvResult.do", {
        method: "POST",
        body: {}, // 빈 body로 요청
        request, // 클라이언트 IP 추출을 위한 request 객체 전달
      });

      // pay_oper 필드 변환
      const transformedData = Array.isArray(data)
        ? data.map((item: any) => ({
            ...item,
            pay_oper: convertAgencyName(item.pay_oper || ""),
          }))
        : data;

      return NextResponse.json(transformedData, {
        headers: createCorsHeaders(),
      });
    } catch (externalApiError) {
      console.warn("외부 API 호출 실패, 더미 데이터 반환:", externalApiError);

      // 더미 데이터 반환
      const dummyData = {
        success: true,
        data: Array.from({ length: limit }, (_, index) => ({
          id: index + 1,
          oper_name: `운영사 ${index + 1}`,
          oper_code: `OP${String(index + 1).padStart(3, "0")}`,
          status: index % 2 === 0 ? "활성" : "비활성",
          created_date: new Date().toISOString().split("T")[0],
        })),
        message: "외부 API 연결 중 - 더미 데이터입니다.",
      };

      return NextResponse.json(dummyData, {
        headers: createCorsHeaders(),
      });
    }
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

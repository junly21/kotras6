import { NextRequest, NextResponse } from "next/server";
import { callExternalApi } from "@/app/api/utils/externalApi";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const { settlementName, tradeDate } = await request.json();

    if (!settlementName || !tradeDate) {
      return NextResponse.json({
        success: false,
        error: "정산명과 거래일자가 필요합니다.",
      });
    }

    // 외부 시스템에서 모의정산 상태 확인
    const response = await callExternalApi("checkMockSettlementStatus.do", {
      method: "POST",
      body: {
        settlementName,
        tradeDate,
      },
    });

    if (response.data && typeof response.data === "object") {
      // 응답 데이터에서 완료 여부 확인
      const isCompleted =
        response.data.status === "completed" ||
        response.data.completed === true ||
        response.data.result === "success";

      return NextResponse.json({
        success: true,
        data: response.data,
        completed: isCompleted,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "외부 시스템에서 유효하지 않은 응답을 받았습니다.",
      });
    }
  } catch (error) {
    console.error("모의정산 상태 확인 에러:", error);
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    });
  }
}

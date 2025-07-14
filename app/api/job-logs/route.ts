import { NextResponse } from "next/server";
import { createCorsHeaders } from "../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("작업로그 목록 API 호출됨 (Mock)");

    const body = await request.json();
    console.log("작업로그 목록 요청 데이터:", body);

    // Mock 데이터 생성
    const mockJobLogs = [
      {
        PROCESS_DIV: "REFINE",
        DETAIL_DIV: "데이터 정제",
        ACTION_TYPE: "배치 처리",
        PROCESS_DTM: "2024-01-15T10:30:00",
        ACTION_DIV: "START",
      },
      {
        PROCESS_DIV: "REFINE",
        DETAIL_DIV: "데이터 검증",
        ACTION_TYPE: "검증 처리",
        PROCESS_DTM: "2024-01-15T10:35:00",
        ACTION_DIV: "PROCESS",
      },
      {
        PROCESS_DIV: "REFINE",
        DETAIL_DIV: "데이터 변환",
        ACTION_TYPE: "변환 처리",
        PROCESS_DTM: "2024-01-15T10:40:00",
        ACTION_DIV: "PROCESS",
      },
      {
        PROCESS_DIV: "SETTLE",
        DETAIL_DIV: "정산 계산",
        ACTION_TYPE: "계산 처리",
        PROCESS_DTM: "2024-01-15T11:00:00",
        ACTION_DIV: "START",
      },
      {
        PROCESS_DIV: "SETTLE",
        DETAIL_DIV: "정산 검증",
        ACTION_TYPE: "검증 처리",
        PROCESS_DTM: "2024-01-15T11:05:00",
        ACTION_DIV: "PROCESS",
      },
      {
        PROCESS_DIV: "SETTLE",
        DETAIL_DIV: "정산 완료",
        ACTION_TYPE: "완료 처리",
        PROCESS_DTM: "2024-01-15T11:10:00",
        ACTION_DIV: "END",
      },
      {
        PROCESS_DIV: "REFINE",
        DETAIL_DIV: "데이터 저장",
        ACTION_TYPE: "저장 처리",
        PROCESS_DTM: "2024-01-15T10:45:00",
        ACTION_DIV: "END",
      },
    ];

    // 필터링 로직 (실제로는 서버에서 처리하지만 mock에서는 클라이언트에서 처리)
    let filteredLogs = mockJobLogs;

    // "전체"가 아닌 특정 프로세스구분이 선택된 경우에만 필터링
    if (
      body.processDiv &&
      body.processDiv !== "" &&
      body.processDiv !== "ALL"
    ) {
      filteredLogs = mockJobLogs.filter(
        (log) => log.PROCESS_DIV === body.processDiv
      );
    }

    return NextResponse.json(filteredLogs, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("작업로그 목록 API 처리 중 오류 발생:", error);
    // 에러 발생 시에도 빈 배열 반환
    return NextResponse.json([], { headers: createCorsHeaders() });
  }
}

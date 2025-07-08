import { NextRequest, NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("거래내역 분석 데이터 API 호출됨");
    console.log("Body:", body);

    // body 안의 params 객체에서 agency 추출
    const agency = body.params?.agency || "용인경전철";
    console.log("Selected agency:", agency);

    // Mock 거래내역 분석 데이터
    const mockData = [
      {
        rank: 1,
        agency: agency,
        boardingStation: "강남역",
        alightingStation: "역삼역",
        dataCount: 15420,
      },
      {
        rank: 2,
        agency: agency,
        boardingStation: "홍대입구역",
        alightingStation: "합정역",
        dataCount: 12850,
      },
      {
        rank: 3,
        agency: agency,
        boardingStation: "신촌역",
        alightingStation: "이대역",
        dataCount: 11230,
      },
      {
        rank: 4,
        agency: agency,
        boardingStation: "잠실역",
        alightingStation: "잠실나루역",
        dataCount: 9870,
      },
      {
        rank: 5,
        agency: agency,
        boardingStation: "강남역",
        alightingStation: "교대역",
        dataCount: 8650,
      },
      {
        rank: 6,
        agency: agency,
        boardingStation: "홍대입구역",
        alightingStation: "신촌역",
        dataCount: 7430,
      },
      {
        rank: 7,
        agency: agency,
        boardingStation: "강남역",
        alightingStation: "역삼역",
        dataCount: 6540,
      },
      {
        rank: 8,
        agency: agency,
        boardingStation: "잠실역",
        alightingStation: "잠실새내역",
        dataCount: 5870,
      },
      {
        rank: 9,
        agency: agency,
        boardingStation: "신촌역",
        alightingStation: "이대역",
        dataCount: 5230,
      },
      {
        rank: 10,
        agency: agency,
        boardingStation: "강남역",
        alightingStation: "교대역",
        dataCount: 4780,
      },
    ];

    return NextResponse.json(mockData, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("거래내역 분석 데이터 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("상세조회 데이터 API 호출됨");
    console.log("Body:", body);

    // body 안의 params 객체에서 필터 추출
    const tradeDate = body.params?.tradeDate || "2024-01-15";
    const cardType = body.params?.cardType || "일반카드";
    console.log("Selected filters:", { tradeDate, cardType });

    // Mock 상세조회 데이터
    const mockData = [
      {
        cardNumber: "1234-5678-9012-3456",
        boardingDateTime: "2024-01-15 08:30:00",
        alightingDateTime: "2024-01-15 08:45:00",
        firstBoardingStation: "강남역",
        finalAlightingStation: "역삼역",
        totalAmount: 1250,
        baseFare: 1000,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "2345-6789-0123-4567",
        boardingDateTime: "2024-01-15 09:15:00",
        alightingDateTime: "2024-01-15 09:35:00",
        firstBoardingStation: "홍대입구역",
        finalAlightingStation: "합정역",
        totalAmount: 1350,
        baseFare: 1100,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "3456-7890-1234-5678",
        boardingDateTime: "2024-01-15 10:00:00",
        alightingDateTime: "2024-01-15 10:20:00",
        firstBoardingStation: "신촌역",
        finalAlightingStation: "이대역",
        totalAmount: 1150,
        baseFare: 900,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "4567-8901-2345-6789",
        boardingDateTime: "2024-01-15 11:30:00",
        alightingDateTime: "2024-01-15 11:50:00",
        firstBoardingStation: "잠실역",
        finalAlightingStation: "잠실나루역",
        totalAmount: 1450,
        baseFare: 1200,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "5678-9012-3456-7890",
        boardingDateTime: "2024-01-15 12:45:00",
        alightingDateTime: "2024-01-15 13:05:00",
        firstBoardingStation: "강남역",
        finalAlightingStation: "교대역",
        totalAmount: 1250,
        baseFare: 1000,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "6789-0123-4567-8901",
        boardingDateTime: "2024-01-15 14:20:00",
        alightingDateTime: "2024-01-15 14:40:00",
        firstBoardingStation: "홍대입구역",
        finalAlightingStation: "신촌역",
        totalAmount: 1150,
        baseFare: 900,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "7890-1234-5678-9012",
        boardingDateTime: "2024-01-15 15:10:00",
        alightingDateTime: "2024-01-15 15:30:00",
        firstBoardingStation: "강남역",
        finalAlightingStation: "역삼역",
        totalAmount: 1250,
        baseFare: 1000,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "8901-2345-6789-0123",
        boardingDateTime: "2024-01-15 16:00:00",
        alightingDateTime: "2024-01-15 16:20:00",
        firstBoardingStation: "잠실역",
        finalAlightingStation: "잠실새내역",
        totalAmount: 1350,
        baseFare: 1100,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "9012-3456-7890-1234",
        boardingDateTime: "2024-01-15 17:30:00",
        alightingDateTime: "2024-01-15 17:50:00",
        firstBoardingStation: "신촌역",
        finalAlightingStation: "이대역",
        totalAmount: 1150,
        baseFare: 900,
        subwaySurcharge: 250,
      },
      {
        cardNumber: "0123-4567-8901-2345",
        boardingDateTime: "2024-01-15 18:15:00",
        alightingDateTime: "2024-01-15 18:35:00",
        firstBoardingStation: "강남역",
        finalAlightingStation: "교대역",
        totalAmount: 1250,
        baseFare: 1000,
        subwaySurcharge: 250,
      },
    ];

    return NextResponse.json(mockData, {
      headers: createCorsHeaders(),
    });
  } catch (error) {
    console.error("상세조회 데이터 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

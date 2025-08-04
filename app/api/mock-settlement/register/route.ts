import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, createCorsHeaders } from "../../utils/externalApi";
import { MockSettlementRegisterFilters } from "@/types/mockSettlementRegister";

// Mock 데이터 생성 함수
function generateMockSettlementData(filters: MockSettlementRegisterFilters) {
  const mockData = [
    {
      settlementName: "2024년 1월 정산",
      transactionDate: "2024-01-15",
      tagAgency: "서울교통공사",
      initialLine: "1호선",
      lineSection: "서울역~종각",
      distanceKm: 1250,
      weightRatio: "60:30:10",
      registrationDate: "2024-01-20",
      status: "완료" as const,
    },
    {
      settlementName: "2024년 1월 정산",
      transactionDate: "2024-01-15",
      tagAgency: "서울교통공사",
      initialLine: "2호선",
      lineSection: "강남~역삼",
      distanceKm: 890,
      weightRatio: "45:40:15",
      registrationDate: "2024-01-20",
      status: "완료" as const,
    },
    {
      settlementName: "2024년 2월 정산",
      transactionDate: "2024-02-15",
      tagAgency: "서울교통공사",
      initialLine: "3호선",
      lineSection: "고속터미널~교대",
      distanceKm: 1560,
      weightRatio: "50:35:15",
      registrationDate: "2024-02-20",
      status: "대기" as const,
    },
    {
      settlementName: "2024년 2월 정산",
      transactionDate: "2024-02-15",
      tagAgency: "서울교통공사",
      initialLine: "4호선",
      lineSection: "사당~남태령",
      distanceKm: 1120,
      weightRatio: "70:20:10",
      registrationDate: "2024-02-20",
      status: "대기" as const,
    },
    {
      settlementName: "2024년 3월 정산",
      transactionDate: "2024-03-15",
      tagAgency: "서울교통공사",
      initialLine: "5호선",
      lineSection: "강동~천호",
      distanceKm: 980,
      weightRatio: "55:30:15",
      registrationDate: "2024-03-20",
      status: "대기" as const,
    },
    {
      settlementName: "2024년 3월 정산",
      transactionDate: "2024-03-15",
      tagAgency: "서울교통공사",
      initialLine: "6호선",
      lineSection: "봉화산~화랑대",
      distanceKm: 1340,
      weightRatio: "40:45:15",
      registrationDate: "2024-03-20",
      status: "대기" as const,
    },
    {
      settlementName: "2024년 4월 정산",
      transactionDate: "2024-04-15",
      tagAgency: "서울교통공사",
      initialLine: "7호선",
      lineSection: "장암~도봉산",
      distanceKm: 1670,
      weightRatio: "65:25:10",
      registrationDate: "2024-04-20",
      status: "대기" as const,
    },
    {
      settlementName: "2024년 4월 정산",
      transactionDate: "2024-04-15",
      tagAgency: "서울교통공사",
      initialLine: "8호선",
      lineSection: "암사~천호",
      distanceKm: 890,
      weightRatio: "50:35:15",
      registrationDate: "2024-04-20",
      status: "대기" as const,
    },
  ];

  // 필터 적용
  let filteredData = mockData;
  
  if (filters.settlementName) {
    filteredData = filteredData.filter(item => 
      item.settlementName === filters.settlementName
    );
  }
  
  if (filters.transactionDate) {
    filteredData = filteredData.filter(item => 
      item.transactionDate === filters.transactionDate
    );
  }

  return filteredData;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("모의정산 등록 API 호출됨");
    console.log("Body:", body);

    const filters: MockSettlementRegisterFilters = {
      settlementName: body.settlementName || "",
      transactionDate: body.transactionDate || "",
    };

    // Mock 데이터 사용 (실제 백엔드가 없을 때)
    const mockData = generateMockSettlementData(filters);
    
    console.log("Mock API 모의정산 등록 결과:", mockData);

    return NextResponse.json(mockData, { headers: createCorsHeaders() });
    
    // 실제 백엔드가 있을 때는 아래 코드 사용
    /*
    const { data } = await callExternalApi("selectMockSettlementRegister.do", {
      method: "POST",
      body: filters,
    });

    console.log("외부 API 모의정산 등록 결과:", data);

    return NextResponse.json(data, { headers: createCorsHeaders() });
    */
  } catch (error) {
    console.error("모의정산 등록 API 처리 중 오류 발생:", error);
    return NextResponse.json(
      {
        error: "서버 내부 오류",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: createCorsHeaders() }
    );
  }
}

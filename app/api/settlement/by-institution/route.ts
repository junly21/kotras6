import { NextResponse } from "next/server";
import { createCorsHeaders } from "../../utils/externalApi";

export async function POST(request: Request) {
  try {
    console.log("정산결과 기관별 조회 API 호출됨 (Mock)");

    const body = await request.json();
    console.log("정산결과 기관별 조회 요청 데이터:", body);

    // 랜덤 금액 생성 함수 (100만~10억)
    function getRandomAmount(min = 1_000_000, max = 1_000_000_000) {
      // 10만 단위로 랜덤, 일의자리까지 다르게
      const amount =
        Math.floor(Math.random() * ((max - min) / 100_000 + 1)) * 100_000 + min;
      return amount;
    }

    // 기관 정보
    const agencies = [
      { oper_id: "211100000", oper_nm: "한국철도공사" },
      { oper_id: "211000000", oper_nm: "서울교통공사" },
      { oper_id: "228400000", oper_nm: "인천교통공사" },
      { oper_id: "212100000", oper_nm: "공항철도" },
      { oper_id: "212000000", oper_nm: "서울시메트로9호선" },
      { oper_id: "212300000", oper_nm: "신분당선" },
      { oper_id: "241100000", oper_nm: "의정부경전철" },
      { oper_id: "241000000", oper_nm: "용인경전철" },
      { oper_id: "212600000", oper_nm: "경기철도" },
      { oper_id: "241200000", oper_nm: "우이신설경전철" },
      { oper_id: "241300000", oper_nm: "김포시청" },
      { oper_id: "241400000", oper_nm: "신림선" },
      { oper_id: "212800000", oper_nm: "새서울철도" },
    ];

    // 각 기준 기관별로 타 기관과의 거래 데이터 생성
    const mockSettlementData = [];
    for (const 기준 of agencies) {
      for (const 상대 of agencies) {
        if (기준.oper_id === 상대.oper_id) continue; // 자기 자신 제외
        // 랜덤 지급/수급 생성 (중복 방지 위해 seed-like 방식)
        const base =
          parseInt(기준.oper_id.slice(-3)) + parseInt(상대.oper_id.slice(-3));
        const payment_amount = getRandomAmount(
          1_000_000 * ((base % 5) + 1),
          1_000_000_000 - base * 1000
        );
        const receipt_amount = getRandomAmount(
          1_000_000 * (((base + 3) % 5) + 1),
          1_000_000_000 - base * 2000
        );
        const total_amount = receipt_amount - payment_amount;
        mockSettlementData.push({
          oper_id: 기준.oper_id,
          oper_nm: 상대.oper_nm,
          payment_amount,
          receipt_amount,
          total_amount,
        });
      }
    }

    // 필터링 로직 - oper_id로 매칭
    let filteredData = mockSettlementData;

    if (body.agency && body.agency !== "" && body.agency !== "ALL") {
      filteredData = mockSettlementData.filter(
        (item) => item.oper_id === body.agency
      );
    }

    return NextResponse.json(filteredData, { headers: createCorsHeaders() });
  } catch (error) {
    console.error("정산결과 기관별 조회 API 처리 중 오류 발생:", error);
    // 에러 발생 시에도 빈 배열 반환
    return NextResponse.json([], { headers: createCorsHeaders() });
  }
}

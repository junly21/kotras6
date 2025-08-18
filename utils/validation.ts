import { CommonCodeData } from "@/types/commonCode";
import { DetailCodeData } from "@/types/detailCode";

/**
 * 공통코드 삭제 가능 여부를 검증하는 함수
 * @param commonCode - 삭제하려는 공통코드 데이터
 * @param hasDetailCodes - 상세코드 존재 여부
 * @returns 검증 결과 객체
 */
export function validateCommonCodeDeletion(
  commonCode: CommonCodeData,
  hasDetailCodes: boolean
): {
  canDelete: boolean;
  reason?: string;
} {
  // 시스템코드인 경우 삭제 불가
  if (commonCode.syscd_yn === "Y") {
    return {
      canDelete: false,
      reason: "시스템 코드는 삭제할 수 없습니다.",
    };
  }

  // 상세코드가 존재하는 경우 삭제 불가
  if (hasDetailCodes) {
    return {
      canDelete: false,
      reason: "해당 공통코드에 상세코드가 존재하여 삭제할 수 없습니다.",
    };
  }

  return {
    canDelete: true,
  };
}

/**
 * 상세코드 삭제 가능 여부를 검증하는 함수
 * @param detailCode - 삭제하려는 상세코드 데이터
 * @returns 검증 결과 객체
 */
export function validateDetailCodeDeletion(detailCode: DetailCodeData): {
  canDelete: boolean;
  reason?: string;
} {
  // 시스템코드인 경우 삭제 불가
  if (detailCode.syscd_yn === "Y") {
    return {
      canDelete: false,
      reason: "시스템 코드는 삭제할 수 없습니다.",
    };
  }

  return {
    canDelete: true,
  };
}

/**
 * 출발역과 도착역이 같은지 검증하는 함수
 * @param startStation 출발역 값
 * @param endStation 도착역 값
 * @returns 검증 결과와 에러 메시지
 */
export function validateDifferentStations(
  startStation: string,
  endStation: string
): { isValid: boolean; errorMessage?: string } {
  if (startStation && endStation && startStation === endStation) {
    return {
      isValid: false,
      errorMessage: "출발역과 도착역은 같을 수 없습니다.",
    };
  }
  return { isValid: true };
}

/**
 * 출발역과 도착역이 같은지 검증하는 Zod 스키마 헬퍼
 * @param startStationField 출발역 필드명
 * @param endStationField 도착역 필드명
 * @returns Zod 스키마에 추가할 수 있는 검증 로직
 */
export function createDifferentStationsValidator(
  startStationField: string,
  endStationField: string
) {
  return (data: any) => {
    const startStation = data[startStationField];
    const endStation = data[endStationField];

    if (startStation && endStation && startStation === endStation) {
      return false;
    }
    return true;
  };
}

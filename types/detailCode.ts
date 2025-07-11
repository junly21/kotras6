// 상세코드 데이터 타입
export interface DetailCodeData {
  detail_code: string; // 상세코드
  common_code: string; // 공통코드
  value_1?: string; // 값1
  value_2?: string; // 값2
  value_3?: string; // 값3
  remark?: string; // 비고
  use_yn?: string; // 사용여부
  syscd_yn?: string; // 시스템코드여부
}

// 상세코드 조회 요청 타입
export interface DetailCodeRequest {
  COMMON_CODE: string; // 공통코드
}

// 상세코드 등록/수정 폼 타입
export interface DetailCodeFormData {
  DETAIL_CODE: string; // 상세코드 (필수)
  COMMON_CODE: string; // 공통코드
  VALUE_1: string; // 값1
  VALUE_2: string; // 값2
  VALUE_3: string; // 값3
  REMARK: string; // 비고
  USE_YN: string; // 사용여부
  SYSCD_YN: string; // 시스템코드여부
}

// 상세코드 삭제 요청 타입
export interface DetailCodeDeleteRequest {
  DETAIL_CODE: string; // 삭제할 상세코드
  COMMON_CODE: string; // 공통코드
}

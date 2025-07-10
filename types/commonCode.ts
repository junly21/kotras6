// 공통코드 데이터 타입
export interface CommonCodeData {
  common_code: string; // 공통코드
  common_code_name: string; // 공통코드명
  value_1?: string; // 값1
  value_2?: string; // 값2
  value_3?: string; // 값3
  remark?: string; // 비고
  use_yn?: string; // 사용여부
  syscd_yn?: string; // 시스템코드여부
}

// 공통코드 등록/수정 폼 타입
export interface CommonCodeFormData {
  COMMON_CODE: string; // 공통코드 (필수)
  COMMON_CODE_NAME: string; // 공통코드명
  VALUE_1: string; // 값1
  VALUE_2: string; // 값2
  VALUE_3: string; // 값3
  REMARK: string; // 비고
  USE_YN: string; // 사용여부
  SYSCD_YN: string; // 시스템코드여부
}

// 공통코드 삭제 요청 타입
export interface CommonCodeDeleteRequest {
  COMMON_CODE: string; // 삭제할 공통코드
}

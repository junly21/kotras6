// 작업로그 필터 타입
export interface JobLogFilters {
  processDiv: string; // 프로세스구분 (전체, 정제, 정산)
}

// 작업로그 데이터 타입
export interface JobLogData {
  PROCESS_DIV: string; // 프로세스구분 (코드값)
  DETAIL_DIV: string; // 상세구분
  ACTION_TYPE: string; // 작업유형
  PROCESS_DTM: string; // 작업일시
  ACTION_DIV: string; // 작업구분 (코드값)
}

// 작업로그 폼 데이터 타입
export interface JobLogFormData {
  PROCESS_DIV: string;
  DETAIL_DIV: string;
  ACTION_TYPE: string;
  PROCESS_DTM: string;
  ACTION_DIV: string;
}

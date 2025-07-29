// 네트워크 파일등록 필터 타입
export interface NetworkFileUploadFilters {
  network: string; // 네트워크명
}

// 네트워크 파일등록 데이터 타입
export interface NetworkFileUploadData {
  net_dt: string; // 등록일
  net_nm: string; // 네트워크명
  seq: number; // 순번
}

export interface RouteSearchFilter {
  PATH_GRP_ID: string;
  RIDE_STN_ID: string;
  ALGH_STN_ID: string;
}

export interface RouteSearchResult {
  // 실제 API 응답 구조
  id: number;
  rn: number; // 순위
  ride_stn_id: string; // 출발역 ID
  algh_stn_id: string; // 도착역 ID
  start_node: string; // 출발역 노드 정보
  end_node: string; // 도착역 노드 정보
  path_nm: string; // 경로명
  path_num: string; // 경로 번호
  transfer_list: string; // 환승역 리스트 (JSON 문자열)
  transfer_cnt: number; // 환승 횟수
  km: number; // 거리
  sta_pass_sec: number; // 소요시간 (초)
  cost: number; // 요금
  oper_list: string; // 운영사 리스트
  path_prob: number; // 경로 확률
  rgb: string; // 색상
  path_id: string; // 경로 ID
  path_key: string; // 경로 키
  path_seq: number; // 경로 순서
  operline_list: string; // 운영사-노선 리스트
  tag_oper: string; // 태그 운영사
  start_oper: string; // 시작 운영사
  trans_sty_sec: number; // 환승 대기시간
  trans_mv_sec: number; // 환승 이동시간
  km_oper_list: string; // 운영사별 거리
  km_elev_oper_list: string; // 엘리베이터 운영사별 거리
  km_g_oper_list: string; // 지하 운영사별 거리
  km_ung_operline_list: string; // 지상 노선별 거리
  km_ung_oper_list: string; // 지상 운영사별 거리
  km_g_operline_list: string; // 지하 노선별 거리
  km_elev_operline_list: string; // 엘리베이터 노선별 거리
  path_value: number; // 경로 값
  created_at: number; // 생성 시간
  confirmed_path: string; // 확정경로 포함 여부 (Y/N)
  group_no: number; // 그룹 번호
}

export interface RouteSegment {
  from_station: string;
  to_station: string;
  line: string;
  time: number;
  distance: number;
}

export interface StationOption {
  label: string;
  value: string;
}

// 테스트 페이지용 타입
export interface RouteSearchTestFilter {
  PAGE: string;
  PAGESIZE: string;
}

export interface RouteSearchTestResult {
  // 테스트 페이지용 결과 타입 (기존 RouteSearchResult와 동일)
  id: number;
  rn: number;
  ride_stn_id: string;
  algh_stn_id: string;
  start_node: string;
  end_node: string;
  path_nm: string;
  path_num: string;
  transfer_list: string;
  transfer_cnt: number;
  km: number;
  sta_pass_sec: number;
  cost: number;
  oper_list: string;
  path_prob: number;
  rgb: string;
  path_id: string;
  path_key: string;
  path_seq: number;
  operline_list: string;
  tag_oper: string;
  start_oper: string;
  trans_sty_sec: number;
  trans_mv_sec: number;
  km_oper_list: string;
  km_elev_oper_list: string;
  km_g_oper_list: string;
  km_ung_operline_list: string;
  km_ung_oper_list: string;
  km_g_operline_list: string;
  km_elev_operline_list: string;
  path_value: number;
  created_at: number;
  confirmed_path: string;
  group_no: number;
}

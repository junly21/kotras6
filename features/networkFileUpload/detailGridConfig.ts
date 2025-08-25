import { ColDef } from "ag-grid-community";
import { NodeData, LinkData, PlatformData } from "@/types/networkDetail";

// 노드 컬럼 정의
export const nodeColDefs: ColDef<NodeData>[] = [
  { headerName: "역명", field: "sta_nm", width: 150, resizable: false },
  { headerName: "역번호", field: "sta_num", width: 120, resizable: false },
  { headerName: "노선", field: "subway", width: 100, resizable: false },
  { headerName: "운영기관", field: "oper", width: 150, resizable: false },
  { headerName: "KSCC", field: "kscc", width: 120, resizable: false },
  {
    headerName: "평균체류시간",
    field: "avg_stay",
    minWidth: 100,
    flex: 1,
    resizable: false,
  },
  { headerName: "X좌표", field: "x", minWidth: 120, flex: 1, resizable: false },
  { headerName: "Y좌표", field: "y", minWidth: 120, flex: 1, resizable: false },
  {
    headerName: "개통일",
    field: "open_date",
    minWidth: 120,
    flex: 1,
    resizable: false,
    valueFormatter: (params) => {
      if (!params.value) return "";
      // 밀리초 타임스탬프를 날짜로 변환
      const date = new Date(Number(params.value));
      return date.toLocaleDateString("ko-KR");
    },
  },
  {
    headerName: "환승코드",
    field: "transfer_cd",
    minWidth: 150,
    flex: 1,
    resizable: false,
  },
];

// 링크 컬럼 정의 (그리드용 - 간소화된 버전)
export const linkColDefs: ColDef<LinkData>[] = [
  { headerName: "링크코드", field: "link_cd", width: 120, resizable: false },
  { headerName: "출발역", field: "from_sta_nm", width: 150, resizable: false },
  { headerName: "도착역", field: "to_sta_nm", width: 150, resizable: false },
  { headerName: "노선", field: "subway", width: 100, resizable: false },
  { headerName: "운영기관", field: "oper", width: 150, resizable: false },
  { headerName: "방향", field: "direction", width: 100, resizable: false },
  { headerName: "거리(km)", field: "km", width: 120, resizable: false },
  {
    headerName: "소요시간(초)",
    field: "sta_pass_sec",
    width: 150,
    resizable: false,
  },
  { headerName: "비용", field: "cost", width: 100, resizable: false },
  { headerName: "시작X", field: "start_x", width: 120, resizable: false },
  { headerName: "시작Y", field: "start_y", width: 120, resizable: false },
  { headerName: "종료X", field: "end_x", width: 120, resizable: false },
  { headerName: "종료Y", field: "end_y", width: 120, resizable: false },
];

// 플랫폼 컬럼 정의 (그리드용 - 간소화된 버전)
export const platformColDefs: ColDef<PlatformData>[] = [
  { headerName: "링크코드", field: "link_cd", width: 120, resizable: false },
  { headerName: "출발역", field: "from_sta_nm", width: 150, resizable: false },
  { headerName: "도착역", field: "to_sta_nm", width: 150, resizable: false },
  { headerName: "출발방향", field: "from_dic", width: 150, resizable: false },
  { headerName: "도착방향", field: "to_dic", width: 150, resizable: false },
  {
    headerName: "총이동거리",
    field: "tot_mv_m",
    width: 150,
    resizable: false,
  },
  {
    headerName: "평면이동거리",
    field: "flat_mv_m",
    width: 150,
    resizable: false,
  },
  {
    headerName: "총이동시간",
    field: "tot_mv_sec",
    width: 140,
    resizable: false,
  },
  {
    headerName: "총체류시간",
    field: "tot_sty_sec",
    width: 140,
    resizable: false,
  },
  {
    headerName: "총계단수",
    field: "tot_step_down",
    width: 120,
    resizable: false,
  },
  { headerName: "환승횟수", field: "trans_cnt", width: 120, resizable: false },
];

// CSV 내보내기용 전체 컬럼 정의 (모든 필드 포함)
export const linkColDefsForCsv: ColDef<LinkData>[] = [
  { headerName: "순번", field: "seq", width: 80, resizable: false },
  { headerName: "출발역", field: "from_sta_nm", width: 150, resizable: false },
  {
    headerName: "출발역번호",
    field: "from_sta_num",
    width: 120,
    resizable: false,
  },
  { headerName: "도착역", field: "to_sta_nm", width: 150, resizable: false },
  {
    headerName: "도착역번호",
    field: "to_sta_num",
    width: 120,
    resizable: false,
  },
  { headerName: "링크코드", field: "link_cd", width: 120, resizable: false },
  {
    headerName: "소요시간(초)",
    field: "sta_pass_sec",
    width: 140,
    resizable: false,
  },
  {
    headerName: "이동시간(초)",
    field: "trans_mv_sec",
    width: 140,
    resizable: false,
  },
  {
    headerName: "체류시간(초)",
    field: "trans_sty_sec",
    width: 140,
    resizable: false,
  },
  { headerName: "비용", field: "cost", width: 100, resizable: false },
  { headerName: "거리(km)", field: "km", width: 100, resizable: false },
  { headerName: "노선", field: "subway", width: 100, resizable: false },
  {
    headerName: "개통일",
    field: "open_date",
    width: 120,
    resizable: false,
    valueFormatter: (params) => {
      if (!params.value) return "";
      const date = new Date(Number(params.value));
      return date.toLocaleDateString("ko-KR");
    },
  },
  { headerName: "시작X좌표", field: "start_x", width: 120, resizable: false },
  { headerName: "시작Y좌표", field: "start_y", width: 120, resizable: false },
  { headerName: "종료X좌표", field: "end_x", width: 120, resizable: false },
  { headerName: "종료Y좌표", field: "end_y", width: 120, resizable: false },
  { headerName: "거리_지하", field: "km_g", width: 100, resizable: false },
  { headerName: "거리_지상", field: "km_ung", width: 100, resizable: false },
  {
    headerName: "시작운영사",
    field: "start_oper",
    width: 150,
    resizable: false,
  },
  { headerName: "종료운영사", field: "end_oper", width: 150, resizable: false },
  { headerName: "방향", field: "direction", width: 100, resizable: false },
  { headerName: "운영기관", field: "oper", width: 150, resizable: false },
  { headerName: "운영노선", field: "oper_line", width: 150, resizable: false },
  {
    headerName: "위탁운영사",
    field: "consign_oper",
    width: 150,
    resizable: false,
  },
  { headerName: "총고도", field: "elev_tot", width: 100, resizable: false },
  { headerName: "지상고도", field: "elev_ung", width: 100, resizable: false },
  { headerName: "고도", field: "elev", width: 100, resizable: false },
  { headerName: "지하고도", field: "elev_g", width: 100, resizable: false },
];

// CSV 내보내기용 전체 컬럼 정의 (모든 필드 포함)
export const platformColDefsForCsv: ColDef<PlatformData>[] = [
  { headerName: "순번", field: "seq", width: 80, resizable: false },
  { headerName: "링크순번", field: "link_seq", width: 100, resizable: false },
  { headerName: "링크코드", field: "link_cd", width: 120, resizable: false },
  { headerName: "출발역", field: "from_sta_nm", width: 150, resizable: false },
  { headerName: "출발방향", field: "from_dic", width: 150, resizable: false },
  {
    headerName: "출발방향상세",
    field: "from_dic_sub",
    width: 150,
    resizable: false,
  },
  {
    headerName: "출발역번호",
    field: "from_sta_num",
    width: 120,
    resizable: false,
  },
  { headerName: "도착역", field: "to_sta_nm", width: 150, resizable: false },
  { headerName: "도착방향", field: "to_dic", width: 150, resizable: false },
  {
    headerName: "도착방향상세",
    field: "to_dic_sub",
    width: 150,
    resizable: false,
  },
  {
    headerName: "도착역번호",
    field: "to_sta_num",
    width: 120,
    resizable: false,
  },
  {
    headerName: "총이동거리(m)",
    field: "tot_mv_m",
    width: 150,
    resizable: false,
  },
  {
    headerName: "총이동시간(초)",
    field: "tot_mv_sec",
    width: 140,
    resizable: false,
  },
  {
    headerName: "평면이동거리(m)",
    field: "flat_mv_m",
    width: 150,
    resizable: false,
  },
  {
    headerName: "총계단상승",
    field: "tot_step_up",
    width: 120,
    resizable: false,
  },
  {
    headerName: "총계단하강",
    field: "tot_step_down",
    width: 120,
    resizable: false,
  },
  {
    headerName: "계단상승만",
    field: "only_step_up",
    width: 120,
    resizable: false,
  },
  {
    headerName: "계단상승거리(m)",
    field: "only_step_up_m",
    width: 150,
    resizable: false,
  },
  {
    headerName: "계단하강만",
    field: "only_step_down",
    width: 120,
    resizable: false,
  },
  {
    headerName: "계단하강거리(m)",
    field: "only_step_down_m",
    width: 150,
    resizable: false,
  },
  {
    headerName: "에스컬레이터상승계단",
    field: "step_esc_up_step",
    width: 150,
    resizable: false,
  },
  {
    headerName: "에스컬레이터상승여부",
    field: "step_esc_up_yn",
    width: 150,
    resizable: false,
  },
  {
    headerName: "에스컬레이터상승거리(m)",
    field: "step_esc_up_m",
    width: 180,
    resizable: false,
  },
  {
    headerName: "에스컬레이터하강계단",
    field: "step_esc_down_step",
    width: 150,
    resizable: false,
  },
  {
    headerName: "에스컬레이터하강여부",
    field: "step_esc_down_yn",
    width: 150,
    resizable: false,
  },
  {
    headerName: "에스컬레이터하강거리(m)",
    field: "step_esc_down_m",
    width: 180,
    resizable: false,
  },
  {
    headerName: "에스컬레이터상승만여부",
    field: "only_esc_up_yn",
    width: 180,
    resizable: false,
  },
  {
    headerName: "에스컬레이터상승만거리(m)",
    field: "only_esc_up_m",
    width: 200,
    resizable: false,
  },
  {
    headerName: "에스컬레이터하강만여부",
    field: "only_esc_down_yn",
    width: 180,
    resizable: false,
  },
  {
    headerName: "에스컬레이터하강만거리(m)",
    field: "only_esc_down_m",
    width: 200,
    resizable: false,
  },
  {
    headerName: "총체류시간(초)",
    field: "tot_sty_sec",
    width: 140,
    resizable: false,
  },
  { headerName: "환승횟수", field: "trans_cnt", width: 120, resizable: false },
];

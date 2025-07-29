import { ColDef } from "ag-grid-community";
import { NodeData, LinkData, PlatformData } from "@/types/networkDetail";

// 노드 컬럼 정의
export const nodeColDefs: ColDef<NodeData>[] = [
  { headerName: "역명", field: "sta_nm", width: 150, resizable: true },
  { headerName: "역번호", field: "sta_num", width: 120, resizable: true },
  { headerName: "호선", field: "subway", width: 100, resizable: true },
  { headerName: "운영사", field: "oper", width: 150, resizable: true },
  { headerName: "KSCC", field: "kscc", width: 120, resizable: true },
  {
    headerName: "평균체류시간",
    field: "avg_stay",
    width: 200,
    resizable: true,
  },
  { headerName: "X좌표", field: "x", width: 120, resizable: true },
  { headerName: "Y좌표", field: "y", width: 120, resizable: true },
  { headerName: "개통일", field: "open_date", width: 120, resizable: true },
  {
    headerName: "환승코드",
    field: "transfer_cd",
    width: 150,
    resizable: true,
  },
];

// 링크 컬럼 정의
export const linkColDefs: ColDef<LinkData>[] = [
  { headerName: "링크코드", field: "link_cd", width: 120, resizable: true },
  { headerName: "출발역", field: "from_sta_nm", width: 150, resizable: true },
  { headerName: "도착역", field: "to_sta_nm", width: 150, resizable: true },
  { headerName: "호선", field: "subway", width: 100, resizable: true },
  { headerName: "운영사", field: "oper", width: 150, resizable: true },
  { headerName: "방향", field: "direction", width: 100, resizable: true },
  { headerName: "거리(km)", field: "km", width: 120, resizable: true },
  {
    headerName: "소요시간(초)",
    field: "sta_pass_sec",
    width: 150,
    resizable: true,
  },
  { headerName: "비용", field: "cost", width: 100, resizable: true },
  { headerName: "시작X", field: "start_x", width: 120, resizable: true },
  { headerName: "시작Y", field: "start_y", width: 120, resizable: true },
  { headerName: "종료X", field: "end_x", width: 120, resizable: true },
  { headerName: "종료Y", field: "end_y", width: 120, resizable: true },
];

// 플랫폼 컬럼 정의
export const platformColDefs: ColDef<PlatformData>[] = [
  { headerName: "링크코드", field: "link_cd", width: 120, resizable: true },
  { headerName: "출발역", field: "from_sta_nm", width: 150, resizable: true },
  { headerName: "도착역", field: "to_sta_nm", width: 150, resizable: true },
  { headerName: "출발방향", field: "from_dic", width: 150, resizable: true },
  { headerName: "도착방향", field: "to_dic", width: 150, resizable: true },
  {
    headerName: "총이동거리",
    field: "tot_mv_m",
    width: 150,
    resizable: true,
  },
  {
    headerName: "평면이동거리",
    field: "flat_mv_m",
    width: 150,
    resizable: true,
  },
  {
    headerName: "총이동시간",
    field: "tot_mv_sec",
    width: 140,
    resizable: true,
  },
  {
    headerName: "총체류시간",
    field: "tot_sty_sec",
    width: 140,
    resizable: true,
  },
  {
    headerName: "총계단수",
    field: "tot_step_down",
    width: 120,
    resizable: true,
  },
  { headerName: "환승횟수", field: "trans_cnt", width: 120, resizable: true },
];

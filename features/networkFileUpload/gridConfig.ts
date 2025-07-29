import { ColDef } from "ag-grid-community";
import { NetworkFileUploadData } from "@/types/networkFileUpload";

export const networkFileUploadColDefs: ColDef<NetworkFileUploadData>[] = [
  {
    headerName: "네트워크명",
    field: "net_nm",
    width: 250,
    resizable: true,
  },
  {
    headerName: "등록일",
    field: "net_dt",
    width: 250,
    resizable: true,
  },
  {
    headerName: "노드",
    colId: "노드",
    width: 250,
    resizable: true,
    valueGetter: () => "[보기]",
    cellStyle: {
      cursor: "pointer",
    },
  },
  {
    headerName: "링크",
    colId: "링크",
    width: 250,
    resizable: true,
    valueGetter: () => "[보기]",
    cellStyle: {
      cursor: "pointer",
    },
  },
  {
    headerName: "플랫폼",
    colId: "플랫폼",
    width: 250,
    resizable: true,
    valueGetter: () => "[보기]",
    cellStyle: {
      cursor: "pointer",
    },
  },
];

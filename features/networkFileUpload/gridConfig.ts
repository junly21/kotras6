import { ColDef } from "ag-grid-community";
import { NetworkFileUploadData } from "@/types/networkFileUpload";

export const networkFileUploadColDefs: ColDef<NetworkFileUploadData>[] = [
  {
    headerName: "네트워크명",
    field: "net_nm",
    flex: 2,
    minWidth: 150,
    resizable: false,
  },
  {
    headerName: "등록일",
    field: "net_dt",
    flex: 1,
    minWidth: 150,
    resizable: false,
  },
  {
    headerName: "노드",
    colId: "노드",
    flex: 1,
    minWidth: 150,
    resizable: false,
    valueGetter: () => "[보기]",
    cellStyle: {
      cursor: "pointer",
    },
  },
  {
    headerName: "링크",
    colId: "링크",
    flex: 1,
    minWidth: 150,
    resizable: false,
    valueGetter: () => "[보기]",
    cellStyle: {
      cursor: "pointer",
    },
  },
  {
    headerName: "플랫폼",
    colId: "플랫폼",
    flex: 1,
    minWidth: 150,
    resizable: false,
    valueGetter: () => "[보기]",
    cellStyle: {
      cursor: "pointer",
    },
  },
];

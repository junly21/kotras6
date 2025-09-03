import { FieldConfig } from "@/types/filterForm";

export const settlementByOdFilterConfig: FieldConfig[] = [
  {
    name: "STN_ID1",
    label: "출발역",
    type: "combobox",
    placeholder: "출발역을 선택하세요",
    required: true,
    optionsEndpoint: "/api/selectNetWorkNodeSelectBox?NET_DT=LATEST",
  },
  {
    name: "STN_ID2",
    label: "도착역",
    type: "combobox",
    placeholder: "도착역을 선택하세요",
    required: true,
    // optionsEndpoint 제거 - 페이지에서 동적으로 옵션 전달
  },
];

import { FieldConfig } from "@/types/filterForm";

export const mockSettlementByOdFilterConfig: FieldConfig[] = [
  {
    name: "settlementName",
    label: "정산명",
    type: "select",
    placeholder: "정산명을 선택하세요",
    required: true,
    optionsEndpoint: "/api/mock-settlement/settlement-names-select",
  },
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
    optionsEndpoint: "/api/selectNetWorkNodeSelectBox?NET_DT=LATEST",
  },
];

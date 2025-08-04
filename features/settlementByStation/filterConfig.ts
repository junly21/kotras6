import { FieldConfig } from "@/types/filterForm";

export const settlementByStationFilterConfig: FieldConfig[] = [
  {
    name: "STN_ID1",
    label: "선택역1",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeList",
  },
  {
    name: "STN_ID2",
    label: "선택역2",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeList",
  },
  {
    name: "STN_ID3",
    label: "선택역3",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeList",
  },
  {
    name: "STN_ID4",
    label: "선택역4",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeList",
  },
  {
    name: "STN_ID5",
    label: "선택역5",
    type: "combobox",
    placeholder: "역을 선택하세요",
    required: false,
    optionsEndpoint: "/api/selectNetWorkNodeList",
  },
];

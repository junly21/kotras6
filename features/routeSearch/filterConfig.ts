import { FieldConfig } from "@/types/filterForm";

export const routeSearchFilterConfig: FieldConfig[] = [
  {
    name: "RIDE_STN_ID",
    label: "출발역",
    type: "combobox",
    placeholder: "출발역을 선택하세요",
    required: true,
    optionsEndpoint: "/api/selectNetWorkNodeList",
  },
  {
    name: "ALGH_STN_ID",
    label: "도착역",
    type: "combobox",
    placeholder: "도착역을 선택하세요",
    required: true,
    optionsEndpoint: "/api/selectNetWorkNodeList",
  },
];

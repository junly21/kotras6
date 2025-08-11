import { FieldConfig } from "@/types/filterForm";

export const routeSearchFilterConfig: FieldConfig[] = [
  {
    name: "RIDE_STN_ID",
    label: "출발역",
    type: "combobox",
    placeholder: "출발역을 선택하세요",
    required: true,
    optionsEndpoint: "/api/route-search/stations",
  },
  {
    name: "ALGH_STN_ID",
    label: "도착역",
    type: "combobox",
    placeholder: "출발역을 먼저 선택해주세요",
    required: true,
    // optionsEndpoint 제거 - 초기 로딩 시 호출되지 않도록
    disabled: true, // 초기에는 비활성화
    dependsOn: "RIDE_STN_ID", // 출발역 선택에 의존
  },
];

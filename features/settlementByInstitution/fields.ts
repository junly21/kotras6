import type { FieldConfig } from "@/types/filterForm";

// 필터 필드 설정
export const settlementByInstitutionFields: FieldConfig[] = [
  {
    name: "agency",
    label: "기관명",
    type: "select",
    required: true,
    placeholder: "기관을 선택하세요",
    optionsEndpoint: "/api/common/agencies?includeAll=false",
  },
];

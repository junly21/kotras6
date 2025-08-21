import type { FieldConfig } from "@/types/filterForm";

// 필터 필드 설정
export const settlementByInstitutionFields: FieldConfig[] = [
  {
    name: "agency",
    label: "기관명",
    type: "select",
    required: true,
    placeholder: "기관명을 선택하세요",
    optionsEndpoint: "/api/common/agencies",
    filterOptions: (options) => options.filter((opt) => opt.label !== "전체"),
  },
];

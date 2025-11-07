import type { FieldConfig } from "@/types/filterForm";

// 위탁구간 조회 필터 필드 설정
export const settlementConsignmentFields: FieldConfig[] = [
  {
    name: "oper_id",
    label: "기관명",
    type: "select",
    required: true,
    placeholder: "기관명을 선택하세요",
    optionsEndpoint: "/api/settlement/consignment/agencies",
    filterOptions: (options) => options.filter((opt) => opt.label !== "전체"),
  },
  // {
  //   name: "stmtGrpId",
  //   label: "대안",
  //   type: "select",
  //   required: true,
  //   placeholder: "대안을 선택하세요",
  //   optionsEndpoint: "/api/stmt_grp_id",
  // },
  {
    name: "lineCd",
    label: "노선명",
    type: "select",
    required: true,
    placeholder: "노선명을 선택하세요",
    disabled: true, // 초기에는 비활성화
    dependsOn: "oper_id", // 기관명 선택에 의존
  },
  {
    name: "targetOperId",
    label: "대상기관",
    type: "select",
    required: true,
    placeholder: "대상기관을 선택하세요",
    disabled: true, // 초기에는 비활성화
    dependsOn: "oper_id", // 기관명 선택에 의존
  },
];

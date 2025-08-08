import { FieldConfig } from "@/types/filterForm";
import { z } from "zod";

// 검증 스키마
export const mockSettlementByInstitutionSchema = z.object({
  settlementName: z.string().optional(),
  agency: z.string().optional(),
});

// 필터 필드 설정
export const mockSettlementByInstitutionFilterConfig: FieldConfig[] = [
  {
    name: "settlementName",
    label: "정산명",
    type: "select",
    placeholder: "정산명을 선택하세요",
    required: false,
    optionsEndpoint: "/api/mock-settlement/settlement-names-select",
  },
  {
    name: "agency",
    label: "기관명",
    type: "select",
    placeholder: "기관명을 선택하세요",
    required: false,
    optionsEndpoint: "/api/common/agencies?includeAll=false",
  },
];

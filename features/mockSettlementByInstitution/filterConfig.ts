import { FieldConfig } from "@/types/filterForm";
import { z } from "zod";

// 검증 스키마
export const mockSettlementByInstitutionSchema = z.object({
  settlementName: z.string().min(1, "정산명은 필수입니다"),
  agency: z.string().min(1, "기관명은 필수입니다"),
});

// 필터 필드 설정
export const mockSettlementByInstitutionFilterConfig: FieldConfig[] = [
  {
    name: "settlementName",
    label: "정산명",
    type: "select",
    placeholder: "정산명을 선택하세요",
    required: true,
    optionsEndpoint: "/api/mock-settlement/settlement-names-select",
  },
  {
    name: "agency",
    label: "기관명",
    type: "select",
    placeholder: "기관명을 선택하세요",
    required: true,
    optionsEndpoint: "/api/common/agencies",
  },
];

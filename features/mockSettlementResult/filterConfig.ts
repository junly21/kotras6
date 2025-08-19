import { FieldConfig } from "@/types/filterForm";
import { z } from "zod";

// 검증 스키마
export const mockSettlementResultSchema = z.object({
  settlementName: z.string().min(1, "정산명은 필수입니다"),
  transactionDate: z.string().optional(),
});

// 필터 필드 설정
export const mockSettlementResultFilterConfig: FieldConfig[] = [
  {
    name: "settlementName",
    label: "정산명",
    type: "select",
    placeholder: "정산명을 선택하세요",
    required: true,
    optionsEndpoint: "/api/mock-settlement/settlement-names-select",
  },
];

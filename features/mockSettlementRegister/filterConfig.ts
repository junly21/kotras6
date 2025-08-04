import { FieldConfig } from "@/types/filterForm";
import { z } from "zod";

// 검증 스키마
export const mockSettlementRegisterSchema = z.object({
  settlementName: z.string().optional(),
  transactionDate: z.string().optional(),
});

// 필터 필드 설정
export const mockSettlementRegisterFilterConfig: FieldConfig[] = [
  {
    name: "settlementName",
    label: "정산명",
    type: "select",
    placeholder: "정산명을 선택하세요",
    required: false,
    optionsEndpoint: "/api/mock-settlement/settlement-names",
  },
  {
    name: "transactionDate",
    label: "거래일자",
    type: "select",
    placeholder: "거래일자를 선택하세요",
    required: false,
    optionsEndpoint: "/api/mock-settlement/transaction-dates",
  },
];

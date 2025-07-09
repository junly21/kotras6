import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

// 필터 스키마
export const transactionDetailSchema = z.object({
  tradeDate: z.string().min(1, "거래일자를 선택해주세요"),
  cardType: z.string().min(1, "카드구분을 선택해주세요"),
});

// 필터 필드 설정
export const transactionDetailFields: FieldConfig[] = [
  {
    name: "tradeDate",
    label: "거래일자",
    type: "select",
    required: true,
    placeholder: "거래일자를 선택하세요",
    optionsEndpoint: "/api/transaction-detail/dates",
  },
  {
    name: "cardType",
    label: "카드구분",
    type: "select",
    required: true,
    placeholder: "카드구분을 선택하세요",
    optionsEndpoint: "/api/transaction-detail/card-types",
  },
];

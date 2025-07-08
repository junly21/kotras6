import { z } from "zod";
import type { FieldConfig } from "@/types/filterForm";

export const transactionSchema = z.object({
  tradeDate: z.string().nonempty("거래일자를 선택해주세요"),
  cardType: z.string().nonempty("카드 구분을 선택해주세요"),
});

const dummyCardOptions = [
  { label: "신용카드", value: "credit" },
  { label: "체크카드", value: "debit" },
  { label: "기프트카드", value: "gift" },
];

const dummyDateOptions = [
  { label: "오늘", value: "today" },
  { label: "어제", value: "yesterday" },
];

export const transactionFields: FieldConfig[] = [
  { name: "tradeDate", label: "거래일자", type: "date", required: true },
  {
    name: "cardType",
    label: "카드구분",
    type: "select",
    // options: dummyCardOptions,
    optionsEndpoint: "/api/cards",
  },
  {
    name: "dateType",
    label: "날짜",
    type: "select",
    options: dummyDateOptions,
    // optionsEndpoint: "/api/cards",
  },
];

export type TransactionFilters = z.infer<typeof transactionSchema>;

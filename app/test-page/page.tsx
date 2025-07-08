"use client";
import { FilterForm } from "@/components/ui/FilterForm";
import {
  transactionFields,
  transactionSchema,
  TransactionFilters,
} from "@/features/transaction/filterConfig";

export default function TestPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">동적 필드 FilterForm 테스트</h1>
      <FilterForm<TransactionFilters>
        fields={transactionFields}
        defaultValues={{ tradeDate: "", cardType: "" }}
        schema={transactionSchema}
        onSearch={(values) => {
          alert(JSON.stringify(values, null, 2));
        }}
      />
    </div>
  );
}

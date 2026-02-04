"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import type { FieldOption } from "@/types/filterForm";
import {
  TransactionDetailStatisticsFilters,
  transactionDetailStatisticsSchema,
} from "@/types/transactionDetailStatistics";
import type { DetailStatisticsParams } from "@/services/transactionDetailStatisticsService";
import { buildSelectedDateDisplay } from "@/utils/quarter";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateSelectionModal } from "./DateSelectionModal";
import { StationSelectionModal } from "@/components/transactionDetail/StationSelectionModal";

interface DetailStatisticsFilterFormProps {
  defaultValues: TransactionDetailStatisticsFilters;
  onSearch: (
    params: DetailStatisticsParams,
    selectedDateDisplay: string[]
  ) => void;
  className?: string;
}

export function DetailStatisticsFilterForm({
  defaultValues,
  onSearch,
  className,
}: DetailStatisticsFilterFormProps) {
  const form = useForm<TransactionDetailStatisticsFilters>({
    defaultValues,
    resolver: zodResolver(transactionDetailStatisticsSchema),
  });

  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, FieldOption[]>
  >({
    tradeDates: [],
    agency: [],
    lines: [],
  });
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/transaction-detail/dates")
      .then((res) => res.json())
      .then((data: { options: FieldOption[] }) => {
        setDynamicOptions((prev) => ({
          ...prev,
          tradeDates: data.options ?? [],
        }));
      });
    fetch("/api/common/agencies")
      .then((res) => res.json())
      .then((data: { options: FieldOption[] }) => {
        setDynamicOptions((prev) => ({
          ...prev,
          agency: data.options ?? [],
        }));
      });
  }, []);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "agency" && value.agency) {
        const agencyOptions = dynamicOptions.agency || [];
        const selectedAgency = agencyOptions.find(
          (opt) => opt.value === value.agency
        );
        const agencyValue2 =
          selectedAgency?.value2 || selectedAgency?.label || value.agency;
        const agencyValue = agencyValue2 === "전체" ? "ALL" : agencyValue2;

        fetch("/api/transaction-detail/lines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agency: agencyValue }),
        })
          .then((res) => res.json())
          .then((data: { options: FieldOption[] }) => {
            setDynamicOptions((prev) => ({
              ...prev,
              lines: data.options ?? [],
            }));
            form.setValue("lines", []);
          });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, dynamicOptions.agency]);

  const handleSubmit = (values: TransactionDetailStatisticsFilters) => {
    const lineOptionsList = dynamicOptions.lines || [];
    const lineNms = (values.lines || []).map(
      (v) =>
        (lineOptionsList as FieldOption[]).find((o) => String(o.value) === v)
          ?.label ?? v
    );
    const tradeDateOptionsForDisplay = (dynamicOptions.tradeDates || []).map(
      (o) => ({ value: String(o.value), label: String(o.label) })
    );
    const selectedDateDisplay = buildSelectedDateDisplay(
      tradeDateOptionsForDisplay,
      values.tradeDates ?? []
    );
    onSearch(
      {
        tradeDates: values.tradeDates ?? [],
        agency: values.agency,
        lineNms,
        stationDiv: values.stationDiv,
        cardType: values.cardType,
      },
      selectedDateDisplay
    );
  };

  const tradeDateOptions = (dynamicOptions.tradeDates || []).map((o) => ({
    label: String(o.label),
    value: String(o.value),
  }));
  const lineOptions = dynamicOptions.lines || [];
  const selectedTradeDates = form.watch("tradeDates") || [];
  const selectedLines = form.watch("lines") || [];
  const selectedTradeDateLabels = selectedTradeDates
    .map(
      (v) =>
        tradeDateOptions.find((o) => o.value === v)?.label ?? v
    )
    .join(", ");
  const selectedLineLabels = (lineOptions as FieldOption[])
    .filter((opt) => selectedLines.includes(String(opt.value)))
    .map((opt) => opt.label)
    .join(", ");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          "bg-[#E9E9E9] border border-[#D9D9D9] p-4 rounded-xl",
          className
        )}>
        <div className="flex flex-wrap gap-4 items-end">
          {/* 거래일자 (모달) */}
          <FormField
            control={form.control}
            name="tradeDates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  거래일자
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDateModalOpen(true)}
                    className="w-48 justify-between bg-white border border-[#d9d9d9]">
                    <span className="truncate">
                      {selectedTradeDateLabels || "거래일자를 선택하세요"}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(field.value || []).length}개)
                    </span>
                  </Button>
                </FormControl>
              </FormItem>
            )}
          />

          {/* 기관명 */}
          <FormField
            control={form.control}
            name="agency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  기관명
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-48 bg-white border border-[#d9d9d9]">
                      <SelectValue placeholder="기관명을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {(dynamicOptions.agency || []).map((opt, index) => (
                        <SelectItem
                          key={opt.value ?? `agency-${index}`}
                          value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* 노선명 (모달) */}
          <FormField
            control={form.control}
            name="lines"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  노선명
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLineModalOpen(true)}
                    disabled={!form.watch("agency")}
                    className="w-48 justify-between bg-white border border-[#d9d9d9]">
                    <span className="truncate">
                      {selectedLineLabels || "노선명을 선택하세요"}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(field.value || []).length}개)
                    </span>
                  </Button>
                </FormControl>
              </FormItem>
            )}
          />

          {/* 승하차구분 */}
          <FormField
            control={form.control}
            name="stationDiv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  승하차구분
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-48 bg-white border border-[#d9d9d9]">
                      <SelectValue placeholder="승하차구분을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RIDE">승차</SelectItem>
                      <SelectItem value="ALGH">하차</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* 카드구분 Y/N */}
          <FormField
            control={form.control}
            name="cardType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  카드구분
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-48 bg-white border border-[#d9d9d9]">
                      <SelectValue placeholder="카드구분을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Y">Y</SelectItem>
                      <SelectItem value="N">N</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="rounded-lg">
            조회
          </Button>
        </div>
      </form>

      <DateSelectionModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onConfirm={(selected) => {
          form.setValue("tradeDates", selected);
          form.clearErrors("tradeDates");
          setIsDateModalOpen(false);
        }}
        options={tradeDateOptions}
        selectedValues={form.watch("tradeDates") || []}
        title="거래일자 선택"
      />

      <StationSelectionModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
        onConfirm={(selected) => {
          form.setValue("lines", selected);
          form.clearErrors("lines");
          setIsLineModalOpen(false);
        }}
        options={lineOptions}
        selectedValues={form.watch("lines") || []}
        title="노선 선택"
      />
    </Form>
  );
}

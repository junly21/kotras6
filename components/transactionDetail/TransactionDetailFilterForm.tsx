"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import type { FieldOption } from "@/types/filterForm";
import {
  TransactionDetailFilters,
  transactionDetailSchema,
} from "@/types/transactionDetail";
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
import { StationSelectionModal } from "@/components/transactionDetail/StationSelectionModal";

interface TransactionDetailFilterFormProps {
  defaultValues: TransactionDetailFilters;
  onSearch: (values: TransactionDetailFilters) => void;
  className?: string;
}

export function TransactionDetailFilterForm({
  defaultValues,
  onSearch,
  className,
}: TransactionDetailFilterFormProps) {
  const form = useForm<TransactionDetailFilters>({
    defaultValues,
    resolver: zodResolver(transactionDetailSchema),
  });

  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, FieldOption[]>
  >({});
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  // 초기 옵션 로드 (거래일자, 카드구분, 기관명)
  useEffect(() => {
    // 거래일자 옵션 로드
    fetch("/api/transaction-detail/dates")
      .then((res) => res.json())
      .then((data: { options: FieldOption[] }) => {
        setDynamicOptions((prev) => ({
          ...prev,
          tradeDate: data.options ?? [],
        }));
      });

    // 카드구분 옵션 로드 제거됨

    // 기관명 옵션 로드
    fetch("/api/common/agencies")
      .then((res) => res.json())
      .then((data: { options: FieldOption[] }) => {
        setDynamicOptions((prev) => ({
          ...prev,
          agency: data.options ?? [],
        }));
      });
  }, []);

  // 기관명 변경 시 노선명 옵션 로드
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "agency" && value.agency) {
        // 기관명의 value2 값을 찾기 (value2가 없으면 label 사용)
        const agencyOptions = dynamicOptions.agency || [];
        const selectedAgency = agencyOptions.find(
          (opt) => opt.value === value.agency
        );
        const agencyValue2 =
          selectedAgency?.value2 || selectedAgency?.label || value.agency;

        // '전체' 선택 시에는 'ALL'로 전송, 그 외에는 value2 값 사용
        const agencyValue = agencyValue2 === "전체" ? "ALL" : agencyValue2;

        // 노선명 옵션 로드
        fetch("/api/transaction-detail/lines", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agency: agencyValue }),
        })
          .then((res) => res.json())
          .then((data: { options: FieldOption[] }) => {
            setDynamicOptions((prev) => ({
              ...prev,
              line: data.options ?? [],
            }));
            // 노선명 필드 초기화
            form.setValue("line", "");
            form.setValue("stations", []);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, dynamicOptions.agency]);

  // 노선명 변경 시 역 목록 옵션 로드
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "line" && value.line) {
        // 노선명의 label 값을 찾기
        const lineOptions = dynamicOptions.line || [];
        const selectedLine = lineOptions.find(
          (opt) => opt.value === value.line
        );
        const lineLabel = selectedLine?.label || value.line;

        // 기관명의 value2 값을 찾기 (value2가 없으면 label 사용)
        const agencyOptions = dynamicOptions.agency || [];
        const selectedAgency = agencyOptions.find(
          (opt) => opt.value === value.agency
        );
        const agencyValue2 =
          selectedAgency?.value2 || selectedAgency?.label || value.agency;
        // '전체' 선택 시에는 'ALL'로 전송, 그 외에는 value2 값 사용
        const agencyValue = agencyValue2 === "전체" ? "ALL" : agencyValue2;

        // 역 목록 옵션 로드
        fetch("/api/transaction-detail/stations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            line: lineLabel,
            agency: agencyValue,
          }),
        })
          .then((res) => res.json())
          .then((data: { options: FieldOption[] }) => {
            setDynamicOptions((prev) => ({
              ...prev,
              stations: data.options ?? [],
            }));
            // 역 선택 필드 초기화
            form.setValue("stations", []);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, dynamicOptions.line, dynamicOptions.agency]);

  const handleSubmit = (values: TransactionDetailFilters) => {
    // 기관명은 value (ID)를 직접 사용, '전체' 선택 시에만 'ALL'로 전송
    const agencyOptions = dynamicOptions.agency || [];
    const lineOptions = dynamicOptions.line || [];

    const selectedAgency = agencyOptions.find(
      (opt) => opt.value === values.agency
    );
    const selectedLine = lineOptions.find((opt) => opt.value === values.line);

    // '전체' 선택 시에는 'ALL'로 전송, 그 외에는 value (ID) 값 사용
    const agencyValue = values.agency === "ALL" ? "ALL" : values.agency;

    const convertedValues = {
      ...values,
      agency: agencyValue,
      line: selectedLine?.label || values.line,
      // stationDiv는 이미 RIDE/ALGH 값이므로 그대로 사용
    };

    console.log("변환된 필터 값:", convertedValues);
    onSearch(convertedValues);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          "bg-[#E9E9E9] border border-[#D9D9D9] p-4 rounded-xl",
          className
        )}>
        <div className="flex flex-wrap gap-4 items-end">
          {/* 거래일자 */}
          <FormField
            control={form.control}
            name="tradeDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  거래일자
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-48 bg-white border border-[#d9d9d9]">
                      <SelectValue placeholder="거래일자를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {(dynamicOptions.tradeDate || []).map((opt, index) => (
                        <SelectItem
                          key={opt.value || `tradeDate-${index}`}
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

          {/* 카드구분 필드 제거됨 */}

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
                          key={opt.value || `agency-${index}`}
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

          {/* 노선명 */}
          <FormField
            control={form.control}
            name="line"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  노선명
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch("agency")}>
                    <SelectTrigger className="w-48 bg-white border border-[#d9d9d9]">
                      <SelectValue placeholder="노선명을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {(dynamicOptions.line || []).map((opt, index) => (
                        <SelectItem
                          key={opt.value || `line-${index}`}
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

          {/* 역선택 */}
          <FormField
            control={form.control}
            name="stations"
            render={({ field }) => {
              const selectedStations = field.value || [];
              const selectedLabels = (dynamicOptions.stations || [])
                .filter((opt) => selectedStations.includes(String(opt.value)))
                .map((opt) => opt.label)
                .join(", ");

              return (
                <FormItem>
                  <FormLabel>
                    역선택
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsStationModalOpen(true)}
                      disabled={!form.watch("line")}
                      className="w-48 justify-between bg-white border border-[#d9d9d9]">
                      <span className="truncate">
                        {selectedLabels || "역을 선택하세요"}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({selectedStations.length}개)
                      </span>
                    </Button>
                  </FormControl>
                </FormItem>
              );
            }}
          />

          {/* 조회 버튼 */}
          <Button type="submit" className="rounded-lg">
            조회
          </Button>
        </div>
      </form>

      {/* 역선택 모달 */}
      <StationSelectionModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        onConfirm={(selectedStations) => {
          form.setValue("stations", selectedStations);
          // 역 선택 후 에러 상태 클리어
          form.clearErrors("stations");
          setIsStationModalOpen(false);
        }}
        options={dynamicOptions.stations || []}
        selectedValues={form.watch("stations") || []}
        title="역 선택"
      />
    </Form>
  );
}

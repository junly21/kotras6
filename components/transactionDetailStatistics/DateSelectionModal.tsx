"use client";

import { useState, useEffect } from "react";
import { Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { FieldOption } from "@/types/filterForm";
import { getDateValuesInQuarter } from "@/utils/quarter";

interface DateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDates: string[]) => void;
  options: FieldOption[];
  selectedValues: string[];
  title?: string;
}

export function DateSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  options,
  selectedValues,
  title = "거래일자 선택",
}: DateSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>(selectedValues);

  const dateOpts = options.map((o) => ({
    value: String(o.value),
    label: String(o.label),
  }));

  const filteredOptions = options.filter((option) =>
    String(option.label)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedDates.length;

  const handleSelectAll = () => {
    setSelectedDates(filteredOptions.map((opt) => String(opt.value)));
  };

  const handleDeselectAll = () => {
    setSelectedDates([]);
  };

  const handleToggleDate = (dateValue: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateValue)
        ? prev.filter((v) => v !== dateValue)
        : [...prev, dateValue]
    );
  };

  const handleQuarterClick = (quarter: 1 | 2 | 3 | 4) => {
    const quarterValues = getDateValuesInQuarter(dateOpts, quarter);
    setSelectedDates((prev) => {
      const inQuarter = prev.filter((v) => quarterValues.includes(v));
      const allSelected =
        quarterValues.length > 0 && inQuarter.length === quarterValues.length;
      if (allSelected) {
        return prev.filter((v) => !quarterValues.includes(v));
      }
      const added = new Set([...prev, ...quarterValues]);
      return Array.from(added);
    });
  };

  const isQuarterActive = (quarter: 1 | 2 | 3 | 4) => {
    const quarterValues = getDateValuesInQuarter(dateOpts, quarter);
    if (quarterValues.length === 0) return false;
    const selectedSet = new Set(selectedDates);
    return quarterValues.every((v) => selectedSet.has(v));
  };

  const handleConfirm = () => {
    onConfirm(selectedDates);
    onClose();
  };

  useEffect(() => {
    setSelectedDates(selectedValues);
  }, [selectedValues, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[650px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-sm text-gray-500">
              {selectedCount}개 선택됨
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* 스크롤 영역: footer는 항상 하단에 고정 */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* 분기 버튼 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">분기:</span>
            {([1, 2, 3, 4] as const).map((q) => (
              <Button
                key={q}
                variant={isQuarterActive(q) ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuarterClick(q)}>
                {q}분기
              </Button>
            ))}
          </div>

          {/* 검색 및 전체 선택/해제 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="날짜 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredOptions.length === 0}>
              전체 선택
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={selectedCount === 0}>
              전체 해제
            </Button>
          </div>

          {/* 날짜 목록 */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "검색 결과가 없습니다." : "날짜 목록이 없습니다."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1 p-2">
                {filteredOptions.map((option) => {
                  const valueStr = String(option.value);
                  const isSelected = selectedDates.includes(valueStr);
                  return (
                    <div
                      key={valueStr}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                        isSelected && "bg-blue-50 border border-blue-200"
                      )}
                      onClick={() => handleToggleDate(valueStr)}>
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center",
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300"
                        )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="flex-1 text-sm">{option.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">
              선택된 거래일자 ({selectedCount}개)
            </h4>
            <div className="flex flex-wrap gap-2 min-h-[32px] max-h-24 overflow-y-auto">
              {selectedDates.map((dateValue) => {
                const opt = options.find((o) => String(o.value) === dateValue);
                return (
                  <div
                    key={dateValue}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    <span>{opt?.label ?? dateValue}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDate(dateValue);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={selectedCount === 0}>
            확인 ({selectedCount}개)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

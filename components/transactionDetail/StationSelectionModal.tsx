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

interface StationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedStations: string[]) => void;
  options: FieldOption[];
  selectedValues: string[];
  title?: string;
}

export function StationSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  options,
  selectedValues,
  title = "역 선택",
}: StationSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStations, setSelectedStations] =
    useState<string[]>(selectedValues);

  // 검색어에 따른 필터링된 옵션
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 선택된 역 개수
  const selectedCount = selectedStations.length;

  // 전체 선택/해제
  const handleSelectAll = () => {
    setSelectedStations(filteredOptions.map((opt) => String(opt.value)));
  };

  const handleDeselectAll = () => {
    setSelectedStations([]);
  };

  // 개별 선택/해제
  const handleToggleStation = (stationValue: string) => {
    setSelectedStations((prev) =>
      prev.includes(stationValue)
        ? prev.filter((v) => v !== stationValue)
        : [...prev, stationValue]
    );
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    onConfirm(selectedStations);
    onClose();
  };

  // 모달이 열릴 때마다 선택된 값으로 초기화
  useEffect(() => {
    setSelectedStations(selectedValues);
  }, [selectedValues, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-sm text-gray-500">
              {selectedCount}개 선택됨
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* 검색 및 전체 선택/해제 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="역명으로 검색..."
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

          {/* 역 목록 */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            <div className="max-h-96 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "검색 결과가 없습니다." : "역 목록이 없습니다."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 p-2">
                  {filteredOptions.map((option) => {
                    const isSelected = selectedStations.includes(
                      String(option.value)
                    );
                    return (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                          isSelected && "bg-blue-50 border border-blue-200"
                        )}
                        onClick={() =>
                          handleToggleStation(String(option.value))
                        }>
                        <div
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center",
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          )}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="flex-1 text-sm">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 선택된 역 미리보기 */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">
              선택된 역 ({selectedCount}개)
            </h4>
            <div className="flex flex-wrap gap-2 min-h-[32px] max-h-16 overflow-y-auto">
              {selectedStations.map((stationValue) => {
                const station = options.find(
                  (opt) => String(opt.value) === stationValue
                );
                return (
                  <div
                    key={stationValue}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    <span>{station?.label}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStation(stationValue);
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

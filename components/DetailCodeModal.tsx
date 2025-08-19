"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailCodeFormData } from "@/types/detailCode";

// 중복 검증을 위한 스키마 생성 함수
const createDetailCodeSchema = (existingCodes: string[] = []) => {
  return z.object({
    DETAIL_CODE: z
      .string()
      .min(1, "상세코드는 필수입니다")
      .max(7, "상세코드는 7자 이하여야 합니다")
      .refine(
        (code) => !existingCodes.includes(code),
        "동일한 값의 상세코드가 존재합니다"
      ),
    COMMON_CODE: z.string().min(1, "공통코드는 필수입니다"),
    VALUE_1: z.string().max(100, "값1은 100자 이하여야 합니다"),
    VALUE_2: z.string().max(100, "값2는 100자 이하여야 합니다"),
    VALUE_3: z.string().max(100, "값3은 100자 이하여야 합니다"),
    REMARK: z.string().max(100, "비고는 100자 이하여야 합니다"),
    USE_YN: z.string(),
    SYSCD_YN: z.string(),
  });
};

interface DetailCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DetailCodeFormData) => void;
  initialData?: DetailCodeFormData;
  mode: "add" | "edit";
  loading?: boolean;
  selectedCommonCode?: string; // 선택된 공통코드
  existingCodes?: string[]; // 기존 상세코드 목록 추가
}

export function DetailCodeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  loading = false,
  selectedCommonCode,
  existingCodes = [],
}: DetailCodeModalProps) {
  // 동적으로 스키마 생성 (중복 검증 포함)
  const dynamicSchema = createDetailCodeSchema(existingCodes);

  const form = useForm<DetailCodeFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      DETAIL_CODE: "",
      COMMON_CODE: selectedCommonCode || "",
      VALUE_1: "",
      VALUE_2: "",
      VALUE_3: "",
      REMARK: "",
      USE_YN: "N",
      SYSCD_YN: "Y",
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset(initialData);
    } else if (isOpen && mode === "add") {
      form.reset({
        DETAIL_CODE: "",
        COMMON_CODE: selectedCommonCode || "",
        VALUE_1: "",
        VALUE_2: "",
        VALUE_3: "",
        REMARK: "",
        USE_YN: "N",
        SYSCD_YN: "Y",
      });
    }
  }, [isOpen, initialData, mode, form, selectedCommonCode]);

  const handleSubmit = (data: DetailCodeFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "상세코드 등록" : "상세코드 수정"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="DETAIL_CODE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">상세코드 *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="상세코드를 입력하세요"
                        disabled={mode === "edit"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="COMMON_CODE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">
                      공통코드 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="공통코드를 입력하세요"
                        disabled={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="VALUE_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">값1</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="값1을 입력하세요" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="VALUE_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">값2</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="값2를 입력하세요" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="VALUE_3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">값3</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="값3을 입력하세요" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="REMARK"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">비고</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="비고를 입력하세요" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="USE_YN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">사용여부</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="사용여부를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Y">예</SelectItem>
                        <SelectItem value="N">아니오</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="SYSCD_YN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">
                      시스템코드유무
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={true}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="시스템코드유무를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Y">예</SelectItem>
                        <SelectItem value="N">아니오</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "처리 중..." : mode === "add" ? "추가" : "수정"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

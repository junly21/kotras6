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
import { CommonCodeFormData } from "@/types/commonCode";

// 중복 검증을 위한 스키마 생성 함수
const createCommonCodeSchema = (existingCodes: string[] = []) => {
  return z.object({
    COMMON_CODE: z
      .string()
      .min(1, "공통코드는 필수입니다")
      .refine(
        (code) => !existingCodes.includes(code),
        "이미 등록된 공통코드입니다"
      ),
    COMMON_CODE_NAME: z.string(),
    VALUE_1: z.string(),
    VALUE_2: z.string(),
    VALUE_3: z.string(),
    REMARK: z.string(),
    USE_YN: z.string(),
    SYSCD_YN: z.string(),
  });
};

interface CommonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CommonCodeFormData) => void;
  initialData?: CommonCodeFormData;
  mode: "add" | "edit";
  loading?: boolean;
  existingCodes?: string[]; // 기존 공통코드 목록 추가
}

export function CommonCodeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  loading = false,
  existingCodes = [],
}: CommonCodeModalProps) {
  // 동적으로 스키마 생성 (중복 검증 포함)
  const dynamicSchema = createCommonCodeSchema(existingCodes);

  const form = useForm<CommonCodeFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      COMMON_CODE: "",
      COMMON_CODE_NAME: "",
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
        COMMON_CODE: "",
        COMMON_CODE_NAME: "",
        VALUE_1: "",
        VALUE_2: "",
        VALUE_3: "",
        REMARK: "",
        USE_YN: "N",
        SYSCD_YN: "Y",
      });
    }
  }, [isOpen, initialData, mode, form]);

  const handleSubmit = (data: CommonCodeFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "공통코드 등록" : "공통코드 수정"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                        disabled={mode === "edit"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="COMMON_CODE_NAME"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="min-w-[85px]">공통코드명</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="공통코드명을 입력하세요" />
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

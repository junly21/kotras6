"use client";

import { useState } from "react";
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

// 폼 스키마
const networkFileUploadSchema = z.object({
  networkName: z.string().min(1, "네트워크명은 필수입니다"),
  date: z.string().min(1, "날짜는 필수입니다"),
  nodeFile: z.instanceof(File, { message: "노드 파일을 선택해주세요" }),
  linkFile: z.instanceof(File, { message: "링크 파일을 선택해주세요" }),
  platformFile: z.instanceof(File, { message: "플랫폼 파일을 선택해주세요" }),
});

type NetworkFileUploadFormData = z.infer<typeof networkFileUploadSchema>;

interface NetworkFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NetworkFileUploadFormData) => void;
  loading?: boolean;
}

export function NetworkFileUploadModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: NetworkFileUploadModalProps) {
  const [nodeFileName, setNodeFileName] = useState<string>("");
  const [linkFileName, setLinkFileName] = useState<string>("");
  const [platformFileName, setPlatformFileName] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  const form = useForm<NetworkFileUploadFormData>({
    resolver: zodResolver(networkFileUploadSchema),
    defaultValues: {
      networkName: "",
      date: "",
      nodeFile: undefined as unknown as File,
      linkFile: undefined as unknown as File,
      platformFile: undefined as unknown as File,
    },
  });

  // CSV 파일 유효성 검증
  const validateCSVFile = (file: File): boolean => {
    // 파일 확장자 검증
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return false;
    }

    // 파일 크기 검증 (예: 10MB 이하)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return false;
    }

    return true;
  };

  // 파일 내용 유효성 검증 (간단한 CSV 구조 확인)
  const validateCSVContent = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      // 최소 2줄 이상 (헤더 + 데이터)
      if (lines.length < 2) {
        return false;
      }

      // 첫 번째 줄에 쉼표가 있는지 확인 (CSV 구조)
      const firstLine = lines[0];
      if (!firstLine.includes(",")) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("CSV 파일 읽기 오류:", error);
      return false;
    }
  };

  const handleSubmit = async (data: NetworkFileUploadFormData) => {
    setValidationError("");

    try {
      // 파일 유효성 검증
      const files = [
        { file: data.nodeFile, name: "노드" },
        { file: data.linkFile, name: "링크" },
        { file: data.platformFile, name: "플랫폼" },
      ];

      for (const { file, name } of files) {
        // 기본 CSV 검증
        if (!validateCSVFile(file)) {
          setValidationError(`${name} 파일이 유효한 CSV 파일이 아닙니다.`);
          return;
        }

        // 파일 내용 검증
        const isValidContent = await validateCSVContent(file);
        if (!isValidContent) {
          setValidationError(
            `${name} 파일의 내용이 올바른 CSV 형식이 아닙니다.`
          );
          return;
        }
      }

      // 모든 검증 통과 시 제출
      onSubmit(data);
    } catch (error) {
      console.error("파일 검증 중 오류:", error);
      setValidationError("파일 검증 중 오류가 발생했습니다.");
    }
  };

  const handleFileChange = (
    field: "nodeFile" | "linkFile" | "platformFile",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 유효성 검증
      if (!validateCSVFile(file)) {
        alert("CSV 파일만 선택 가능합니다.");
        event.target.value = "";
        return;
      }

      form.setValue(field, file);
      setValidationError("");

      // 파일명 표시
      switch (field) {
        case "nodeFile":
          setNodeFileName(file.name);
          break;
        case "linkFile":
          setLinkFileName(file.name);
          break;
        case "platformFile":
          setPlatformFileName(file.name);
          break;
      }
    }
  };

  const handleClose = () => {
    form.reset();
    setNodeFileName("");
    setLinkFileName("");
    setPlatformFileName("");
    setValidationError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>신규 네트워크 등록</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            노드, 링크, 플랫폼 (.csv) 파일을 모두 등록하셔야 합니다.
          </p>
        </div>

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{validationError}</p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="networkName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>네트워크명 *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="네트워크명을 입력하세요" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜 *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        placeholder="날짜를 선택하세요"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nodeFile"
              render={() => (
                <FormItem>
                  <FormLabel>노드 *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange("nodeFile", e)}
                        className="flex-1"
                      />
                      {nodeFileName && (
                        <span className="text-sm text-gray-600 min-w-0 truncate">
                          {nodeFileName}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkFile"
              render={() => (
                <FormItem>
                  <FormLabel>링크 *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange("linkFile", e)}
                        className="flex-1"
                      />
                      {linkFileName && (
                        <span className="text-sm text-gray-600 min-w-0 truncate">
                          {linkFileName}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platformFile"
              render={() => (
                <FormItem>
                  <FormLabel>플랫폼 *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange("platformFile", e)}
                        className="flex-1"
                      />
                      {platformFileName && (
                        <span className="text-sm text-gray-600 min-w-0 truncate">
                          {platformFileName}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "처리 중..." : "등록"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

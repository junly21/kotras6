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

  const handleSubmit = (data: NetworkFileUploadFormData) => {
    onSubmit(data);
  };

  const handleFileChange = (
    field: "nodeFile" | "linkFile" | "platformFile",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue(field, file);

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

"use client";

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
import { MockSettlementRegisterFormData } from "@/types/mockSettlementRegister";

// 폼 스키마
const mockSettlementSchema = z
  .object({
    settlementName: z.string().min(1, "정산명은 필수입니다"),
    tradeDate: z.string().min(1, "거래일자는 필수입니다"),
    // 기본운임 배분 비율
    tagAgencyRatio: z
      .number()
      .min(0, "0 이상이어야 합니다")
      .max(100, "100 이하여야 합니다"),
    initialLineRatio: z
      .number()
      .min(0, "0 이상이어야 합니다")
      .max(100, "100 이하여야 합니다"),
    lineSectionRatio: z
      .number()
      .min(0, "0 이상이어야 합니다")
      .max(100, "100 이하여야 합니다"),
    distanceKmRatio: z
      .number()
      .min(0, "0 이상이어야 합니다")
      .max(100, "100 이하여야 합니다"),
    // 기본운임 인·km 가중치
    undergroundWeight: z.number().min(0, "0 이상이어야 합니다"),
    elevatedWeight: z.number().min(0, "0 이상이어야 합니다"),
    // 도시철도부가사용금 인·km 가중치
    subwayUndergroundWeight: z.number().min(0, "0 이상이어야 합니다"),
    subwayElevatedWeight: z.number().min(0, "0 이상이어야 합니다"),
    // 수송기여도
    contribution: z.record(
      z.string(),
      z.number().min(0, "0 이상이어야 합니다")
    ),
  })
  .refine(
    (data) => {
      const totalRatio =
        data.tagAgencyRatio +
        data.initialLineRatio +
        data.lineSectionRatio +
        data.distanceKmRatio;
      return totalRatio === 100;
    },
    {
      message: "배분 비율의 합이 100%가 아닙니다",
      path: ["tagAgencyRatio"], // 첫 번째 필드에 에러 표시
    }
  );

interface MockSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MockSettlementRegisterFormData) => void;
  tradeDates: string[];
  loading?: boolean;
}

// 수송기여도 기관/노선 목록
const CONTRIBUTION_AGENCIES = [
  "한국철도공사",
  "서울교통공사",
  "인천교통공사",
  "공항철도",
  "서울시메트로9호선",
  "신분당선",
  "의정부경전철",
  "용인경전철",
  "경기철도",
  "우이신설경전철",
  "김포시청",
  "신림선",
  "새서울철도",
];

export function MockSettlementModal({
  isOpen,
  onClose,
  onSubmit,
  tradeDates,
  loading = false,
}: MockSettlementModalProps) {
  const form = useForm<MockSettlementRegisterFormData>({
    resolver: zodResolver(mockSettlementSchema),
    defaultValues: {
      settlementName: "",
      tradeDate: "",
      tagAgencyRatio: 0,
      initialLineRatio: 0,
      lineSectionRatio: 0,
      distanceKmRatio: 0,
      undergroundWeight: 0,
      elevatedWeight: 0,
      subwayUndergroundWeight: 0,
      subwayElevatedWeight: 0,
      contribution: CONTRIBUTION_AGENCIES.reduce((acc, agency) => {
        acc[agency] = 0;
        return acc;
      }, {} as Record<string, number>),
    },
  });

  const handleSubmit = (data: MockSettlementRegisterFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    if (loading) return; // 로딩 중에는 닫기 방지
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : handleClose}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>모의정산 등록</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            onKeyDown={(e) => {
              if (loading && (e.key === "Escape" || e.key === "Enter")) {
                e.preventDefault();
              }
            }}>
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="settlementName"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>정산명 *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="정산명을 입력하세요" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tradeDate"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>거래일자 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger className="min-w-0">
                            <SelectValue placeholder="거래일자를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tradeDates
                            .filter((date) => date !== "ALL") // ALL 옵션 제외
                            .map((date) => (
                              <SelectItem key={date} value={date}>
                                {date}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 기본운임 배분 비율 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                기본운임 배분 비율
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="tagAgencyRatio"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>태그기관 비율 (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialLineRatio"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>초승노선 비율 (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lineSectionRatio"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>노선동등 비율 (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanceKmRatio"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>인·km 비율 (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="100"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 기본운임 인·km 가중치 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                기본운임 인·km 가중치
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="undergroundWeight"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>지하 가중치</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="elevatedWeight"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>고가 가중치</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 도시철도부가사용금 인·km 가중치 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                도시철도부가사용금 인·km 가중치
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="subwayUndergroundWeight"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>도시철도 지하 가중치</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subwayElevatedWeight"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel>도시철도 고가 가중치</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 수송기여도 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                수송기여도
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {CONTRIBUTION_AGENCIES.map((agency) => (
                  <FormField
                    key={agency}
                    control={form.control}
                    name={`contribution.${agency}`}
                    render={({ field }) => (
                      <FormItem className="min-w-0 flex flex-row items-center justify-start">
                        <FormLabel className="text-md font-medium w-24 flex-1 mr-1">
                          {agency}
                        </FormLabel>
                        <FormControl className="flex-1 w-24">
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="any"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}>
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

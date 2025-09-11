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

/** =============================
 *  Zod Schema (기존 유지)
 *  ============================= */
const mockSettlementSchema = z
  .object({
    settlementName: z
      .string()
      .min(1, "정산명은 필수입니다")
      .max(50, "정산명은 50자 이하여야 합니다"),
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
    undergroundWeight: z.number().min(1, "1 이상이어야 합니다"),
    elevatedWeight: z.number().min(1, "1 이상이어야 합니다"),
    // 도시철도부가사용금 인·km 가중치
    subwayUndergroundWeight: z.number().min(1, "1 이상이어야 합니다"),
    subwayElevatedWeight: z.number().min(1, "1 이상이어야 합니다"),
    // 수송기여도
    contribution: z.record(
      z.string(),
      z.number().min(0.1, "0.1 이상이어야 합니다")
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

/** =============================
 *  Props & 상수
 *  ============================= */
interface MockSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MockSettlementRegisterFormData) => void;
  tradeDates: string[];
  loading?: boolean;
}

const CONTRIBUTION_AGENCIES = [
  "한국철도공사",
  "서울교통공사",
  "인천교통공사",
  "공항철도",
  "서울시메트로9호선",
  "신분당선",
  "의정부경전철",
  "용인경량전철",
  "경기철도",
  "우이신설경전철",
  "김포시청",
  "남서울경전철",
  "새서울철도",
];

/** =============================
 *  레이아웃 유틸 클래스 (핵심)
 *  ============================= */
// 섹션: 반응형 그리드 (FHD에서 4열)
const sectionCols =
  "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
// 필드(한 줄): 라벨 고정폭 + 인풋 가변폭
const fieldRow =
  "grid grid-cols-[var(--label-w)_minmax(0,1fr)] items-center gap-3";
// 라벨: 한 줄 유지
const labelCx = "text-sm font-medium whitespace-nowrap leading-tight";
// 메시지: 입력칸 아래에만 위치
const msgCx = "col-start-2";

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
      undergroundWeight: 1,
      elevatedWeight: 1,
      subwayUndergroundWeight: 1,
      subwayElevatedWeight: 1,
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
    if (loading) return;
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : handleClose}>
      {/* FHD 기준 폭 확장 + 스크롤 */}
      <DialogContent className="w-[1600px] max-w-[95vw] 2xl:w-[1760px] max-h-[95vh] overflow-y-auto">
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
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>
              <div className={sectionCols}>
                <FormField
                  control={form.control}
                  name="settlementName"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>정산명 *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="정산명을 입력하세요"
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tradeDate"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>거래일자 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="거래일자를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tradeDates
                            .filter((date) => date !== "ALL")
                            .map((date) => (
                              <SelectItem key={date} value={date}>
                                {date}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 기본운임 배분 비율 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                기본운임 배분 비율
              </h3>

              <div className={sectionCols}>
                <FormField
                  control={form.control}
                  name="tagAgencyRatio"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>
                        태그기관 비율(%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialLineRatio"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>
                        초승노선 비율(%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lineSectionRatio"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>
                        노선동등 비율(%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distanceKmRatio"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>인·km 비율(%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 기본운임 인·km 가중치 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                기본운임 인·km 가중치
              </h3>

              <div className={sectionCols}>
                <FormField
                  control={form.control}
                  name="undergroundWeight"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>지하 가중치</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step={0.1}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="elevatedWeight"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>고가 가중치</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step={0.1}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 도시철도부가사용금 인·km 가중치 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                도시철도부가사용금 인·km 가중치
              </h3>

              <div className={sectionCols}>
                <FormField
                  control={form.control}
                  name="subwayUndergroundWeight"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>
                        도시철도 지하 가중치
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step={0.1}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subwayElevatedWeight"
                  render={({ field }) => (
                    <FormItem className={fieldRow}>
                      <FormLabel className={labelCx}>
                        도시철도 고가 가중치
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step={0.1}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-white text-foreground focus:text-foreground"
                        />
                      </FormControl>
                      <FormMessage className={msgCx} showErrorMessages />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 수송기여도 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                수송기여도
              </h3>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {CONTRIBUTION_AGENCIES.map((agency) => (
                  <FormField
                    key={agency}
                    control={form.control}
                    name={`contribution.${agency}`}
                    render={({ field }) => (
                      <FormItem className={fieldRow}>
                        <FormLabel className={labelCx}>{agency}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            step="any"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="bg-white text-foreground focus:text-foreground"
                          />
                        </FormControl>
                        <FormMessage className={msgCx} showErrorMessages />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* 액션 */}
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

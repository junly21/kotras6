import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";
import { MockSettlementRegisterData } from "@/types/mockSettlementRegister";
import { MockSettlementResultData } from "@/types/mockSettlementResult";

interface MockSettlementDetailData {
  simStmtGrpId: string;
  settlementName: string;
  transactionDate: string;
  tagAgency: string;
  initialLine: string;
  lineSection: string;
  distanceKm: number;
  weightRatio: string;
  registrationDate: string;
  status: "대기" | "완료";
}

interface MockSettlementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  simStmtGrpId: string;
  gridData?: MockSettlementRegisterData | MockSettlementResultData;
}

/** =============================
 *  레이아웃 유틸 클래스 (MockSettlementModal과 동일)
 *  ============================= */
// 섹션: 반응형 그리드 (FHD에서 4열)
const sectionCols =
  "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
// 필드(한 줄): 라벨 고정폭 + 값 가변폭
const fieldRow =
  "grid grid-cols-[var(--label-w)_minmax(0,1fr)] items-center gap-3";
// 라벨: 한 줄 유지
const labelCx =
  "text-sm font-medium whitespace-nowrap leading-tight text-gray-500";
// 값: 입력칸과 동일한 스타일
const valueCx =
  "text-base bg-gray-50 px-3 py-2 rounded-md border border-gray-200";

export function MockSettlementDetailModal({
  isOpen,
  onClose,
  simStmtGrpId,
  gridData,
}: MockSettlementDetailModalProps) {
  const [detailData, setDetailData] = useState<MockSettlementDetailData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때마다 상세 데이터 조회
  useEffect(() => {
    if (isOpen && simStmtGrpId) {
      console.log(
        "MockSettlementDetailModal - 모달 열림, simStmtGrpId:",
        simStmtGrpId
      );
      fetchDetailData();
    }
  }, [isOpen, simStmtGrpId]);

  const fetchDetailData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("MockSettlementDetailModal - fetchDetailData 호출됨");

      if (gridData) {
        // 그리드에서 받은 실제 데이터 사용
        const actualData: MockSettlementDetailData = {
          simStmtGrpId:
            "simStmtGrpId" in gridData
              ? gridData.simStmtGrpId
              : gridData.settlementName,
          settlementName: gridData.settlementName,
          transactionDate: gridData.transactionDate,
          tagAgency: gridData.tagAgency,
          initialLine: gridData.initialLine,
          lineSection: gridData.lineSection,
          distanceKm: gridData.distanceKm,
          weightRatio:
            "weightRatio" in gridData ? gridData.weightRatio : "1:1:1",
          registrationDate:
            "registrationDate" in gridData ? gridData.registrationDate : "N/A",
          status: "status" in gridData ? gridData.status : "완료",
        };

        setDetailData(actualData);
        console.log(
          "MockSettlementDetailModal - 실제 데이터 설정:",
          actualData
        );
      } else {
        // gridData가 없는 경우 에러
        setError("그리드 데이터를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("모의정산 상세 데이터 조회 에러:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    console.log("MockSettlementDetailModal - 모달 닫힘");
    setDetailData(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* MockSettlementModal과 동일한 폭 + 스크롤 */}
      <DialogContent className="w-[1600px] max-w-[95vw] 2xl:w-[1760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            모의정산 상세 정보
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner />
            <span className="ml-2">상세 데이터를 불러오는 중...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {detailData && !isLoading && (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>
              <div className={sectionCols}>
                <div className={fieldRow}>
                  <span className={labelCx}>정산명 *</span>
                  <div className={valueCx}>{detailData.settlementName}</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>거래일자 *</span>
                  <div className={valueCx}>{detailData.transactionDate}</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>등록일자</span>
                  <div className={valueCx}>{detailData.registrationDate}</div>
                </div>
              </div>
            </div>

            {/* 기본운임 배분 비율 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                기본운임 배분 비율
              </h3>
              <div className={sectionCols}>
                <div className={fieldRow}>
                  <span className={labelCx}>태그기관 비율 (%)</span>
                  <div className={valueCx}>{detailData.tagAgency}</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>초승노선 비율 (%)</span>
                  <div className={valueCx}>{detailData.initialLine}</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>노선동등 비율 (%)</span>
                  <div className={valueCx}>{detailData.lineSection}</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>인·km 비율 (%)</span>
                  <div className={valueCx}>{detailData.distanceKm}%</div>
                </div>
              </div>
            </div>

            {/* 기본운임 인·km 가중치 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                기본운임 인·km 가중치
              </h3>
              <div className={sectionCols}>
                <div className={fieldRow}>
                  <span className={labelCx}>지하 가중치</span>
                  <div className={valueCx}>1</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>고가 가중치</span>
                  <div className={valueCx}>1</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>가중치 비율</span>
                  <div className={valueCx}>{detailData.weightRatio}</div>
                </div>
              </div>
            </div>

            {/* 도시철도부가사용금 인·km 가중치 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                도시철도부가사용금 인·km 가중치
              </h3>
              <div className={sectionCols}>
                <div className={fieldRow}>
                  <span className={labelCx}>도시철도 지하 가중치</span>
                  <div className={valueCx}>1</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>도시철도 고가 가중치</span>
                  <div className={valueCx}>1</div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>도시철도 가중치 비율</span>
                  <div className={valueCx}>1:1:1</div>
                </div>
              </div>
            </div>

            {/* 수송기여도 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                수송기여도
              </h3>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {[
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
                ].map((agency) => (
                  <div key={agency} className={fieldRow}>
                    <span className={labelCx}>{agency}</span>
                    <div className={valueCx}>1.0</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleClose} disabled={isLoading}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

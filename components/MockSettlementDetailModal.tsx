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
  // 가중치 필드들 추가
  basicUndergroundWeight: number;
  basicElevatedWeight: number;
  basicWeightRatio: string;
  urbanUndergroundWeight: number;
  urbanElevatedWeight: number;
  urbanWeightRatio: string;
  operPoints: Array<{ oper_id: string; oper_nm: string; point: number }>;
}

interface MockSettlementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  simStmtGrpId: string;
  gridData?: MockSettlementRegisterData | MockSettlementResultData;
}

/** =============================
 *  레이아웃 유틸 클래스 (MockSettlementModal과 완전 동일)
 *  ============================= */
// 섹션: 반응형 그리드 (FHD에서 4열)
const sectionCols =
  "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";
// 필드(한 줄): 라벨 고정폭 + 값 가변폭
const fieldRow =
  "grid grid-cols-[var(--label-w)_minmax(0,1fr)] items-center gap-3";
// 라벨: 한 줄 유지 (MockSettlementModal과 동일)
const labelCx = "text-sm font-medium whitespace-nowrap leading-tight";
// 값: 입력칸과 동일한 스타일 (MockSettlementModal의 Input과 동일)
const valueCx = "bg-white px-3 py-2 rounded-md border border-input text-sm";

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
      console.log("MockSettlementDetailModal - gridData:", gridData);

      // 1. settlement-info API 호출
      console.log("MockSettlementDetailModal - settlement-info API 호출 시작");
      const apiResponse = await fetch("/api/mock-settlement/settlement-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ simStmtGrpId }),
      });

      const apiData = await apiResponse.json();
      console.log(
        "MockSettlementDetailModal - settlement-info API 응답:",
        apiData
      );

      if (apiResponse.ok && Array.isArray(apiData) && apiData.length > 0) {
        // 2. API 응답 데이터 가공 (원본 데이터 직접 처리)
        const apiItem = apiData[0];
        console.log(
          "MockSettlementDetailModal - API 응답 첫 번째 아이템 (원본):",
          apiItem
        );

        // 가중치 비율 파싱
        const parseWeightRatio = (weightStr: string) => {
          if (!weightStr || typeof weightStr !== "string") return "1:1:1";
          return weightStr;
        };

        // 수송기여도 파싱
        const parseOperPoints = (operPointsStr: string) => {
          try {
            if (operPointsStr && typeof operPointsStr === "string") {
              const parsed = JSON.parse(operPointsStr);
              return Array.isArray(parsed) ? parsed : [];
            }
          } catch (error) {
            console.error("수송기여도 파싱 오류:", error);
          }
          return [];
        };

        // 날짜 포맷팅
        const formatDate = (ts: number | string | undefined): string => {
          if (!ts) return "-";
          if (typeof ts === "string") return ts;
          const date = new Date(ts);
          return date.toLocaleDateString("ko-KR");
        };

        const processedData: MockSettlementDetailData = {
          simStmtGrpId: simStmtGrpId,
          settlementName: apiItem.stmt_nm || "-",
          transactionDate: formatDate(apiItem.card_dt),
          tagAgency: apiItem.tag_oper_prop ? `${apiItem.tag_oper_prop}%` : "-",
          initialLine: apiItem.start_oper_prop
            ? `${apiItem.start_oper_prop}%`
            : "-",
          lineSection: apiItem.equal_prop ? `${apiItem.equal_prop}%` : "-",
          distanceKm: apiItem.km_prop || 0,
          weightRatio: parseWeightRatio(apiItem.km_wght),
          registrationDate: "", // 등록일자 삭제
          status: apiItem.status || "완료",
          // 가중치 필드들 추가
          basicUndergroundWeight: apiItem.km_ung_wght || 1,
          basicElevatedWeight: apiItem.km_elev_wght || 1,
          basicWeightRatio: parseWeightRatio(apiItem.km_wght),
          urbanUndergroundWeight: apiItem.u_km_ung_wght || 1,
          urbanElevatedWeight: apiItem.u_km_elev_wght || 1,
          urbanWeightRatio: parseWeightRatio(apiItem.u_km_wght),
          operPoints: parseOperPoints(
            apiItem.oper_points?.value || apiItem.oper_points
          ),
        };

        console.log(
          "MockSettlementDetailModal - 가공된 데이터:",
          processedData
        );
        setDetailData(processedData);
      } else if (gridData) {
        // 3. API 응답이 실패한 경우 그리드 데이터 사용 (fallback)
        console.log(
          "MockSettlementDetailModal - API 응답 실패, 그리드 데이터 사용"
        );
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
          registrationDate: "", // 등록일자 삭제
          status: "status" in gridData ? gridData.status : "완료",
          // 가중치 필드들 추가 (fallback)
          basicUndergroundWeight: 1,
          basicElevatedWeight: 1,
          basicWeightRatio: "1:1:1",
          urbanUndergroundWeight: 1,
          urbanElevatedWeight: 1,
          urbanWeightRatio: "1:1:1",
          operPoints: [],
        };

        console.log(
          "MockSettlementDetailModal - 그리드 데이터로 생성된 데이터:",
          actualData
        );
        setDetailData(actualData);
      } else {
        // 4. 둘 다 없는 경우 에러
        setError("상세 데이터를 찾을 수 없습니다.");
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
      {/* MockSettlementModal과 완전 동일한 폭 + 스크롤 */}
      <DialogContent className="w-[1600px] max-w-[95vw] 2xl:w-[1760px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>모의정산 상세 정보</DialogTitle>
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
                  <div className={valueCx}>
                    {detailData.basicUndergroundWeight}
                  </div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>고가 가중치</span>
                  <div className={valueCx}>
                    {detailData.basicElevatedWeight}
                  </div>
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
                  <div className={valueCx}>
                    {detailData.urbanUndergroundWeight}
                  </div>
                </div>
                <div className={fieldRow}>
                  <span className={labelCx}>도시철도 고가 가중치</span>
                  <div className={valueCx}>
                    {detailData.urbanElevatedWeight}
                  </div>
                </div>
              </div>
            </div>

            {/* 수송기여도 */}
            <div className="space-y-4 [--label-w:160px]">
              <h3 className="text-lg font-semibold border-b pb-2">
                수송기여도
              </h3>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {detailData.operPoints && detailData.operPoints.length > 0
                  ? detailData.operPoints.map((point, index) => (
                      <div key={index} className={fieldRow}>
                        <span className={labelCx}>
                          {typeof point === "object" ? point.oper_nm : point}
                        </span>
                        <div className={valueCx}>
                          {typeof point === "object" && point.point
                            ? point.point.toFixed(2)
                            : "1.0"}
                        </div>
                      </div>
                    ))
                  : // API 데이터가 없는 경우 기본값 표시
                    [
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

        {/* 액션 - MockSettlementModal과 동일한 스타일 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleClose} disabled={isLoading}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

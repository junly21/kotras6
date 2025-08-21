import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";

interface MockSettlementDetailData {
  settlementName: string;
  transactionDate: string;
  tagAgency: string;
  initialLine: string;
  lineSection: string;
  distanceKm: number;
  weightRatio: string;
  registrationDate: string;
  // 추가 상세 필드들
  totalAmount?: number;
  passengerCount?: number;
  routeDetails?: Array<{
    fromStation: string;
    toStation: string;
    distance: number;
    fare: number;
  }>;
}

interface MockSettlementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  simStmtGrpId: string;
}

export function MockSettlementDetailModal({
  isOpen,
  onClose,
  simStmtGrpId,
}: MockSettlementDetailModalProps) {
  const [detailData, setDetailData] = useState<MockSettlementDetailData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때마다 상세 데이터 조회
  useEffect(() => {
    if (isOpen && simStmtGrpId) {
      fetchDetailData();
    }
  }, [isOpen, simStmtGrpId]);

  const fetchDetailData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mock-settlement/settlement-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simStmtGrpId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result) && result.length > 0) {
        setDetailData(result[0]);
      } else if (result.error) {
        setError(result.error);
      } else {
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
    if (!isLoading) {
      setDetailData(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium min-w-[40px] text-gray-500">
                    정산명
                  </label>
                  <p className="text-base">{detailData.settlementName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    거래일자
                  </label>
                  <p className="text-base">{detailData.transactionDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    태그기관
                  </label>
                  <p className="text-base">{detailData.tagAgency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    초승노선
                  </label>
                  <p className="text-base">{detailData.initialLine}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    노선동등
                  </label>
                  <p className="text-base">{detailData.lineSection}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    인.km
                  </label>
                  <p className="text-base">
                    {detailData.distanceKm?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    가중치(지상:지하:고가)
                  </label>
                  <p className="text-base">{detailData.weightRatio}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    등록일자
                  </label>
                  <p className="text-base">{detailData.registrationDate}</p>
                </div>
              </div>
            </div>

            {/* 추가 상세 정보 */}
            {detailData.totalAmount && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">정산 요약</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      총 정산 금액
                    </label>
                    <p className="text-lg font-bold text-blue-600">
                      {detailData.totalAmount.toLocaleString()}원
                    </p>
                  </div>
                  {detailData.passengerCount && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        총 승객 수
                      </label>
                      <p className="text-lg font-bold text-green-600">
                        {detailData.passengerCount.toLocaleString()}명
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 노선 상세 정보 */}
            {detailData.routeDetails && detailData.routeDetails.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">노선 상세 정보</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border-b">
                          출발역
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 border-b">
                          도착역
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 border-b">
                          거리(km)
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 border-b">
                          요금(원)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.routeDetails.map((route, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">
                            {route.fromStation}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {route.toStation}
                          </td>
                          <td className="px-4 py-2 text-right border-b">
                            {route.distance.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right border-b">
                            {route.fare.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

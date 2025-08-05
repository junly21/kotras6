"use client";

import { useState, useEffect, useMemo } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { PieChart } from "@/components/charts/PieChart";
import { ODPairChart } from "@/components/charts/ODPairChart";
import Spinner from "@/components/Spinner";
import { useNetworkData } from "@/hooks/useNetworkData";
import { MainService, CardStats, ODPairStats } from "@/services/mainService";
import { NETWORK_MAP_CONFIGS } from "@/constants/networkMapConfigs";

export default function Home() {
  const [cardStats, setCardStats] = useState<CardStats[]>([]);
  const [odPairStats, setOdPairStats] = useState<ODPairStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 네트워크 데이터
  const {
    nodes,
    links,
    svgText,
    isLoading: mapLoading,
    error: mapError,
  } = useNetworkData();

  // 메인 데이터 fetch
  useEffect(() => {
    async function fetchMain() {
      try {
        setLoading(true);
        setError(null);

        const cardResp = await MainService.getCardStatsFromApi();
        if (cardResp.success) setCardStats(cardResp.data || []);

        const odResp = await MainService.getODPairStatsFromApi();
        if (odResp.success) setOdPairStats(odResp.data || []);
      } catch (e) {
        console.error(e);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchMain();
  }, []);

  // 메모이제이션된 값들
  const mapConfig = useMemo(() => NETWORK_MAP_CONFIGS.main, []);
  const noHighlights = useMemo(() => [], []);
  const memoizedCardStats = useMemo(() => cardStats, [cardStats]);
  const memoizedOdPairStats = useMemo(() => odPairStats, [odPairStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  if (mapError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">네트워크 데이터 로드 실패: {mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-280px)] flex flex-col p-2 gap-4">
      {/* 네트워크 맵 */}
      <div className="h-[400px] bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">네트워크 맵</h2>
        {mapLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            노선도를 불러오는 중...
          </div>
        ) : (
          <NetworkMap
            nodes={nodes}
            links={links}
            svgText={svgText}
            config={mapConfig}
            highlights={noHighlights}
          />
        )}
      </div>

      {/* 하단: 좌우 분할 */}
      <div className="flex gap-4 h-90">
        {/* 좌측: 권종별 통행수 파이차트 */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">권종별 통행수</h2>
          <div className="h-full">
            {memoizedCardStats.length > 0 ? (
              <PieChart data={memoizedCardStats} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                데이터를 불러오는 중...
              </div>
            )}
          </div>
        </div>

        {/* 우측: OD Pair 차트 */}
        <div className="flex-1 bg-white rounded-lg shadow-md justify-between items-center p-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-semibold text-gray-900">OD Pair</h2>
            <span className="text-sm text-gray-500">(단위: 데이터 건수)</span>
          </div>
          <div className="h-full">
            {memoizedOdPairStats.length > 0 ? (
              <ODPairChart data={memoizedOdPairStats} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                데이터를 불러오는 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

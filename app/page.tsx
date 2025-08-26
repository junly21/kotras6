"use client";

import { useState, useEffect, useMemo } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { PieChart } from "@/components/charts/PieChart";
import { ODPairChart } from "@/components/charts/ODPairChart";
import Spinner from "@/components/Spinner";
import { useNetworkData } from "@/hooks/useNetworkData";
import { MainService, CardStats, ODPairStats } from "@/services/mainService";
import { NETWORK_MAP_CONFIGS } from "@/constants/networkMapConfigs";
import { useSessionContext } from "@/contexts/SessionContext";
import { NetworkMapService } from "@/services/networkMapService";

export default function Home() {
  const [cardStats, setCardStats] = useState<CardStats[]>([]);
  const [odPairStats, setOdPairStats] = useState<ODPairStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 노선도 하이라이트 관련 상태
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [isNetworkDataLoading, setIsNetworkDataLoading] = useState(true);

  // 세션 상태 확인
  const { isInitialized, isLoading: isSessionLoading } = useSessionContext();

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

  // 기관 목록 로드 및 노선도 하이라이트 데이터 fetch (line/page.tsx와 동일한 로직)
  useEffect(() => {
    // 세션이 초기화되지 않았거나 로딩 중이면 API 요청하지 않음
    if (!isInitialized || isSessionLoading) {
      return;
    }

    async function fetchNetworkData() {
      try {
        // 1. 기관 목록 로드
        const agencyRes = await fetch("/api/common/agencies");
        if (!agencyRes.ok) throw new Error("기관 목록을 불러올 수 없습니다.");

        const agencyData = await agencyRes.json();
        const agencies = agencyData.options || [];

        if (agencies.length === 0) {
          alert("기관 목록을 불러올 수 없습니다.");
          return;
        }

        // 2. 첫 번째 기관으로 노선도 데이터 요청 (NetworkMapService 사용)
        const firstAgency = agencies[0];
        const agencyLabel =
          firstAgency.label === "전체" ? "ALL" : firstAgency.label;

        // line/page.tsx와 동일한 방식으로 NetworkMapService 사용
        const response = await NetworkMapService.getMapData({
          network: "LATEST",
          agency: firstAgency.value,
          line: "ALL",
          networkLabel: agencyLabel,
        });

        if (response.success && response.data) {
          // 3. 하이라이트 처리 (line/page.tsx와 동일한 로직)
          const { lineData } = response.data;

          if (lineData && Array.isArray(lineData)) {
            const apiLineNames = lineData
              .map(
                (line: { subway?: string; seq?: string }) =>
                  line.subway || line.seq
              )
              .filter(Boolean);

            const uniqueLineNames = [...new Set(apiLineNames)];

            const finalActiveLine =
              uniqueLineNames.length > 0 ? uniqueLineNames.join(",") : null;

            setActiveLine(finalActiveLine);
          }
        }

        // API 호출 완료 (성공/실패 상관없이)
        setIsNetworkDataLoading(false);
      } catch {
        alert("노선도 데이터를 불러올 수 없습니다.");
        setIsNetworkDataLoading(false);
      }
    }

    fetchNetworkData();
  }, [isInitialized]);

  // 메모이제이션된 값들
  const mapConfig = useMemo(() => NETWORK_MAP_CONFIGS.main, []);

  // 하이라이트 설정 (line/page.tsx와 동일한 로직)
  const highlights = useMemo(() => {
    if (!activeLine) {
      return [];
    }

    const lineNames = activeLine.split(",");

    const result = lineNames.map((lineName) => ({
      type: "line" as const,
      value: lineName.trim(),
    }));

    return result;
  }, [activeLine]);

  const memoizedCardStats = useMemo(() => cardStats, [cardStats]);
  const memoizedOdPairStats = useMemo(() => odPairStats, [odPairStats]);

  // 전체 로딩 상태: 메인 데이터 로딩 중이거나 노선도 API 호출이 아직 진행 중
  const isLoading = loading || isNetworkDataLoading;

  if (isLoading) {
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
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">네트워크 맵</h2>
        <div className="h-[500px] bg-white rounded-lg shadow-md overflow-hidden">
          {mapLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              노선도를 불러오는 중...
            </div>
          ) : (
            <div className="w-full h-full">
              <NetworkMap
                nodes={nodes}
                links={links}
                svgText={svgText}
                config={mapConfig}
                highlights={highlights}
              />
            </div>
          )}
        </div>
      </div>

      {/* 하단: 좌우 분할 (2:8 비율) */}
      <div className="space-y-2">
        {/* 차트 제목들 */}
        <div className="flex gap-4">
          <div className="w-3/10">
            <h2 className="text-lg font-semibold text-gray-900">
              권종별 통행수
            </h2>
          </div>
          <div className="w-7/10">
            <h2 className="text-lg font-semibold text-gray-900">OD Pair</h2>
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="flex gap-4 h-80">
          {/* 좌측: 권종별 통행수 파이차트 (2) */}
          <div className="w-3/10 bg-white rounded-lg shadow-md p-4">
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

          {/* 우측: OD Pair 차트 (8) */}
          <div className="w-7/10 bg-white rounded-lg shadow-md p-4">
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
    </div>
  );
}

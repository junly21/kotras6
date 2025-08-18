"use client";

import { useState, useEffect, useMemo } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { PieChart } from "@/components/charts/PieChart";
import { ODPairChart } from "@/components/charts/ODPairChart";
import Spinner from "@/components/Spinner";
import { useNetworkData } from "@/hooks/useNetworkData";
import { MainService, CardStats, ODPairStats } from "@/services/mainService";
import { NETWORK_MAP_CONFIGS } from "@/constants/networkMapConfigs";
import type { NetworkMapHighlight } from "@/types/network";

export default function Home() {
  const [cardStats, setCardStats] = useState<CardStats[]>([]);
  const [odPairStats, setOdPairStats] = useState<ODPairStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 노선도 하이라이트 관련 상태
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [agencyOptions, setAgencyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

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

  // 기관 목록 로드 및 노선도 하이라이트 데이터 fetch
  useEffect(() => {
    async function fetchNetworkData() {
      try {
        // 1. 기관 목록 로드
        const agencyRes = await fetch("/api/common/agencies");
        if (!agencyRes.ok) throw new Error("기관 목록을 불러올 수 없습니다.");

        const agencyData = await agencyRes.json();
        const agencies = agencyData.options || [];
        setAgencyOptions(agencies);

        if (agencies.length === 0) {
          alert("기관 목록을 불러올 수 없습니다.");
          return;
        }

        // 2. 첫 번째 기관으로 노선도 데이터 요청
        const firstAgency = agencies[0];
        const agencyLabel =
          firstAgency.label === "전체" ? "ALL" : firstAgency.label;

        const networkResp = await fetch("/api/network/map/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            network: "LATEST",
            agency: firstAgency.value,
            line: "ALL",
            networkLabel: agencyLabel,
          }),
        });

        if (!networkResp.ok)
          throw new Error("노선도 데이터를 불러올 수 없습니다.");

        const networkData = await networkResp.json();

        if (networkData.success && networkData.data) {
          // 3. 하이라이트 처리 (노선도 페이지와 동일한 로직)
          const { lineData } = networkData.data;

          if (lineData && Array.isArray(lineData)) {
            const apiLineNames = lineData
              .map((line: any) => line.subway || line.seq)
              .filter(Boolean);

            const uniqueLineNames = [...new Set(apiLineNames)];
            const finalActiveLine =
              uniqueLineNames.length > 0 ? uniqueLineNames.join(",") : null;
            setActiveLine(finalActiveLine);
          }
        }
      } catch (error) {
        console.error("노선도 데이터 로드 실패:", error);
        alert("노선도 데이터를 불러올 수 없습니다.");
      }
    }

    fetchNetworkData();
  }, []);

  // 메모이제이션된 값들
  const mapConfig = useMemo(() => NETWORK_MAP_CONFIGS.main, []);

  // 하이라이트 설정 (노선도 페이지와 동일한 로직)
  const highlights = useMemo(() => {
    if (!activeLine) return [];

    const lineNames = activeLine.split(",");
    return lineNames.map((lineName) => ({
      type: "line" as const,
      value: lineName.trim(),
    }));
  }, [activeLine]);

  const memoizedCardStats = useMemo(() => cardStats, [cardStats]);
  const memoizedOdPairStats = useMemo(() => odPairStats, [odPairStats]);

  // 전체 로딩 상태: 메인 데이터 로딩 중이거나 노선도 하이라이트가 아직 적용되지 않음
  const isLoading = loading || !activeLine;

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
            highlights={highlights}
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

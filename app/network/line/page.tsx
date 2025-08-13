"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { FilterForm } from "@/components/ui/FilterForm";
import { useNetworkData } from "@/hooks/useNetworkData";
import { useApi } from "@/hooks/useApi";
import { NetworkMapService } from "@/services/networkMapService";
import { NETWORK_MAP_CONFIGS } from "@/constants/networkMapConfigs";
import type { NetworkMapHighlight } from "@/types/network";
import { useNetworkFilters } from "@/hooks/useNetworkFilters";
import { NetworkMapFilters } from "@/types/networkMap";
import type { NodeData, LineData } from "@/types/networkMap";
import Spinner from "@/components/Spinner";

export default function NetworkLinePage() {
  // 공통 네트워크 필터 훅 사용
  const {
    filters,
    networkOptions,
    agencyOptions,
    lineOptions,
    isAllAgency,
    handleFilterChange,
    handleSearch,
  } = useNetworkFilters();

  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 최초 노선도 렌더링용 데이터 (useNetworkData 사용)
  const {
    nodes: defaultNodes,
    links: defaultLinks,
    svgText,
    isLoading: isDataLoading,
    error,
  } = useNetworkData();

  // 전체 로딩 상태: 기본 데이터 로딩 중이거나 하이라이트가 아직 적용되지 않음
  const isLoading =
    isDataLoading || !hasSearched || (hasSearched && !activeLine);

  // 조회버튼 클릭 시 API 요청용 (map/page.tsx와 동일)
  const apiCall = useCallback(() => {
    if (!filters.network || !filters.agency || !filters.line) {
      return Promise.resolve({
        success: true,
        data: { nodeData: [], lineData: [] },
      });
    }

    const agencyLabelRaw =
      agencyOptions.find((a) => a.value === filters.agency)?.label || "";
    const agencyLabel = agencyLabelRaw === "전체" ? "ALL" : agencyLabelRaw;

    console.log("노선도 데이터 요청:", {
      network: filters.network,
      agency: filters.agency,
      line: filters.line,
      networkLabel: agencyLabel,
    });

    return NetworkMapService.getMapData({
      network: filters.network,
      agency: filters.agency,
      line: filters.line,
      networkLabel: agencyLabel,
    });
  }, [filters, agencyOptions]);

  // API 요청 성공 시 하이라이트 처리
  const onSuccess = useCallback(
    (data: { nodeData: NodeData[]; lineData: LineData[] }) => {
      // 받은 데이터를 기반으로 하이라이트 설정
      if (filters.line === "ALL") {
        // 전체 선택 시: 받은 데이터의 모든 노선을 하이라이트
        const apiLineNames = data.lineData
          .map((line) => line.subway || line.seq)
          .filter(Boolean);

        // 중복 제거하고 고유한 노선명만 추출
        const uniqueLineNames = [...new Set(apiLineNames)];

        const matchedLineNames = uniqueLineNames.filter((lineName) =>
          defaultLinks.some((link) => link.line === lineName)
        );

        const finalActiveLine =
          matchedLineNames.length > 0 ? matchedLineNames.join(",") : null;
        setActiveLine(finalActiveLine);
      } else {
        // 특정 노선 선택 시: 해당 노선만 하이라이트
        setActiveLine(filters.line);
      }
    },
    [filters.line, defaultLinks]
  );

  const onError = useCallback((error: string) => {
    console.error("노선도 데이터 로드 실패:", error);
    setActiveLine(null); // 에러 시 하이라이트 제거
  }, []);

  const { refetch } = useApi(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  // 조회버튼 클릭 시에만 API 요청
  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  // 모든 필터가 설정되면 자동으로 조회 실행
  useEffect(() => {
    if (filters.network && filters.agency && filters.line && !hasSearched) {
      setHasSearched(true);
    }
  }, [filters.network, filters.agency, filters.line, hasSearched]);

  const handleFilterChangeWithLine = useCallback(
    (values: NetworkMapFilters) => {
      handleFilterChange(values);
      if (values.line !== "ALL") {
        setActiveLine(values.line);
      }
    },
    [handleFilterChange]
  );

  const handleSearchWithLine = useCallback(
    (values: NetworkMapFilters) => {
      handleSearch(values);
      setHasSearched(true);
    },
    [handleSearch]
  );

  const highlights = useMemo((): NetworkMapHighlight[] => {
    if (!activeLine) return [];

    const lineNames = activeLine.split(",");
    return lineNames.map((lineName) => ({
      type: "line" as const,
      value: lineName.trim(),
    }));
  }, [activeLine]);

  const mapConfig = useMemo(() => NETWORK_MAP_CONFIGS.line, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">네트워크 데이터 로드 실패: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">노선도 조회</h1>

      {/* FilterForm 적용 */}
      <FilterForm<NetworkMapFilters>
        fields={[
          {
            name: "network",
            label: "네트워크명",
            type: "select",
            options: networkOptions,
            required: true,
          },
          {
            name: "agency",
            label: "기관명",
            type: "select",
            options: agencyOptions,
            required: true,
            disabled: !filters.network,
          },
          {
            name: "line",
            label: "노선",
            type: isAllAgency ? "combobox" : "select",
            options: lineOptions,
            required: true,
            disabled: !filters.network || !filters.agency,
          },
        ]}
        defaultValues={{ network: "", agency: "", line: "" }}
        values={filters}
        onChange={handleFilterChangeWithLine}
        onSearch={handleSearchWithLine}
      />

      <div className="flex gap-6">
        <div className="flex-1 h-[920px] border rounded-lg p-4 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
              <Spinner size="lg" />
              <p>노선도를 불러오는 중...</p>
            </div>
          ) : (
            <NetworkMap
              nodes={defaultNodes}
              links={defaultLinks}
              svgText={svgText}
              config={mapConfig}
              highlights={highlights}
            />
          )}
        </div>
      </div>
    </div>
  );
}

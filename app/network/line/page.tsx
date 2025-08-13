"use client";

import React, { useState, useMemo, useCallback } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { FilterForm } from "@/components/ui/FilterForm";
import { useNetworkData } from "@/hooks/useNetworkData";
import { NETWORK_MAP_CONFIGS } from "@/constants/networkMapConfigs";
import type { NetworkMapHighlight } from "@/types/network";
import { useNetworkFilters } from "@/hooks/useNetworkFilters";
import { NetworkMapFilters } from "@/types/networkMap";

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

  // 네트워크 데이터 로드
  const { nodes, links, svgText, isLoading, error } = useNetworkData();

  // 필터 변경 핸들러
  const handleFilterChangeWithLine = useCallback(
    (values: NetworkMapFilters) => {
      handleFilterChange(values);
      setActiveLine(values.line === "ALL" ? null : values.line);
    },
    [handleFilterChange]
  );

  // 검색 핸들러
  const handleSearchWithLine = useCallback(
    (values: NetworkMapFilters) => {
      handleSearch(values);
      setActiveLine(values.line === "ALL" ? null : values.line);
    },
    [handleSearch]
  );

  // 하이라이트 설정 - 메모이제이션
  const highlights = useMemo((): NetworkMapHighlight[] => {
    return activeLine ? [{ type: "line", value: activeLine }] : [];
  }, [activeLine]);

  // NetworkMap 설정 - 메모이제이션
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
      </div>
    </div>
  );
}

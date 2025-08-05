"use client";

import React, { useState, useMemo } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { FilterForm } from "@/components/ui/FilterForm";
import { useNetworkData } from "@/hooks/useNetworkData";
import { LINE_OPTIONS } from "@/constants/subwayLines";
import { NETWORK_MAP_CONFIGS } from "@/constants/networkMapConfigs";
import type { NetworkMapHighlight } from "@/types/network";

interface LineFilters {
  line: string;
}

export default function NetworkLinePage() {
  const [filters, setFilters] = useState<LineFilters>({ line: "" });
  const [activeLine, setActiveLine] = useState<string | null>(null);

  // 네트워크 데이터 로드
  const { nodes, links, svgText, isLoading, error } = useNetworkData();

  // 필터 변경 핸들러
  const handleFilterChange = (values: LineFilters) => {
    setFilters(values);
    setActiveLine(values.line === "전체" ? null : values.line);
  };

  // 검색 핸들러
  const handleSearch = (values: LineFilters) => {
    setActiveLine(values.line === "전체" ? null : values.line);
  };

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
      <FilterForm<LineFilters>
        fields={[
          {
            name: "line",
            label: "노선",
            type: "combobox",
            options: LINE_OPTIONS,
            required: false,
          },
        ]}
        defaultValues={{ line: "전체" }}
        values={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
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

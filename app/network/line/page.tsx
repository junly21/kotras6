"use client";

import React, { useEffect, useState } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import type { Node, Link } from "@/components/NetworkMap/types";
import { FilterForm } from "@/components/ui/FilterForm";

interface LineFilters {
  line: string;
}

export default function NetworkLinePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [svgText, setSvgText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [filters, setFilters] = useState<LineFilters>({ line: "" });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [nodesRes, linksRes, svgRes] = await Promise.all([
          fetch("/nodes.json"),
          fetch("/links.json"),
          fetch("/subway_link 1.svg"),
        ]);
        const nodesText = await nodesRes.text();
        const cleanedNodesText = nodesText.replace(/:\s*NaN/g, ": null");
        setNodes(JSON.parse(cleanedNodesText));
        setLinks(await linksRes.json());
        setSvgText(await svgRes.text());
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const lineList = [
    "1호선",
    "경부선",
    "경인선",
    "경원선",
    "장항선",
    "2호선",
    "3호선",
    "4호선",
    "4호선진접선",
    "과천선",
    "안산선",
    "5호선",
    "6호선",
    "7호선",
    "8호선",
    "9호선",
    "에버라인선",
    "우이신설선",
    "신림선",
    "경의선",
    "경의중앙선",
    "중앙선",
    "인천1호선",
    "인천2호선",
    "김포골드라인",
    "신분당선",
    "수인선",
    "분당선",
    "경강선",
    "경춘선",
    "서해선",
  ];

  // FilterForm용 옵션 생성
  const lineOptions = [
    { label: "전체", value: "전체" },
    ...lineList.map((line) => ({ label: line, value: line })),
  ];

  // 필터 변경 핸들러
  const handleFilterChange = (values: LineFilters) => {
    setFilters(values);
    setActiveLine(values.line === "전체" ? null : values.line);
  };

  // 검색 핸들러 (실제로는 조회 버튼을 누를 때 호출되지만, 여기서는 즉시 적용)
  const handleSearch = (values: LineFilters) => {
    setActiveLine(values.line === "전체" ? null : values.line);
  };

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
            options: lineOptions,
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
              width="100%"
              height={800}
              activeLine={activeLine}
            />
          )}
        </div>
      </div>
    </div>
  );
}

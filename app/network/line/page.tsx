"use client";

import React, { useEffect, useState } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import type { Node, Link } from "@/components/NetworkMap/types";

export default function NetworkLinePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [svgText, setSvgText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeLine, setActiveLine] = useState<string | null>(null);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">노선도 조회</h1>
      <div className="mb-4 flex gap-2">
        {lineList.map((line) => (
          <button
            key={line}
            className={`px-3 py-1 rounded ${
              activeLine === line ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveLine(line)}>
            {line}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded ${
            !activeLine ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveLine(null)}>
          전체
        </button>
      </div>
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

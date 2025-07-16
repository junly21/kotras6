"use client";

import React, { useEffect, useState, useRef } from "react";
import { parse, type INode } from "svgson";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Node {
  id: string;
  name: string;
  line: string;
  x: number;
  y: number;
  operator: string;
  consign_operator: number | null;
  open_date: number;
  gate_count: number | null;
  is_transfer: number;
  avg_stay_sec: number;
  avg_stay_sec_new: number;
  remarks: string | number | null;
}

interface Link {
  source: string;
  target: string;
  line: string;
  time: number;
}

export default function NetworkLinePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [svgReactTree, setSvgReactTree] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [nodesResponse, linksResponse, svgResponse] = await Promise.all([
          fetch("/nodes.json"),
          fetch("/links.json"),
          fetch("/노선도.svg"),
        ]);
        const nodesText = await nodesResponse.text();
        const cleanedNodesText = nodesText.replace(/:\s*NaN/g, ": null");
        const nodesData = JSON.parse(cleanedNodesText);
        const linksData = await linksResponse.json();
        const svgText = await svgResponse.text();
        // svgson 파싱
        const svgJson = await parse(svgText);
        setNodes(nodesData);
        setLinks(linksData);
        // svgson -> React 변환
        setSvgReactTree(renderSvgNode(svgJson, nodesData, linksData));
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // SVG 로드 후 이벤트 리스너 추가 (의존성 배열에 nodes, links 추가)
  useEffect(() => {
    if (!svgContainerRef.current) return;

    let observer: MutationObserver | null = null;
    let svgElement: SVGSVGElement | null = null;

    const connectListener = () => {
      svgElement = svgContainerRef.current!.querySelector("svg");
      if (svgElement) {
        svgElement.style.cursor = "default";

        // 기존 mousemove 제거, mouseenter/mouseleave로 변경
        svgElement.querySelectorAll("circle").forEach((circle) => {
          circle.addEventListener("mouseenter", (e: Event) => {
            const el = e.target as Element;
            if (el.tagName === "circle" && el.id) {
              svgElement!.style.cursor = "pointer";
              const node = nodes.find((n) => n.id === el.id);
              if (node) {
                // setHoveredNode(node); // Removed
                // setTooltipMode("preview"); // Removed
                // SVG 좌표를 브라우저 좌표로 변환
                // setTooltipPosition({ x, y }); // Removed
              }
            }
          });
          circle.addEventListener("mouseleave", () => {
            // setHoveredNode(null); // Removed
            // setTooltipMode("preview"); // Removed
            // setTooltipPosition(null); // Removed
            svgElement!.style.cursor = "default";
          });
        });
        // 툴팁에서 벗어날 때도 닫히도록 svg 전체에 mousemove
        svgElement.addEventListener("mousemove", (e: Event) => {
          const el = e.target as Element;
          if (el.tagName !== "circle") {
            // setHoveredNode(null); // Removed
            // setTooltipMode("preview"); // Removed
            // setTooltipPosition(null); // Removed
            svgElement!.style.cursor = "default";
          }
        });
        svgElement.addEventListener("mouseleave", () => {
          // setHoveredNode(null); // Removed
          // setTooltipMode("preview"); // Removed
          // setTooltipPosition(null); // Removed
          svgElement!.style.cursor = "default";
        });
      }
    };

    observer = new MutationObserver(() => {
      if (svgElement) return; // 이미 연결됨
      connectListener();
    });

    observer.observe(svgContainerRef.current, {
      childList: true,
      subtree: true,
    });

    // 최초 1회 시도
    connectListener();

    return () => {
      if (svgElement) {
        svgElement.replaceWith(svgElement.cloneNode(true)); // 이벤트 리스너 제거
      }
      if (observer) observer.disconnect();
    };
  }, [svgReactTree, nodes, links]);

  // Wheel 이벤트 핸들러 (useEffect 제거)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const delta = e.deltaY > 0 ? -1 : 1;
      setScale((prev) => Math.max(0.1, Math.min(5, prev + delta * 0.1)));
    }
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 리셋 버튼
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // 확대/축소 핸들러 복원
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.1, Math.min(5, prev + delta * 0.1)));
  };

  // SVG 속성 camelCase 변환 함수
  function toCamelCaseAttrs(attrs: Record<string, string>) {
    const map: Record<string, string> = {
      "stroke-width": "strokeWidth",
      "stroke-linecap": "strokeLinecap",
      "stroke-linejoin": "strokeLinejoin",
      "fill-opacity": "fillOpacity",
      "font-size": "fontSize",
      // 필요한 속성 추가
    };
    return Object.fromEntries(
      Object.entries(attrs).map(([k, v]) => [map[k] || k, v])
    );
  }

  function renderSvgNode(
    node: INode,
    nodesData: Node[],
    linksData: Link[],
    key?: string
  ): React.ReactNode {
    // circle(노드)
    if (node.name === "circle") {
      const { id, ...rest } = node.attributes;
      const nodeData = nodesData.find((n) => n.id === id);
      // cx, cy 추출 (string to number)
      const cx = rest.cx ? Number(rest.cx) : 0;
      const cy = rest.cy ? Number(rest.cy) : 0;
      const fontSize = 32; // 적당한 폰트 크기
      const offset = 40; // 원 우하단으로 약간 띄우기
      return (
        <g key={key || id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <circle
                {...toCamelCaseAttrs(rest)}
                id={id}
                style={{ cursor: "pointer" }}
              />
            </TooltipTrigger>
            <TooltipContent style={{ background: "white", color: "black" }}>
              {nodeData ? (
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#2563eb",
                      marginBottom: 8,
                    }}>
                    역 정보
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                    <div>
                      <b>역명:</b> {nodeData.name}
                    </div>
                    <div>
                      <b>노선:</b> {nodeData.line}
                    </div>
                    <div>
                      <b>운영사:</b> {nodeData.operator}
                    </div>
                    <div>
                      <b>개통일:</b> {nodeData.open_date}
                    </div>
                    <div>
                      <b>환승역:</b>{" "}
                      {nodeData.is_transfer >= 2 ? "환승역" : "일반역"}
                    </div>
                    <div>
                      <b>평균 체류시간:</b> {nodeData.avg_stay_sec_new}초
                    </div>
                  </div>
                </div>
              ) : null}
            </TooltipContent>
          </Tooltip>
          {/* 역명 표시 */}
          {nodeData && (
            <text
              x={cx + offset}
              y={cy + offset}
              fontSize={fontSize}
              fontFamily="Arial, sans-serif"
              fill="#374151"
              pointerEvents="none"
              dominantBaseline="hanging">
              {nodeData.name.split("_")[1] || nodeData.name}
            </text>
          )}
        </g>
      );
    }
    // line(링크)
    if (node.name === "line") {
      const { id, ...rest } = node.attributes;
      // 추후 Tooltip 등 추가 가능
      return <line key={key || id} {...toCamelCaseAttrs(rest)} />;
    }
    // 기타 태그
    return React.createElement(
      node.name,
      { ...toCamelCaseAttrs(node.attributes), key: key || node.attributes.id },
      node.children?.map((child: INode, i) =>
        renderSvgNode(child, nodesData, linksData, `${node.name}-${i}`)
      )
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">노선도를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">노선도 조회</h1>
      <div className="flex gap-6">
        <div className="flex-1 h-[920px] border rounded-lg p-4 bg-white">
          <div className="flex gap-2">
            <button
              onClick={() => handleZoom(1)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              {" "}
              확대{" "}
            </button>
            <button
              onClick={() => handleZoom(-1)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              {" "}
              축소{" "}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
              {" "}
              리셋{" "}
            </button>
            <span className="px-3 py-1 bg-gray-100 rounded text-sm">
              {" "}
              확대율: {Math.round(scale * 100)}%{" "}
            </span>
          </div>
          <div
            className="relative overflow-hidden border rounded bg-gray-50"
            style={{ height: "100%", maxWidth: "100%" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 2721 1747"
              style={{ display: "block" }}>
              <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
                {svgReactTree}
              </g>
            </svg>
          </div>
        </div>
        {/* 정보 패널 등 기존 UI 유지 */}
        <div className="w-80">
          <div className="bg-white border rounded-lg p-4 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">선택된 정보</h2>
            {/* 추후 선택된 노드/링크 정보 표시 */}
          </div>
        </div>
      </div>
    </div>
  );
}

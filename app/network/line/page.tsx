"use client";

import { useEffect, useState, useRef } from "react";
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
  const [selectedNode] = useState<Node | null>(null);
  const [selectedLink] = useState<Link | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [tooltipMode, setTooltipMode] = useState<"preview" | "detail">(
    "preview"
  );
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (svgElement) {
          // 1. 올바른 스케일링: viewBox는 유지하고, width/height로 크기 조절
          svgElement.setAttribute("width", "100%");
          svgElement.setAttribute("height", "100%");

          // 실제 SVG에서 노드(circle) 위치 파악
          const actualNodePositions: {
            [key: string]: { cx: number; cy: number };
          } = {};
          const circles = svgElement.querySelectorAll("circle");
          circles.forEach((circle) => {
            const id = circle.getAttribute("id");
            if (id) {
              actualNodePositions[id] = {
                cx: parseFloat(circle.getAttribute("cx") || "0"),
                cy: parseFloat(circle.getAttribute("cy") || "0"),
              };
            }
          });

          // 2. 안정적인 DOM 조작으로 클래스 추가
          svgElement.querySelectorAll("circle").forEach((circle) => {
            circle.setAttribute(
              "class",
              "hover:fill-blue-300 transition-colors cursor-pointer"
            );
          });
          svgElement.querySelectorAll("line").forEach((line) => {
            line.setAttribute(
              "class",
              "hover:stroke-blue-600 transition-colors cursor-pointer"
            );
          });

          // 3. 역 이름 텍스트를 올바른 위치에 추가
          const mainGroup = svgElement.querySelector("g"); // 모든 요소가 담긴 <g> 태그 찾기

          nodesData.forEach((node: Node) => {
            const position = actualNodePositions[node.id];
            if (position && mainGroup) {
              const stationName = node.name.split("_")[1] || node.name;

              // 4. 원본 좌표계 사용 (수동 스케일링 제거)
              const textX = position.cx + 40;
              const textY = position.cy + 40;
              const fontSize = 60; // 원본 좌표계 기준 폰트 크기

              const textElement = svgDoc.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
              );
              textElement.setAttribute("x", textX.toString());
              textElement.setAttribute("y", textY.toString());
              textElement.setAttribute("font-size", fontSize.toString());
              textElement.setAttribute("font-family", "Arial, sans-serif");
              textElement.setAttribute("fill", "#374151");
              textElement.setAttribute("pointer-events", "none");
              textElement.setAttribute("dominant-baseline", "hanging");
              textElement.textContent = stationName;

              // 텍스트 배경 추가
              const textBg = svgDoc.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
              );
              const textWidth = stationName.length * (fontSize * 0.6); // 대략적인 너비 계산
              const textHeight = fontSize * 1.2;

              textBg.setAttribute("x", (textX - 2).toString());
              textBg.setAttribute("y", (textY - 2).toString());
              textBg.setAttribute("width", (textWidth + 4).toString());
              textBg.setAttribute("height", textHeight.toString());
              textBg.setAttribute("fill", "white");
              textBg.setAttribute("opacity", "0.75");
              textBg.setAttribute("rx", "2");
              textBg.setAttribute("pointer-events", "none");

              // 5. <g> 그룹에 요소 추가
              mainGroup.appendChild(textBg);
              mainGroup.appendChild(textElement);
            }
          });

          // 6. 수정된 svgElement를 다시 문자열로 변환
          const finalSvgText = new XMLSerializer().serializeToString(
            svgElement
          );
          setSvgContent(finalSvgText);
        }

        setNodes(nodesData);
        setLinks(linksData);
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
                setHoveredNode(node);
                setTooltipMode("preview");
                // SVG 좌표를 브라우저 좌표로 변환
                const rect = svgElement!.getBoundingClientRect();
                const cx = parseFloat(
                  (el as SVGCircleElement).getAttribute("cx") || "0"
                );
                const cy = parseFloat(
                  (el as SVGCircleElement).getAttribute("cy") || "0"
                );
                // viewBox 기준 변환
                const viewBox = svgElement!.getAttribute("viewBox");
                let x = cx,
                  y = cy;
                if (viewBox) {
                  const [vbX, vbY, vbW, vbH] = viewBox.split(" ").map(Number);
                  const width = rect.width;
                  const height = rect.height;
                  x = ((cx - vbX) / vbW) * width + rect.left;
                  y = ((cy - vbY) / vbH) * height + rect.top;
                } else {
                  x = rect.left + cx;
                  y = rect.top + cy;
                }
                setTooltipPosition({ x, y });
              }
            }
          });
          circle.addEventListener("mouseleave", () => {
            setHoveredNode(null);
            setTooltipMode("preview");
            setTooltipPosition(null);
            svgElement!.style.cursor = "default";
          });
        });
        // 툴팁에서 벗어날 때도 닫히도록 svg 전체에 mousemove
        svgElement.addEventListener("mousemove", (e: Event) => {
          const el = e.target as Element;
          if (el.tagName !== "circle") {
            setHoveredNode(null);
            setTooltipMode("preview");
            setTooltipPosition(null);
            svgElement!.style.cursor = "default";
          }
        });
        svgElement.addEventListener("mouseleave", () => {
          setHoveredNode(null);
          setTooltipMode("preview");
          setTooltipPosition(null);
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
  }, [svgContent, nodes, links]);

  // Wheel 이벤트 리스너 추가
  useEffect(() => {
    const containerElement = svgContainerRef.current?.parentElement;
    if (containerElement) {
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        setScale((prev) => Math.max(0.1, Math.min(5, prev + delta * 0.1)));
      };
      // 맥 트랙패드 제스처 지원 (선택사항)
      // ... gesture event handlers ...
      containerElement.addEventListener("wheel", handleWheel, {
        passive: false,
      });
      return () => containerElement.removeEventListener("wheel", handleWheel);
    }
  }, []); // scale을 의존성 배열에서 제거하여 무한 루프 방지

  // 확대/축소 핸들러
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(0.1, Math.min(5, prev + delta * 0.1)));
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
            onMouseLeave={handleMouseLeave}>
            <div
              ref={svgContainerRef}
              className="cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                width: "100%",
                height: "100%",
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            {/* 툴팁 렌더링 */}
            {hoveredNode && tooltipPosition && (
              <Tooltip
                open={!!hoveredNode}
                onOpenChange={(open) => {
                  if (!open) {
                    setHoveredNode(null);
                    setTooltipMode("preview");
                    setTooltipPosition(null);
                  }
                }}>
                <TooltipTrigger asChild>
                  <div
                    style={{
                      position: "fixed",
                      left: tooltipPosition.x + 16,
                      top: tooltipPosition.y + 16,
                      zIndex: 1000,
                      width: 1,
                      height: 1,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  onClick={
                    tooltipMode === "preview"
                      ? () => setTooltipMode("detail")
                      : undefined
                  }
                  onMouseLeave={() => {
                    setHoveredNode(null);
                    setTooltipMode("preview");
                    setTooltipPosition(null);
                  }}
                  style={{
                    cursor: tooltipMode === "preview" ? "pointer" : "default",
                  }}>
                  {tooltipMode === "preview" ? (
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      역정보보기
                    </span>
                  ) : (
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
                          <b>역명:</b> {hoveredNode.name}
                        </div>
                        <div>
                          <b>노선:</b> {hoveredNode.line}
                        </div>
                        <div>
                          <b>운영사:</b> {hoveredNode.operator}
                        </div>
                        <div>
                          <b>개통일:</b> {hoveredNode.open_date}
                        </div>
                        <div>
                          <b>환승역:</b>{" "}
                          {hoveredNode.is_transfer >= 2 ? "환승역" : "일반역"}
                        </div>
                        <div>
                          <b>평균 체류시간:</b> {hoveredNode.avg_stay_sec_new}초
                        </div>
                      </div>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="w-80">
          <div className="bg-white border rounded-lg p-4 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">선택된 정보</h2>
            {/* 기존 selectedNode/selectedLink 정보 패널은 유지 */}
            {selectedNode && (
              <div className="space-y-2">
                <h3 className="font-medium text-blue-600">역 정보</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">역명:</span>{" "}
                    {selectedNode.name}
                  </p>
                  <p>
                    <span className="font-medium">노선:</span>{" "}
                    {selectedNode.line}
                  </p>
                  <p>
                    <span className="font-medium">운영사:</span>{" "}
                    {selectedNode.operator}
                  </p>
                  <p>
                    <span className="font-medium">개통일:</span>{" "}
                    {selectedNode.open_date}
                  </p>
                  <p>
                    <span className="font-medium">환승역:</span>{" "}
                    {selectedNode.is_transfer >= 2 ? "환승역" : "일반역"}
                  </p>
                  <p>
                    <span className="font-medium">평균 체류시간:</span>{" "}
                    {selectedNode.avg_stay_sec_new}초
                  </p>
                </div>
              </div>
            )}
            {selectedLink && (
              <div className="space-y-2">
                <h3 className="font-medium text-green-600">구간 정보</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">출발역:</span>{" "}
                    {nodes.find((n) => n.id === selectedLink.source)?.name ||
                      selectedLink.source}
                  </p>
                  <p>
                    <span className="font-medium">도착역:</span>{" "}
                    {nodes.find((n) => n.id === selectedLink.target)?.name ||
                      selectedLink.target}
                  </p>
                  <p>
                    <span className="font-medium">노선:</span>{" "}
                    {selectedLink.line}
                  </p>
                  <p>
                    <span className="font-medium">소요시간:</span>{" "}
                    {selectedLink.time ? `${selectedLink.time}초` : "환승 구간"}
                  </p>
                </div>
              </div>
            )}
            {!selectedNode && !selectedLink && (
              <p className="text-gray-500 text-sm">
                노선도에서 역(원)이나 구간(선)을 클릭하여 정보를 확인하세요.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

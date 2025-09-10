import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { parseSvg } from "./utils";
import type { NetworkMapProps } from "@/types/network";
import { Button } from "../ui/button";

import { calculateHighlightState } from "./highlightUtils";
import { renderSvgNode, reorderSvgForHighlightPriority } from "./svgRenderer";
import { MainPageNodeTooltip } from "./DefaultTooltips";
import { StationIcon } from "../StationIcon";

// SVG에서 노드의 실제 위치를 계산하는 함수 (svgRenderer.tsx와 동일한 로직)
function parseMatrix(transform: string): number[] | null {
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) return null;
  return match[1]
    .replace(/,/g, " ")
    .split(/\s+/)
    .map(Number)
    .filter((n) => !isNaN(n));
}

function applyMatrixToPoint(cx: number, cy: number, m: number[]) {
  const [a, b, c, d, e, f] = m;
  return { x: a * cx + c * cy + e, y: b * cx + d * cy + f };
}

function getNodePositionFromSvg(
  nodeId: string,
  svgText: string
): { x: number; y: number } | null {
  // SVG 텍스트에서 해당 노드의 path 요소를 찾기
  const pathRegex = new RegExp(
    `<path[^>]*id="${nodeId}"[^>]*d="([^"]*)"[^>]*>`,
    "i"
  );
  const match = svgText.match(pathRegex);

  if (!match) return null;

  const d = match[1];

  // 원의 중심점을 정확히 계산 (svgRenderer.tsx와 동일한 로직)
  const coordMatches = d.match(/([-\d.]+)/g);
  if (!coordMatches || coordMatches.length < 4) return null;

  const coords = coordMatches.map(parseFloat);

  // 원의 중심점을 찾기 위해 x, y 좌표의 중간값을 계산
  const xCoords = coords.filter((_, i) => i % 2 === 0); // 짝수 인덱스 (x 좌표)
  const yCoords = coords.filter((_, i) => i % 2 === 1); // 홀수 인덱스 (y 좌표)

  let centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2;
  let centerY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2;

  // transform 매트릭스가 있는지 확인
  const transformMatch = svgText.match(
    new RegExp(`<path[^>]*id="${nodeId}"[^>]*transform="([^"]*)"[^>]*>`, "i")
  );
  if (transformMatch && transformMatch[1].includes("matrix")) {
    const mat = parseMatrix(transformMatch[1]);
    if (mat) {
      const pt = applyMatrixToPoint(centerX, centerY, mat);
      centerX = pt.x;
      centerY = pt.y;
    }
  }

  return { x: centerX, y: centerY };
}

export function NetworkMap({
  nodes,
  links,
  svgText,
  config = {},
  highlights = [],
  tooltips,
  onNodeClick,
  onLinkClick,
  apiStationNumbers, // API 응답의 sta_num들 추가
  startStationId, // 출발역 ID
  endStationId, // 도착역 ID
}: NetworkMapProps) {
  const {
    showZoomControls = true,
    showTooltips = true,
    showLegend = true, // 범례 표시 여부
    defaultZoom = 0.25,
    defaultPan = { x: 100, y: -650 },
    minZoom = 0.1,
    maxZoom = 1.0,
    zoomSensitivity = 0.05,
    tooltipMode = "default", // 툴팁 모드 기본값
  } = config;

  const [svgReactTree, setSvgReactTree] = useState<{
    pathElements: React.ReactNode[];
    textElements: React.ReactNode[];
    defsElements: React.ReactNode[];
  } | null>(null);
  const [scale, setScale] = useState(defaultZoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState(defaultPan);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 앵커 고정 줌 유틸 (버튼/휠 모두 공용)
  const applyZoomAt = useCallback(
    (newScale: number, anchorX: number, anchorY: number) => {
      const s = scale;
      const { x: tx, y: ty } = pan;

      // 화면(anchor) → 월드 좌표
      const wx = (anchorX - tx) / s;
      const wy = (anchorY - ty) / s;

      // anchor가 화면에서 '고정'되도록 새 pan 계산
      const newTx = anchorX - wx * newScale;
      const newTy = anchorY - wy * newScale;

      setScale(newScale);
      setPan({ x: newTx, y: newTy });
    },
    [scale, pan]
  );

  // 컨테이너 중앙 앵커 도우미
  const getContainerCenter = useCallback(() => {
    const el = containerRef.current!;
    const r = el.getBoundingClientRect();
    return { x: r.width / 2, y: r.height / 2 };
  }, []);

  // 하이라이트 상태 계산
  const highlightState = useMemo(() => {
    return calculateHighlightState(highlights, nodes, links, apiStationNumbers);
  }, [highlights, nodes, links, apiStationNumbers]);

  // 툴팁 모드에 따른 툴팁 설정
  const effectiveTooltips = useMemo(() => {
    if (tooltipMode === "main") {
      return {
        node: (node: any) => <MainPageNodeTooltip node={node} />,
      };
    }
    return tooltips;
  }, [tooltipMode, tooltips]);

  // 출발역/도착역 아이콘 렌더링을 위한 계산
  const stationIcons = useMemo(() => {
    const icons: React.ReactNode[] = [];

    if (startStationId && svgText) {
      const startNode = nodes.find((node) => node.id === startStationId);
      if (startNode) {
        // SVG에서 실제 노드 위치 계산
        const svgPos = getNodePositionFromSvg(startStationId, svgText);
        console.log("출발역 아이콘 위치 계산:", {
          startStationId,
          startNode: startNode.name,
          svgPos,
          scale,
        });
        if (svgPos) {
          // 노드의 실제 중심점에 아이콘 배치
          icons.push(
            <StationIcon
              key={`start-${startStationId}`}
              type="start"
              x={svgPos.x}
              y={svgPos.y}
              scale={scale}
            />
          );
        }
      }
    }

    if (endStationId && svgText) {
      const endNode = nodes.find((node) => node.id === endStationId);
      if (endNode) {
        // SVG에서 실제 노드 위치 계산
        const svgPos = getNodePositionFromSvg(endStationId, svgText);
        console.log("도착역 아이콘 위치 계산:", {
          endStationId,
          endNode: endNode.name,
          svgPos,
          scale,
        });
        if (svgPos) {
          // 노드의 실제 중심점에 아이콘 배치
          icons.push(
            <StationIcon
              key={`end-${endStationId}`}
              type="end"
              x={svgPos.x}
              y={svgPos.y}
              scale={scale}
            />
          );
        }
      }
    }

    return icons;
  }, [startStationId, endStationId, nodes, svgText, scale]);

  // SVG 파싱 및 렌더링
  useEffect(() => {
    if (!svgText || !nodes.length || !links.length) return;

    let isMounted = true;

    parseSvg(svgText)
      .then((svgJson) => {
        if (!isMounted) return;

        // 하이라이트가 있는 경우 렌더링 순서를 조정
        if (highlights.length > 0) {
          // SVG 구조를 하이라이트 상태에 따라 재구성
          const reorderedSvgJson = reorderSvgForHighlightPriority(
            svgJson,
            highlightState
          );

          setSvgReactTree(
            renderSvgNode(
              reorderedSvgJson,
              nodes,
              links,
              onNodeClick,
              onLinkClick,
              undefined,
              highlightState, // 이미 계산된 highlightState 사용
              showTooltips,
              effectiveTooltips
            )
          );
        } else {
          setSvgReactTree(
            renderSvgNode(
              svgJson,
              nodes,
              links,
              onNodeClick,
              onLinkClick,
              undefined,
              highlightState, // 이미 계산된 highlightState 사용
              showTooltips,
              effectiveTooltips
            )
          );
        }
      })
      .catch((error) => {
        console.error("SVG 파싱 오류:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [
    svgText,
    nodes,
    links,
    highlights.length, // highlights.length를 의존성으로 추가
    highlightState, // highlightState만 의존성으로 유지
    onNodeClick,
    onLinkClick,
    showTooltips,
    effectiveTooltips, // tooltips 대신 effectiveTooltips 사용
  ]);

  // 이벤트 핸들러들 - 모든 Hook을 조건부 return 이전에 호출
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseLeave = useCallback(() => setIsDragging(false), []);

  // 마우스 이동 시 팬 처리
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        // 팬 감도 향상: 더 즉시적인 반응
        const newPanX = e.clientX - dragStart.x;
        const newPanY = e.clientY - dragStart.y;
        setPan({ x: newPanX, y: newPanY });
      }
    },
    [isDragging, dragStart]
  );

  // 확대/축소 핸들러 (컨테이너 중앙 기준)
  const handleZoom = useCallback(
    (delta: number) => {
      if (!containerRef.current) return;
      const next = Math.max(
        minZoom,
        Math.min(maxZoom, scale + delta * zoomSensitivity)
      );
      if (next === scale) return;

      const { x, y } = getContainerCenter(); // 중앙 기준(쏠림 방지)
      applyZoomAt(next, x, y);
    },
    [scale, minZoom, maxZoom, zoomSensitivity, applyZoomAt, getContainerCenter]
  );

  const handleReset = useCallback(() => {
    setScale(defaultZoom);
    setPan(defaultPan);
  }, [defaultZoom, defaultPan]);

  // wheel 이벤트 리스너
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const isZoom = e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (!isZoom) return;

      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      const sensitivity =
        Math.abs(e.deltaY) > 50 ? zoomSensitivity * 2 : zoomSensitivity;

      const next = Math.max(
        minZoom,
        Math.min(maxZoom, scale + delta * sensitivity)
      );
      if (next === scale) return;

      // ✅ '항상 같은 기준점'이면 쏠림 없음: 컨테이너 중앙
      //  마우스 위치 기준으로 바꾸고 싶으면 아래 두 줄 대신
      //  const rect = el.getBoundingClientRect();
      //  const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const { x, y } = getContainerCenter();
      applyZoomAt(next, x, y);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [
    scale,
    minZoom,
    maxZoom,
    zoomSensitivity,
    applyZoomAt,
    getContainerCenter,
  ]);

  // 데이터가 없으면 로딩 상태 표시
  if (!svgText || !nodes.length || !links.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">노선도 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // SVG가 아직 파싱되지 않았으면 로딩 상태 표시
  if (!svgReactTree) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">노선도를 렌더링하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ position: "relative", overflow: "hidden" }}>
      {/* zoom buttons */}
      {showZoomControls && (
        <div className="flex gap-2 mb-2 p-2">
          <Button onClick={() => handleZoom(1)} size="sm">
            확대
          </Button>
          <Button onClick={() => handleZoom(-1)} size="sm">
            축소
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            초기화
          </Button>
        </div>
      )}

      {/* 범례 이미지 - 우측 상단 고정 */}
      {showLegend && (
        <div
          className="absolute top-4 right-4 z-10  border-gray-300 shadow-xl"
          style={{
            pointerEvents: "auto", // 스크롤을 위해 auto로 변경
            width: "120px",
            height: "600px",
            overflowY: "auto", // 세로 스크롤 추가
            overflowX: "hidden", // 가로 스크롤 숨김
            // 스크롤바 스타일링
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0, 0, 0, 0.3) transparent",
          }}
          onMouseDown={(e) => {
            // 범례 영역에서 마우스 이벤트 전파 중단
            e.stopPropagation();
          }}
          onMouseMove={(e) => {
            // 범례 영역에서 마우스 이벤트 전파 중단
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            // 범례 영역에서 마우스 이벤트 전파 중단
            e.stopPropagation();
          }}>
          <img
            src="/line_legend.png" // 올바른 파일명으로 수정
            alt="범례"
            className="w-full h-auto object-contain"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              padding: "4px",
              border: "2px solid #DDDDDD",

              pointerEvents: "none", // 이미지는 클릭 방지
            }}
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 2721 1747"
          style={{ display: "block" }}>
          {/* defs 요소들을 먼저 렌더링 */}
          <defs>{svgReactTree.defsElements}</defs>
          <g transform={`translate(${pan.x},${pan.y})`}>
            {/* 경로 요소들 먼저 렌더링 */}
            <g transform={`scale(${scale})`}>{svgReactTree.pathElements}</g>
            {/* 텍스트 요소들을 별도 그룹으로 최상위에 렌더링 (하이라이트 상태 반영) */}
            <g transform={`scale(${scale})`}>{svgReactTree.textElements}</g>
            {/* 출발역/도착역 아이콘을 최상위에 렌더링 */}
            <g transform={`scale(${scale})`}>{stationIcons}</g>
          </g>
        </svg>
      </div>
    </div>
  );
}

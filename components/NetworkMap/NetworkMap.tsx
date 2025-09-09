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
          className="absolute top-4 right-4 z-100"
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
          </g>
        </svg>
      </div>
    </div>
  );
}

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

export function NetworkMap({
  nodes,
  links,
  svgText,
  config = {},
  highlights = [],
  tooltips,
  onNodeClick,
  onLinkClick,
}: NetworkMapProps) {
  const {
    showZoomControls = true,
    showTooltips = true,
    defaultZoom = 0.3,
    defaultPan = { x: -1000, y: -1500 },
    minZoom = 0.1,
    maxZoom = 5.0,
    zoomSensitivity = 0.3,
  } = config;

  const [svgReactTree, setSvgReactTree] = useState<React.ReactNode>(null);
  const [scale, setScale] = useState(defaultZoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState(defaultPan);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 하이라이트 상태 계산
  const highlightState = useMemo(() => {
    return calculateHighlightState(highlights, nodes, links);
  }, [highlights, nodes, links]);

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
          console.log(
            "Applying SVG reordering for",
            highlights.length,
            "highlights"
          );
          const reorderedSvgJson = reorderSvgForHighlightPriority(
            svgJson,
            highlightState
          );
          console.log("SVG reordering completed");

          // 디버깅: 하이라이트 상태 확인
          console.log("Highlight state:", {
            activeLines: Array.from(highlightState.activeLines),
            highlightedNodes: highlightState.highlightedNodes.size,
            highlightedLinks: highlightState.highlightedLinks.size,
          });

          setSvgReactTree(
            renderSvgNode(
              reorderedSvgJson,
              nodes,
              links,
              onNodeClick,
              onLinkClick,
              undefined,
              highlightState,
              showTooltips,
              tooltips
            )
          );
        } else {
          console.log("No highlights, using original SVG structure");
          setSvgReactTree(
            renderSvgNode(
              svgJson,
              nodes,
              links,
              onNodeClick,
              onLinkClick,
              undefined,
              highlightState,
              showTooltips,
              tooltips
            )
          );
        }
      })
      .catch((error) => {
        console.error("NetworkMap parseSvg 에러:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [
    svgText,
    nodes,
    links,
    onNodeClick,
    onLinkClick,
    highlightState,
    showTooltips,
    tooltips,
  ]);

  // 이벤트 핸들러들
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

  // 확대/축소 핸들러
  const handleZoom = useCallback(
    (delta: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const newScale = Math.max(
        minZoom,
        Math.min(maxZoom, scale + delta * zoomSensitivity)
      );
      const scaleRatio = newScale / scale;

      const newPanX = centerX - (centerX - pan.x) * scaleRatio;
      const newPanY = centerY - (centerY - pan.y) * scaleRatio;

      setScale(newScale);
      setPan({ x: newPanX, y: newPanY });
    },
    [scale, pan, minZoom, maxZoom, zoomSensitivity]
  );

  const handleReset = useCallback(() => {
    setScale(defaultZoom);
    setPan(defaultPan);
  }, [defaultZoom, defaultPan]);

  // wheel 이벤트 리스너
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      // 줌 (Ctrl + 휠 또는 트랙패드 줌)
      if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();

        // 트랙패드 감도 향상: deltaY 값을 더 민감하게 처리
        const delta = e.deltaY > 0 ? -1 : 1;
        const sensitivity =
          Math.abs(e.deltaY) > 50 ? zoomSensitivity * 2 : zoomSensitivity;
        const newScale = Math.max(
          minZoom,
          Math.min(maxZoom, scale + delta * sensitivity)
        );

        if (newScale !== scale) {
          const rect = container.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const scaleRatio = newScale / scale;

          const newPanX = centerX - (centerX - pan.x) * scaleRatio;
          const newPanY = centerY - (centerY - pan.y) * scaleRatio;

          setScale(newScale);
          setPan({ x: newPanX, y: newPanY });
        }
      }
      // 팬 (트랙패드 드래그)
      else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();

        // 트랙패드 팬 감도 향상 (맥 전용)
        const panSensitivity = 4.0; // 1.5 → 3.0으로 증가
        const newPanX = pan.x - e.deltaX * panSensitivity;
        const newPanY = pan.y - e.deltaY * panSensitivity;

        setPan({ x: newPanX, y: newPanY });
      }
    };

    container.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheelEvent);
    };
  }, [scale, pan]);

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
            리셋
          </Button>
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            확대율: {Math.round(scale * 100)}%
          </span>
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
          <g
            transform={`translate(${pan.x},${pan.y}) scale(${scale})`}
            style={{
              transition: "transform 0.3s ease-out",
              transformOrigin: "center",
            }}>
            {svgReactTree}
          </g>
        </svg>
      </div>
    </div>
  );
}

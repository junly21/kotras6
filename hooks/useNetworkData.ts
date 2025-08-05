import { useState, useEffect, useMemo } from "react";
import type {
  Node,
  Link,
  NetworkData,
  NodeMatcher,
  LinkMatcher,
} from "@/types/network";

interface UseNetworkDataOptions {
  autoLoad?: boolean;
  svgPath?: string;
  nodesPath?: string;
  linksPath?: string;
}

export function useNetworkData(options: UseNetworkDataOptions = {}) {
  const {
    autoLoad = true,
    svgPath = "/subway_link_transfer_updated.svg",
    nodesPath = "/nodes.json",
    linksPath = "/links.json",
  } = options;

  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [svgText, setSvgText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 노드 매칭 함수들
  const nodeMatcher: NodeMatcher = useMemo(
    () => ({
      byId: (id: string) => nodes.find((node) => node.id === id),
      byName: (name: string) => {
        const normalizedName = normalizeStationName(name);
        return nodes.find((node) => {
          const nodeName = node.name.split("_")[1] || node.name;
          const normalizedNodeName = normalizeStationName(nodeName);
          return (
            normalizedNodeName === normalizedName ||
            normalizedNodeName.includes(normalizedName) ||
            normalizedName.includes(normalizedNodeName)
          );
        });
      },
      byLine: (line: string) => nodes.filter((node) => node.line === line),
    }),
    [nodes]
  );

  // 링크 매칭 함수들
  const linkMatcher: LinkMatcher = useMemo(
    () => ({
      byNodes: (sourceId: string, targetId: string) =>
        links.find(
          (link) =>
            (link.source === sourceId && link.target === targetId) ||
            (link.source === targetId && link.target === sourceId)
        ),
      byLine: (line: string) => links.filter((link) => link.line === line),
      byNode: (nodeId: string) =>
        links.filter(
          (link) => link.source === nodeId || link.target === nodeId
        ),
    }),
    [links]
  );

  // 역명 정규화 함수
  const normalizeStationName = (name: string): string => {
    return name
      .replace(/[()]/g, "") // 괄호 제거
      .replace(/\s+/g, "") // 공백 제거
      .toLowerCase(); // 소문자 변환
  };

  // 네트워크 데이터 로드
  const loadNetworkData = async () => {
    console.log("useNetworkData: loadNetworkData 시작");
    setIsLoading(true);
    setError(null);

    try {
      console.log("useNetworkData: fetch 요청 시작", {
        nodesPath,
        linksPath,
        svgPath,
      });
      const [nodesRes, linksRes, svgRes] = await Promise.all([
        fetch(nodesPath),
        fetch(linksPath),
        fetch(svgPath),
      ]);

      console.log("useNetworkData: fetch 응답 상태", {
        nodesOk: nodesRes.ok,
        linksOk: linksRes.ok,
        svgOk: svgRes.ok,
      });

      if (!nodesRes.ok || !linksRes.ok || !svgRes.ok) {
        throw new Error("네트워크 데이터 로드 실패");
      }

      console.log("useNetworkData: 데이터 파싱 시작");
      const nodesText = await nodesRes.text();
      const cleanedNodesText = nodesText.replace(/:\s*NaN/g, ": null");
      const nodesData = JSON.parse(cleanedNodesText);
      const linksData = await linksRes.json();
      const svgData = await svgRes.text();

      console.log("useNetworkData: 데이터 파싱 완료", {
        nodesLength: nodesData.length,
        linksLength: linksData.length,
        svgLength: svgData.length,
      });

      setNodes(nodesData);
      setLinks(linksData);
      setSvgText(svgData);
      console.log("useNetworkData: 상태 업데이트 완료");
    } catch (err) {
      console.error("useNetworkData: 네트워크 데이터 로드 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      console.log("useNetworkData: 로딩 완료");
      setIsLoading(false);
    }
  };

  // 경로 하이라이트를 위한 노드 ID 찾기
  const findNodeIdsByStationNames = (stationNames: string[]): string[] => {
    return stationNames
      .map((name) => nodeMatcher.byName(name)?.id)
      .filter((id): id is string => id !== undefined);
  };

  // 역명으로 노드 ID 찾기 (여러 개 가능)
  const findNodeIdsByStationName = (stationName: string): string[] => {
    const normalizedName = normalizeStationName(stationName);
    return nodes
      .filter((node) => {
        const nodeName = node.name.split("_")[1] || node.name;
        const normalizedNodeName = normalizeStationName(nodeName);
        return (
          normalizedNodeName === normalizedName ||
          normalizedNodeName.includes(normalizedName) ||
          normalizedName.includes(normalizedNodeName)
        );
      })
      .map((node) => node.id);
  };

  // 노선별 하이라이트를 위한 노드 ID 찾기
  const findNodeIdsByLine = (line: string): string[] => {
    return nodeMatcher.byLine(line).map((node) => node.id);
  };

  // 경로의 연속된 노드들 사이의 링크 찾기
  const findLinksByNodeIds = (nodeIds: string[]): Link[] => {
    const result: Link[] = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const link = linkMatcher.byNodes(nodeIds[i], nodeIds[i + 1]);
      if (link) {
        result.push(link);
      }
    }
    return result;
  };

  // 초기 로드
  useEffect(() => {
    if (autoLoad) {
      loadNetworkData();
    }
  }, [autoLoad]);

  // NetworkData 객체
  const networkData: NetworkData = useMemo(
    () => ({
      nodes,
      links,
      nodeMatcher,
      linkMatcher,
    }),
    [nodes, links, nodeMatcher, linkMatcher]
  );

  return {
    // 상태
    nodes,
    links,
    svgText,
    isLoading,
    error,

    // 매칭 함수들
    nodeMatcher,
    linkMatcher,

    // 유틸리티 함수들
    findNodeIdsByStationNames,
    findNodeIdsByStationName,
    findNodeIdsByLine,
    findLinksByNodeIds,
    normalizeStationName,

    // 데이터 객체
    networkData,

    // 액션
    loadNetworkData,
    reload: loadNetworkData,
  };
}

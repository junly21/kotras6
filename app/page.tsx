"use client";

import { useEffect, useState } from "react";
import { NetworkMap } from "@/components/NetworkMap/NetworkMap";
import { PieChart } from "@/components/charts/PieChart";
import { ODPairChart } from "@/components/charts/ODPairChart";
import Spinner from "@/components/Spinner";
import type { Node, Link } from "@/types/network";
import { MainService, CardStats, ODPairStats } from "@/services/mainService";

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [svgText, setSvgText] = useState<string>("");
  const [cardStats, setCardStats] = useState<CardStats[]>([]);
  const [odPairStats, setOdPairStats] = useState<ODPairStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. SVG 파일 로드
        const svgResponse = await fetch("/subway_link 1.svg");
        const svgData = await svgResponse.text();
        setSvgText(svgData);

        // 2. 네트워크 노드/링크 데이터 로드
        const [nodesResponse, linksResponse] = await Promise.all([
          MainService.getNetworkNodes(),
          MainService.getNetworkLinks(),
        ]);

        if (nodesResponse.success) {
          setNodes(nodesResponse.data || []);
        } else {
          console.error("네트워크 노드 로딩 실패:", nodesResponse.error);
        }

        if (linksResponse.success) {
          setLinks(linksResponse.data || []);
        } else {
          console.error("네트워크 링크 로딩 실패:", linksResponse.error);
        }

        // 3. 권종별 통행수 데이터
        const cardStatsResponse = await MainService.getCardStatsFromApi();
        if (cardStatsResponse.success) {
          console.log("권종별 통행수 데이터:", cardStatsResponse.data);
          setCardStats(cardStatsResponse.data || []);
        } else {
          console.error("권종별 통행수 로딩 실패:", cardStatsResponse.error);
        }

        // 4. OD Pair 통계 데이터
        const odPairResponse = await MainService.getODPairStatsFromApi();
        if (odPairResponse.success) {
          console.log("OD Pair 통계 데이터:", odPairResponse.data);
          setOdPairStats(odPairResponse.data || []);
        } else {
          console.error("OD Pair 통계 로딩 실패:", odPairResponse.error);
        }
      } catch (err) {
        console.error("메인 데이터 로딩 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMainData();
  }, []);

  const handleNodeClick = (node: Node) => {
    console.log("노드 클릭:", node);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-280px)] flex flex-col p-2 gap-4  ">
      {/* 상단: 네트워크 맵 */}
      <div className="h-[400px] bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">네트워크 맵</h2>
        <NetworkMap
          nodes={nodes}
          links={links}
          svgText={svgText}
          onNodeClick={handleNodeClick}
          width="100%"
          height={300}
        />
      </div>

      {/* 하단: 좌우 분할 */}
      <div className="flex gap-4 h-90">
        {/* 좌측: 권종별 통행수 파이차트 */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">권종별 통행수</h2>
          <div className="h-full">
            {cardStats.length > 0 ? (
              <PieChart data={cardStats} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                데이터를 불러오는 중...
              </div>
            )}
          </div>
        </div>

        {/* 우측: OD Pair 차트 */}
        <div className="flex-1 bg-white rounded-lg shadow-md justify-between items-center p-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-semibold text-gray-900">OD Pair</h2>
            <span className="text-sm text-gray-500">(단위: 데이터 건수)</span>
          </div>
          <div className="h-full">
            {odPairStats.length > 0 ? (
              <ODPairChart data={odPairStats} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                데이터를 불러오는 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

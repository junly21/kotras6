"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { XYZ } from "ol/source";
import { Tile } from "ol/layer";
import { defaults } from "ol/control";
import { fromLonLat } from "ol/proj";
import { Toast } from "@/components/ui/Toast";
import { useApi } from "@/hooks/useApi";
import { NetworkMapService } from "@/services/networkMapService";
import { NetworkMapFilters } from "@/types/networkMap";
import type { NodeData, LineData } from "@/types/networkMap";
import { FilterForm } from "@/components/ui/FilterForm";
import { useNetworkFilters } from "@/hooks/useNetworkFilters";
import {
  networkMapSchema,
  networkMapFilterConfig,
} from "@/features/networkMap/filterConfig";
// OpenLayers 벡터 관련 추가 import
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { Style, Stroke, Circle as CircleStyle, Fill } from "ol/style";

export default function NetworkMapPage() {
  // 공통 네트워크 필터 훅 사용
  const {
    filters,
    networkOptions,
    agencyOptions,
    lineOptions,
    isAllAgency,
    handleFilterChange,
    handleSearch,
  } = useNetworkFilters();

  // 검색 수행 여부 상태
  const [hasSearched, setHasSearched] = useState(false);

  // 토스트 상태
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "info",
  });

  // 지도, 벡터 레이어 ref
  const mapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const vectorLayerRef = useRef<VectorLayer | null>(null);

  const apiCall = useCallback(() => {
    const agencyLabelRaw =
      agencyOptions.find((a) => a.value === filters.agency)?.label || "";
    const agencyLabel = agencyLabelRaw === "전체" ? "ALL" : agencyLabelRaw;
    return NetworkMapService.getMapData({
      network: filters.network,
      agency: filters.agency,
      line: filters.line,
      networkLabel: agencyLabel,
    });
  }, [filters, agencyOptions]);

  // 지도 데이터 조회 성공 시 점/선 그리기
  const onSuccess = useCallback(
    (data: { nodeData: NodeData[]; lineData: LineData[] }) => {
      setToast({
        isVisible: true,
        message: "네트워크 지도 데이터를 성공적으로 받았습니다.",
        type: "success",
      });
      // nodeData, lineData 구조에 맞게 파싱
      const nodeData = data?.nodeData || [];
      const lineData = data?.lineData || [];
      const vectorSource = vectorSourceRef.current;
      if (!vectorSource) return;
      vectorSource.clear();
      // 노드(점) 추가
      nodeData.forEach((node: NodeData) => {
        if (node.x && node.y) {
          const feature = new Feature({
            geometry: new Point(fromLonLat([Number(node.x), Number(node.y)])),
            name: node.sta_nm,
            id: node.sta_num,
          });
          feature.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 7,
                fill: new Fill({ color: "#ff5722" }),
                stroke: new Stroke({ color: "#fff", width: 2 }),
              }),
            })
          );
          vectorSource.addFeature(feature);
        }
      });
      // 링크(선) 추가
      lineData.forEach((link: LineData) => {
        if (link.start_x && link.start_y && link.end_x && link.end_y) {
          const coords = [
            fromLonLat([Number(link.start_x), Number(link.start_y)]),
            fromLonLat([Number(link.end_x), Number(link.end_y)]),
          ];
          const feature = new Feature({
            geometry: new LineString(coords),
            name: link.seq,
          });
          feature.setStyle(
            new Style({
              stroke: new Stroke({ color: "#007bff", width: 3 }),
            })
          );
          vectorSource.addFeature(feature);
        }
      });
    },
    []
  );

  const onError = useCallback((error: string) => {
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const { refetch } = useApi(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (hasSearched && filters.network && filters.agency && filters.line) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  // 필터폼 검색 핸들러
  const handleSearchWithToast = useCallback(
    (values: NetworkMapFilters) => {
      // 필수 필드 검증
      if (!values.network || !values.agency || !values.line) {
        setToast({
          isVisible: true,
          message: "모든 필수 필드를 선택해주세요.",
          type: "error",
        });
        return;
      }

      setHasSearched(true);
      handleSearch(values);
    },
    [handleSearch]
  );

  // 지도 초기화 및 벡터 레이어 준비
  useEffect(() => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({ color: "#007bff", width: 3 }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: "#ff5722" }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
      }),
    });
    const map = new Map({
      controls: defaults({ zoom: true, rotate: false }).extend([]),
      layers: [
        new Tile({
          visible: true,
          source: new XYZ({
            url: `http://api.vworld.kr/req/wmts/1.0.0/1A2BB1EC-4324-34AA-B2D2-A9C06A2B5928/Base/{z}/{y}/{x}.png`,
          }),
        }),
        vectorLayer,
      ],
      target: "network-map",
      view: new View({
        center: fromLonLat([127.169972804, 37.513058796]),
        zoom: 11,
      }),
    });
    mapRef.current = map;
    vectorSourceRef.current = vectorSource;
    vectorLayerRef.current = vectorLayer;
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">지도 조회</h1>

      {/* 공통 FilterForm 적용 */}
      <FilterForm<NetworkMapFilters>
        fields={networkMapFilterConfig.map((field, index) => ({
          ...field,
          options:
            index === 0
              ? networkOptions
              : index === 1
              ? agencyOptions
              : lineOptions,
          disabled:
            index === 1
              ? !filters.network
              : index === 2
              ? !filters.network || !filters.agency
              : false,
          type: index === 2 && isAllAgency ? "combobox" : field.type,
        }))}
        defaultValues={{ network: "", agency: "", line: "" }}
        schema={networkMapSchema}
        values={filters}
        onChange={(values) => {
          handleFilterChange(values);
        }}
        onSearch={handleSearchWithToast}
      />

      {/* 지도 영역 */}
      <div className="relative h-[550px] overflow-hidden rounded-[24px] border border-gray-200">
        <div id="network-map" className="h-full w-full" />
      </div>

      {/* 토스트 알림 */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

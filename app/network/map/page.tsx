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
// OpenLayers 벡터 관련 추가 import
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { Style, Stroke, Circle as CircleStyle, Fill } from "ol/style";

export default function NetworkMapPage() {
  const [filters, setFilters] = useState<NetworkMapFilters>({
    network: "",
    agency: "",
    line: "",
  });

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

  // 네트워크/노선/기관 옵션 상태
  const [networkOptions, setNetworkOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [agencyOptions, setAgencyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [lineOptions, setLineOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // 지도, 벡터 레이어 ref
  const mapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const vectorLayerRef = useRef<VectorLayer | null>(null);

  // 네트워크 목록 로드
  useEffect(() => {
    NetworkMapService.getNetworkList()
      .then((res) => {
        if (res.success) {
          const options = (res.data || []).map((option) => ({
            value: String(option.value),
            label: String(option.label),
          }));
          setNetworkOptions(options);
          // 네트워크 옵션 받아오면 첫 번째 값 자동 설정
          if (options.length > 0) {
            setFilters((prev) => ({
              ...prev,
              network: options[0].value,
              agency: "",
              line: "",
            }));
          }
        } else {
          setNetworkOptions([]);
          setToast({
            isVisible: true,
            message: res.error || "네트워크 목록 로드 실패",
            type: "error",
          });
        }
      })
      .catch((error) => {
        setNetworkOptions([]);
        setToast({
          isVisible: true,
          message: String(error),
          type: "error",
        });
      });
  }, []);

  // 기관명(agency) 목록 로드
  useEffect(() => {
    // 네트워크가 선택된 경우에만 기관명 목록 요청
    if (filters.network) {
      fetch("/api/common/agencies")
        .then((res) => res.json())
        .then((data) => {
          const options: { value: string; label: string }[] = Array.isArray(
            data.options
          )
            ? data.options.map((option: { value: string; label: string }) => ({
                value: String(option.value),
                label: String(option.label),
              }))
            : [];
          setAgencyOptions(options);
        })
        .catch(() => setAgencyOptions([]));
    } else {
      setAgencyOptions([]);
    }
  }, [filters.network]);

  // 네트워크 선택 시 노선 목록 로드 (의존성 분리)
  useEffect(() => {
    // 네트워크, 기관명 모두 선택된 경우에만 노선 목록 요청
    if (filters.network && filters.agency) {
      NetworkMapService.getLineList({
        network: filters.network,
        networkLabel:
          agencyOptions.find((a) => a.value === filters.agency)?.label || "",
      })
        .then((res) => {
          if (res.success) {
            const options = [
              { label: "전체", value: "ALL" },
              ...(res.data || []).map((option) => ({
                value: String(option.value),
                label: String(option.label),
              })),
            ];
            setLineOptions(options);
          } else {
            setLineOptions([]);
            setToast({
              isVisible: true,
              message: res.error || "노선 목록 로드 실패",
              type: "error",
            });
          }
        })
        .catch((error) => {
          setLineOptions([]);
          setToast({
            isVisible: true,
            message: String(error),
            type: "error",
          });
        });
    } else {
      setLineOptions([]);
    }
  }, [filters.network, filters.agency, agencyOptions]);

  // 지도 데이터 요청 useCallback
  const apiCall = useCallback(() => {
    // agencyOptions에서 현재 선택된 agency의 label을 찾음
    const agencyLabel =
      agencyOptions.find((a) => a.value === filters.agency)?.label || "";
    console.log("지도 데이터 요청", {
      network: filters.network,
      agency: filters.agency,
      line: filters.line,
      networkLabel: agencyLabel,
    });
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
    if (hasSearched) {
      refetch();
    }
  }, [filters, refetch, hasSearched]);

  // 필터폼 검색 핸들러
  const handleSearch = useCallback((values: NetworkMapFilters) => {
    setHasSearched(true);
    setFilters(values);
  }, []);

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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">지도 조회</h1>

      {/* 공통 FilterForm 적용 */}
      <FilterForm<NetworkMapFilters>
        fields={[
          {
            name: "network",
            label: "네트워크명",
            type: "select",
            options: networkOptions,
            required: true,
          },
          {
            name: "agency",
            label: "기관명",
            type: "select",
            options: agencyOptions,
            required: true,
            disabled: !filters.network,
          },
          {
            name: "line",
            label: "노선",
            type: "select",
            options: lineOptions,
            required: false,
            disabled: !filters.network || !filters.agency,
          },
        ]}
        defaultValues={{ network: "", agency: "", line: "" }}
        values={filters}
        onChange={setFilters}
        onSearch={handleSearch}
      />

      {/* 지도 영역 */}
      <div className="relative h-[600px] overflow-hidden rounded-lg border border-gray-200">
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

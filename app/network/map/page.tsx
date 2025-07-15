"use client";

import { useEffect, useCallback, useState } from "react";
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
import { FilterForm } from "@/components/ui/FilterForm";

export default function NetworkMapPage() {
  const [filters, setFilters] = useState<NetworkMapFilters>({
    network: "",
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

  // 네트워크/노선 옵션 상태
  const [networkOptions, setNetworkOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [lineOptions, setLineOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

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

  // 네트워크 선택 시 노선 목록 로드 (의존성 분리)
  useEffect(() => {
    if (filters.network) {
      NetworkMapService.getLineList({
        network: filters.network,
        networkLabel: "서울교통공사", // 임시 하드코딩
      })
        .then((res) => {
          if (res.success) {
            const options = (res.data || []).map((option) => ({
              value: String(option.value),
              label: String(option.label),
            }));
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
  }, [filters.network]);

  // 지도 데이터 요청 useCallback
  const apiCall = useCallback(() => {
    const networkLabel = "서울교통공사"; // 임시 하드코딩
    console.log("지도 데이터 요청", {
      network: filters.network,
      line: filters.line,
      networkLabel,
    });
    return NetworkMapService.getMapData({
      network: filters.network,
      line: filters.line,
      networkLabel,
    });
  }, [filters]);

  const onSuccess = useCallback(() => {
    setToast({
      isVisible: true,
      message: "네트워크 지도 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

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

  // 지도 초기화
  useEffect(() => {
    const map = new Map({
      controls: defaults({ zoom: true, rotate: false }).extend([]),
      layers: [
        new Tile({
          visible: true,
          source: new XYZ({
            url: `http://api.vworld.kr/req/wmts/1.0.0/1A2BB1EC-4324-34AA-B2D2-A9C06A2B5928/Base/{z}/{y}/{x}.png`,
          }),
        }),
      ],
      target: "network-map",
      view: new View({
        center: fromLonLat([127.189972804, 37.723058796]),
        zoom: 15,
      }),
    });
    return () => {
      if (map) {
        map.setTarget(undefined);
      }
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
            name: "line",
            label: "노선",
            type: "select",
            options: lineOptions,
            required: false,
            disabled: !filters.network,
          },
        ]}
        defaultValues={{ network: "", line: "" }}
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

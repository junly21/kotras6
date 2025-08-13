import { useState, useEffect, useCallback } from "react";
import { NetworkService } from "@/services/networkService";
import { NetworkMapService } from "@/services/networkMapService";
import { NetworkMapFilters } from "@/types/networkMap";

export const useNetworkFilters = () => {
  const [filters, setFilters] = useState<NetworkMapFilters>({
    network: "",
    agency: "",
    line: "",
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

  // 네트워크 목록 로드
  useEffect(() => {
    NetworkService.getNetworkList()
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
            }));
          }
        } else {
          setNetworkOptions([]);
        }
      })
      .catch(() => {
        setNetworkOptions([]);
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
          // 기관명 옵션이 로드되면 첫 번째 값으로 자동 설정
          if (options.length > 0) {
            setFilters((prev) => ({
              ...prev,
              agency: options[0].value,
              line: "ALL",
            }));
          }
        })
        .catch(() => setAgencyOptions([]));
    } else {
      setAgencyOptions([]);
    }
  }, [filters.network]);

  // 네트워크 선택 시 노선 목록 로드
  useEffect(() => {
    // 네트워크, 기관명 모두 선택된 경우에만 노선 목록 요청
    if (filters.network && filters.agency) {
      const agencyLabelRaw =
        agencyOptions.find((a) => a.value === filters.agency)?.label || "";
      const agencyLabel = agencyLabelRaw === "전체" ? "ALL" : agencyLabelRaw;
      NetworkMapService.getLineList({
        network: filters.network,
        networkLabel: agencyLabel,
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
            // 노선 목록이 로드되면 "전체"를 자동으로 선택
            setFilters((prev) => ({
              ...prev,
              line: "ALL",
            }));
          } else {
            setLineOptions([]);
          }
        })
        .catch(() => {
          setLineOptions([]);
        });
    } else {
      setLineOptions([]);
    }
  }, [filters.network, filters.agency, agencyOptions]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((values: NetworkMapFilters) => {
    setFilters(values);
  }, []);

  // 검색 핸들러
  const handleSearch = useCallback((values: NetworkMapFilters) => {
    setFilters(values);
  }, []);

  // 기관명이 전체인지 여부
  const isAllAgency =
    agencyOptions.find((a) => a.value === filters.agency)?.label === "전체";

  return {
    filters,
    networkOptions,
    agencyOptions,
    lineOptions,
    isAllAgency,
    handleFilterChange,
    handleSearch,
  };
};

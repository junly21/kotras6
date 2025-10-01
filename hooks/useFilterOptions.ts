import { useState, useEffect, useCallback, useRef, useMemo } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterOptionsConfig {
  [key: string]: {
    endpoint: string;
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
    autoSelectFirst?: boolean;
    transform?: (data: unknown) => FilterOption[];
    filterOptions?: (options: FilterOption[]) => FilterOption[];
  };
}

interface UseFilterOptionsReturn {
  options: Record<string, FilterOption[]>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  setOption: (key: string, value: string) => void;
  refreshOptions: (key?: string) => Promise<void>;
  // ✅ 새로운 기능들 추가
  isLoading: boolean; // 전체 로딩 상태
  isAllOptionsLoaded: boolean; // 모든 옵션이 로드되었는지
  getLoadingState: (key: string) => boolean; // 특정 필터의 로딩 상태
}

export function useFilterOptions(
  config: FilterOptionsConfig,
  onOptionChange?: (key: string, value: string) => void
): UseFilterOptionsReturn {
  const [options, setOptions] = useState<Record<string, FilterOption[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // ✅ 무한 렌더링 방지를 위한 ref 사용
  const hasInitialized = useRef<Record<string, boolean>>({});
  const onOptionChangeRef = useRef(onOptionChange);

  // ✅ config를 안정화하여 무한 렌더링 방지
  const stableConfig = useMemo(() => config, [JSON.stringify(config)]);

  // ✅ ref 업데이트
  useEffect(() => {
    onOptionChangeRef.current = onOptionChange;
  }, [onOptionChange]);

  // 특정 필터의 옵션을 가져오는 함수
  const fetchOptions = useCallback(
    async (key: string, configItem: FilterOptionsConfig[string]) => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: null }));

      try {
        const method = configItem.method || "GET";
        const requestOptions: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
          },
        };

        // POST 요청인 경우 body 추가
        if (method === "POST" && configItem.body) {
          requestOptions.body = JSON.stringify(configItem.body);
        }

        const response = await fetch(configItem.endpoint, requestOptions);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // transform 함수가 있으면 사용, 없으면 기본 구조 사용
        let transformedOptions = configItem.transform
          ? configItem.transform(data)
          : data.options || data || [];

        // filterOptions가 있으면 적용
        if (configItem.filterOptions) {
          transformedOptions = configItem.filterOptions(transformedOptions);
        }

        setOptions((prev) => ({ ...prev, [key]: transformedOptions }));

        // ✅ 첫 번째 옵션 자동 선택 설정 (초기화 시에만)
        if (
          configItem.autoSelectFirst &&
          transformedOptions.length > 0 &&
          !hasInitialized.current[key]
        ) {
          hasInitialized.current[key] = true;
          const firstValue = transformedOptions[0].value;
          onOptionChangeRef.current?.(key, firstValue);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        setErrors((prev) => ({ ...prev, [key]: errorMessage }));
        console.error(`${key} 옵션 로드 실패:`, error);
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    []
  );

  // 모든 필터 옵션을 가져오는 함수
  const fetchAllOptions = useCallback(async () => {
    const promises = Object.entries(stableConfig).map(([key, configItem]) =>
      fetchOptions(key, configItem)
    );
    await Promise.all(promises);
  }, [stableConfig, fetchOptions]);

  // 특정 필터 옵션 새로고침
  const refreshOptions = useCallback(
    async (key?: string) => {
      if (key) {
        const configItem = stableConfig[key];
        if (configItem) {
          await fetchOptions(key, configItem);
        }
      } else {
        await fetchAllOptions();
      }
    },
    [stableConfig, fetchOptions, fetchAllOptions]
  );

  // 옵션 값 설정
  const setOption = useCallback((key: string, value: string) => {
    onOptionChangeRef.current?.(key, value);
  }, []);

  // ✅ 새로운 기능들 구현
  const isLoading = Object.values(loading).some(Boolean);
  const isAllOptionsLoaded = Object.keys(stableConfig).every(
    (key) => options[key] && options[key].length > 0
  );
  const getLoadingState = useCallback(
    (key: string) => loading[key] || false,
    [loading]
  );

  // ✅ 컴포넌트 마운트 시에만 모든 옵션 로드
  useEffect(() => {
    // config가 변경될 때 hasInitialized 초기화
    hasInitialized.current = {};
    fetchAllOptions();
  }, [stableConfig]); // stableConfig 사용

  return {
    options,
    loading,
    errors,
    setOption,
    refreshOptions,
    // ✅ 새로운 속성들 반환
    isLoading,
    isAllOptionsLoaded,
    getLoadingState,
  };
}

// 특정 필터를 위한 편의 훅들
export function useAgencyOptions(onChange?: (value: string) => void) {
  const config = {
    agency: {
      endpoint: "/api/common/agencies",
      autoSelectFirst: true,
    },
  };

  // ✅ onChange를 ref로 안정화
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const {
    options,
    loading,
    errors,
    refreshOptions,
    isLoading,
    isAllOptionsLoaded,
    getLoadingState,
  } = useFilterOptions(config, (key, value) => {
    if (key === "agency") {
      onChangeRef.current?.(value);
    }
  });

  // ✅ 첫 번째 기관이 로드되면 자동으로 선택 (한 번만)
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    const agencyOptions = options.agency;
    if (agencyOptions && agencyOptions.length > 0 && !hasAutoSelected.current) {
      hasAutoSelected.current = true;
      const firstAgency = agencyOptions[0].value;
      onChangeRef.current?.(firstAgency);
    }
  }, [options.agency]); // onChange 의존성 제거

  return {
    options,
    loading,
    errors,
    refreshOptions,
    // ✅ 새로운 속성들도 반환
    isLoading,
    isAllOptionsLoaded,
    getLoadingState,
  };
}

export function useCommonCodeOptions(
  codeType: string,
  onChange?: (value: string) => void
) {
  const config = {
    [codeType]: {
      endpoint: `/api/common-codes?type=${codeType}`,
      autoSelectFirst: false,
    },
  };

  return useFilterOptions(config, (key, value) => {
    if (key === codeType) {
      onChange?.(value);
    }
  });
}

// ✅ 여러 필터를 동시에 관리하는 훅
export function useMultipleFilterOptions(
  filterConfigs: Record<
    string,
    { endpoint: string; autoSelectFirst?: boolean }
  >,
  onChange?: (key: string, value: string) => void
) {
  return useFilterOptions(filterConfigs, onChange);
}

// ✅ 정산 관련 필터들을 위한 편의 훅
export function useSettlementFilters(
  onChange?: (key: string, value: string) => void
) {
  const config = {
    agency: {
      endpoint: "/api/common/agencies",
      autoSelectFirst: true,
      // '전체'를 제외한 첫 번째 기관 선택
      filterOptions: (options: any[]) =>
        options.filter((opt) => opt.label !== "전체"),
    },
  };

  return useFilterOptions(config, onChange);
}

// ✅ 네트워크 관련 필터들을 위한 편의 훅
export function useNetworkFilters(
  onChange?: (key: string, value: string) => void
) {
  const config = {
    line: {
      endpoint: "/api/network/lines",
      autoSelectFirst: false,
    },
    station: {
      endpoint: "/api/network/nodes",
      autoSelectFirst: false,
    },
    platform: {
      endpoint: "/api/network/platforms",
      autoSelectFirst: false,
    },
  };

  return useFilterOptions(config, onChange);
}

// ✅ 거래내역 관련 필터들을 위한 편의 훅
export function useTransactionFilters(
  onChange?: (key: string, value: string) => void
) {
  const config = {
    agency: {
      endpoint: "/api/common/agencies",
      autoSelectFirst: false,
    },
    cardType: {
      endpoint: "/api/transaction-detail/card-types",
      autoSelectFirst: false,
    },
    line: {
      endpoint: "/api/network/lines",
      autoSelectFirst: false,
    },
  };

  return useFilterOptions(config, onChange);
}

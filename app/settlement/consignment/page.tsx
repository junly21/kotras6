"use client";
import TestGrid from "@/components/TestGrid";
import Spinner from "@/components/Spinner";
import CsvExportButton from "@/components/CsvExportButton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FilterForm } from "@/components/ui/FilterForm";
import { Toast } from "@/components/ui/Toast";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useApi } from "@/hooks/useApi";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { SettlementConsignmentService } from "@/services/settlementConsignmentService";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  SettlementConsignmentFilters,
  SettlementConsignmentData,
} from "@/types/settlementConsignment";
import {
  settlementConsignmentFields,
  settlementConsignmentSchema,
} from "@/features/settlementConsignment/filterConfig";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SettlementConsignmentPage() {
  const gridRef = useRef<AgGridReact>(null);
  const [filters, setFilters] = useState<SettlementConsignmentFilters>({
    oper_id: "",
    stmtGrpId: "",
    lineCd: "",
    targetOperId: "",
  });

  // ✅ 검색 수행 여부 상태 추가
  const [hasSearched, setHasSearched] = useState(false);

  const [lineCdOptions, setLineCdOptions] = useState<any[]>([]);
  const [targetOperIdOptions, setTargetOperIdOptions] = useState<any[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // 페이지 로드 시 모든 필드의 첫 번째 옵션 자동 선택
  useEffect(() => {
    const autoSelectFirstOptions = async () => {
      try {
        // 기관명 옵션 로드 및 첫 번째 선택
        const agencyResponse = await fetch(
          "/api/settlement/consignment/agencies"
        );
        const agencyData = await agencyResponse.json();
        const agencyOptions =
          agencyData.options?.filter((opt: any) => opt.label !== "전체") || [];
        if (agencyOptions.length > 0) {
          const firstAgency = agencyOptions[0].value;
          setFilters((prev) => ({ ...prev, oper_id: firstAgency }));

          // 기관명이 선택되면 노선명와 대상기관 옵션도 로드
          await loadDependentOptions(firstAgency);
        }

        // 대안 옵션 로드 및 첫 번째 선택
        const stmtResponse = await fetch("/api/stmt_grp_id");
        const stmtData = await stmtResponse.json();
        const stmtOptions = stmtData.options || [];
        if (stmtOptions.length > 0) {
          const firstStmt = stmtOptions[0].value;
          setFilters((prev) => ({ ...prev, stmtGrpId: firstStmt }));
        }
      } catch (error) {
        console.error("초기 옵션 로드 실패:", error);
      }
    };

    // 노선명와 대상기관 옵션 로드 함수
    const loadDependentOptions = async (operId: string) => {
      setIsFilterLoading(true);

      try {
        // 노선명 옵션 로드
        const lineCdResponse = await fetch(`/api/line_cd?oper_id=${operId}`);
        const lineCdData = await lineCdResponse.json();
        const lineCdOptions = lineCdData.options || [];
        setLineCdOptions(lineCdOptions);

        if (lineCdOptions.length > 0) {
          setFilters((prev) => ({
            ...prev,
            lineCd: lineCdOptions[0].value,
          }));
        }

        // 대상기관 옵션 로드
        const targetOperResponse = await fetch(
          `/api/target_oper_id?oper_id=${operId}`
        );
        const targetOperData = await targetOperResponse.json();
        const targetOperOptions = targetOperData.options || [];
        setTargetOperIdOptions(targetOperOptions);

        if (targetOperOptions.length > 0) {
          setFilters((prev) => ({
            ...prev,
            targetOperId: targetOperOptions[0].value,
          }));
        }
      } catch (error) {
        console.error("종속 옵션 로드 실패:", error);
      } finally {
        setIsFilterLoading(false);
      }
    };

    autoSelectFirstOptions();
  }, []);

  // 필터 변경 핸들러 - route-search와 같은 방식
  const handleFilterChange = useCallback(
    (values: SettlementConsignmentFilters) => {
      // 기관명이 변경되면 노선명와 대상기관 초기화 및 옵션 로드
      if (values.oper_id && values.oper_id !== filters.oper_id) {
        console.log("기관명 선택됨:", values.oper_id);

        // 초기화된 상태로 설정
        const newFilters = {
          ...values,
          lineCd: "",
          targetOperId: "",
        };
        setFilters(newFilters);
        setLineCdOptions([]);
        setTargetOperIdOptions([]);

        // 노선명 옵션 로드
        setIsFilterLoading(true);
        fetch(`/api/line_cd?oper_id=${values.oper_id}`)
          .then((res) => res.json())
          .then((data: { options: any[] }) => {
            console.log(
              "노선명 옵션 로드 완료:",
              data.options?.length || 0,
              "개"
            );
            const options = data.options || [];
            setLineCdOptions(options);

            // 노선명 첫 번째 옵션을 자동 선택
            if (options.length > 0) {
              const firstOption = options[0].value;
              setFilters((prev) => ({
                ...prev,
                lineCd: firstOption,
              }));
            }
          })
          .catch((error) => {
            console.error("노선명 옵션 로드 실패:", error);
          });

        // 대상기관 옵션 로드
        fetch(`/api/target_oper_id?oper_id=${values.oper_id}`)
          .then((res) => res.json())
          .then((data: { options: any[] }) => {
            console.log(
              "대상기관 옵션 로드 완료:",
              data.options?.length || 0,
              "개"
            );
            const options = data.options || [];
            setTargetOperIdOptions(options);

            // 대상기관 첫 번째 옵션을 자동 선택
            if (options.length > 0) {
              const firstOption = options[0].value;
              setFilters((prev) => ({
                ...prev,
                targetOperId: firstOption,
              }));
            }
          })
          .catch((error) => {
            console.error("대상기관 옵션 로드 실패:", error);
          })
          .finally(() => {
            setIsFilterLoading(false);
          });

        return;
      } else {
        // 기관명이 변경되지 않은 경우만 일반적으로 설정
        setFilters(values);
      }
    },
    [filters.oper_id]
  );

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

  const apiCall = useCallback(
    () => SettlementConsignmentService.getSettlementData(filters),
    [filters]
  );

  const onSuccess = useCallback((data: SettlementConsignmentData[]) => {
    console.log("위탁구간 조회 데이터 로드 성공:", data);
    setToast({
      isVisible: true,
      message: "위탁구간 조회 데이터를 성공적으로 받았습니다.",
      type: "success",
    });
  }, []);

  const onError = useCallback((error: string) => {
    console.error("위탁구간 조회 데이터 로드 실패:", error);
    setToast({
      isVisible: true,
      message: `데이터 로드 실패: ${error}`,
      type: "error",
    });
  }, []);

  const {
    data: rawApiData,
    loading,
    refetch,
  } = useApi<SettlementConsignmentData[]>(apiCall, {
    autoFetch: false,
    onSuccess,
    onError,
  });

  // API 데이터 처리
  const apiData = useMemo(() => {
    if (!rawApiData) return [];
    return rawApiData.filter((item) => item.oper_nm !== "총계");
  }, [rawApiData]);

  // 총계 객체에서 총계 값 추출
  const totalObject = useMemo(() => {
    if (!rawApiData) return null;
    return rawApiData.find((item) => item.oper_nm === "총계") || null;
  }, [rawApiData]);

  useEffect(() => {
    if (hasSearched) {
      refetch();
    }
  }, [hasSearched, refetch]);

  const handleSearch = useCallback((values: SettlementConsignmentFilters) => {
    // 필수 필드가 모두 채워졌는지 확인
    if (
      !values.oper_id ||
      !values.stmtGrpId ||
      !values.lineCd ||
      !values.targetOperId
    ) {
      console.log("필수 필드가 모두 채워지지 않았습니다:", values);
      return;
    }

    console.log("검색 실행:", values);
    setHasSearched(true); // ✅ 검색 시작
    setFilters(values);
  }, []);

  // 그리드용 데이터
  const rowData = apiData;

  // 하단 고정 행 데이터 (총계)
  const pinnedBottomRowData = useMemo(() => {
    if (!totalObject || !apiData || apiData.length === 0) return [];

    // 외부 API에서 제공된 총계 값 사용
    const totalPayment = Number(totalObject.pay_amt || 0);
    const totalReceipt = Number(totalObject.recv_amt || 0);
    const totalSettle = Number(totalObject.settle_amt || 0);
    const totalCount = Number(totalObject.cnt_28 || 0);

    // 숫자 포맷팅 (소수 첫째자리에서 반올림해서 정수로)
    const formatValue = (value: number) => {
      return Math.round(value).toLocaleString();
    };

    const result = [
      {
        stn_nm: `총 ${apiData.length}개`,
        oper_nm: "총계",
        pay_amt: formatValue(totalPayment),
        recv_amt: formatValue(totalReceipt),
        settle_amt: formatValue(totalSettle),
        cnt_28: totalCount.toLocaleString(),
      },
    ];

    return result;
  }, [totalObject, apiData]);

  const colDefs = [
    {
      headerName: "역명",
      field: "stn_nm",
      minWidth: 120,
      flex: 1,
      resizable: false,
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        if (params.node.rowPinned === "bottom") {
          return {
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return {};
      },
    },
    {
      headerName: "기관명",
      field: "oper_nm",
      minWidth: 120,
      flex: 1,
      resizable: false,
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        if (params.node.rowPinned === "bottom") {
          return {
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return {};
      },
    },
    {
      headerName: "지급액",
      field: "pay_amt",
      minWidth: 150,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: number | string }) => {
        // pinnedBottomRowData는 이미 포맷된 문자열이므로 그대로 반환
        if (typeof params.value === "string") {
          return params.value;
        }
        // 일반 데이터는 숫자로 처리 (소수 첫째자리에서 반올림해서 정수로)
        if (params.value == null) return "";
        return Math.round(params.value).toLocaleString();
      },
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        const baseStyle = { textAlign: "right" };
        if (params.node.rowPinned === "bottom") {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return baseStyle;
      },
    },
    {
      headerName: "수급액",
      field: "recv_amt",
      minWidth: 150,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: number | string }) => {
        // pinnedBottomRowData는 이미 포맷된 문자열이므로 그대로 반환
        if (typeof params.value === "string") {
          return params.value;
        }
        // 일반 데이터는 숫자로 처리 (소수 첫째자리에서 반올림해서 정수로)
        if (params.value == null) return "";
        return Math.round(params.value).toLocaleString();
      },
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        const baseStyle = { textAlign: "right" };
        if (params.node.rowPinned === "bottom") {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return baseStyle;
      },
    },
    {
      headerName: "정산금액",
      field: "settle_amt",
      minWidth: 150,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: number | string }) => {
        // pinnedBottomRowData는 이미 포맷된 문자열이므로 그대로 반환
        if (typeof params.value === "string") {
          return params.value;
        }
        // 일반 데이터는 숫자로 처리 (소수 첫째자리에서 반올림해서 정수로)
        if (params.value == null) return "";
        return Math.round(params.value).toLocaleString();
      },
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        const baseStyle = { textAlign: "right" };
        if (params.node.rowPinned === "bottom") {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return baseStyle;
      },
    },
    {
      headerName: "28일 통행량",
      field: "cnt_28",
      minWidth: 120,
      flex: 1,
      resizable: false,
      valueFormatter: (params: { value: number | string }) => {
        // pinnedBottomRowData는 이미 포맷된 문자열이므로 그대로 반환
        if (typeof params.value === "string") {
          return params.value;
        }
        // 일반 데이터는 숫자로 처리
        if (params.value == null) return "";
        return params.value.toLocaleString();
      },
      cellStyle: (params: { node: { rowPinned?: string } }) => {
        const baseStyle = { textAlign: "right" };
        if (params.node.rowPinned === "bottom") {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: "#f8f9fa",
            borderTop: "2px solid #dee2e6",
          };
        }
        return baseStyle;
      },
    },
  ];

  return (
    <ProtectedRoute requiredPath="/settlement/consignment">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">위탁구간 조회</h1>

        {/* ✅ 필터 폼 로딩 상태 표시 */}
        <div className="relative">
          {isFilterLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
              <Spinner />
            </div>
          )}
          <FilterForm<SettlementConsignmentFilters>
            fields={settlementConsignmentFields.map((field) => {
              if (field.name === "lineCd") {
                return {
                  ...field,
                  options: lineCdOptions,
                  disabled: !filters.oper_id || isFilterLoading,
                };
              }
              if (field.name === "targetOperId") {
                return {
                  ...field,
                  options: targetOperIdOptions,
                  disabled: !filters.oper_id || isFilterLoading,
                };
              }
              return field;
            })}
            defaultValues={filters}
            values={filters}
            schema={settlementConsignmentSchema}
            onSearch={handleSearch}
            onChange={handleFilterChange}
          />
        </div>

        {/* 결과 영역 */}
        {!hasSearched && (
          <div className="bg-gray-50 flex flex-col justify-center items-center h-[600px] border-2 border-dashed border-gray-300 rounded-lg p-16">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">조회 결과</p>
              <p className="text-sm">
                필터를 선택하고 조회 버튼을 누르면 결과가 표시됩니다.
              </p>
            </div>
          </div>
        )}

        {hasSearched && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">위탁구간 조회 결과</h2>
              <div className="flex items-center gap-4">
                <CsvExportButton
                  gridRef={gridRef}
                  fileName="settlement-consignment-data.csv"
                  className="shadow-lg bg-accent-500"
                />
              </div>
            </div>
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <Spinner />
                </div>
              )}
              <div className="h-[600px]">
                <TestGrid
                  rowData={hasSearched ? rowData ?? [] : []}
                  columnDefs={colDefs}
                  gridRef={gridRef}
                  gridOptions={{
                    suppressColumnResize: false,
                    suppressRowClickSelection: true,
                    suppressCellFocus: true,
                    headerHeight: 50,
                    rowHeight: 35,
                    suppressScrollOnNewData: true,
                    pinnedBottomRowData: pinnedBottomRowData,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 토스트 알림 */}
        <Toast
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </div>
    </ProtectedRoute>
  );
}

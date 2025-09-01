import { useState, useCallback } from "react";
import { NetworkService } from "@/services/networkService";
import { NetworkFileUploadService } from "@/services/networkFileUploadService";
import {
  NetworkFileUploadFilters,
  NetworkFileUploadData,
} from "@/types/networkFileUpload";
import { NodeData, LinkData, PlatformData } from "@/types/networkDetail";

interface ToastState {
  isVisible: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export const useNetworkFileUpload = () => {
  // 상태 관리
  const [filters, setFilters] = useState<NetworkFileUploadFilters>({
    network: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [networkOptions, setNetworkOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // 기존 네트워크 파일 목록 관련 상태 제거
  // const [rowData, setRowData] = useState<NetworkFileUploadData[]>([]);

  // 각 데이터 타입별 상태 추가
  const [nodeData, setNodeData] = useState<NodeData[]>([]);
  const [linkData, setLinkData] = useState<LinkData[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);

  // 원본 데이터 저장
  const [rawNodeData, setRawNodeData] = useState<Record<string, unknown>[]>([]);
  const [rawLinkData, setRawLinkData] = useState<Record<string, unknown>[]>([]);
  const [rawPlatformData, setRawPlatformData] = useState<
    Record<string, unknown>[]
  >([]);

  // 기존 상세 그리드 관련 상태 제거 (더 이상 필요 없음)
  // const [detailData, setDetailData] = useState<NodeData[] | LinkData[] | PlatformData[]>([]);
  // const [rawDetailData, setRawDetailData] = useState<Record<string, unknown>[]>([]);
  // const [detailTitle, setDetailTitle] = useState<string>("");
  // const [showDetailGrid, setShowDetailGrid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: "",
    type: "info",
  });

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((values: NetworkFileUploadFilters) => {
    setFilters(values);
  }, []);

  // 검색 핸들러 - 네트워크 조회 시 모든 데이터를 한 번에 가져옴
  const handleSearch = useCallback(async (values: NetworkFileUploadFilters) => {
    setHasSearched(true);
    setFilters(values);
    setLoading(true);

    try {
      console.log("네트워크 데이터 조회 시작:", values);

      // 네트워크 선택된 경우에만 조회
      if (!values.network) {
        setToast({
          isVisible: true,
          message: "네트워크를 선택해주세요.",
          type: "error",
        });
        return;
      }

      // 모든 데이터를 병렬로 조회
      const [nodeResponse, linkResponse, platformResponse] = await Promise.all([
        NetworkFileUploadService.getNetworkNodeList(values.network),
        NetworkFileUploadService.getNetworkLineList(values.network),
        NetworkFileUploadService.getNetworkPlatformList(values.network),
      ]);

      // 노드 데이터 처리
      if (nodeResponse.success) {
        const nodes = Array.isArray(nodeResponse.data) ? nodeResponse.data : [];
        setNodeData(nodes as NodeData[]);
        setRawNodeData(nodeResponse.data as Record<string, unknown>[]);
      } else {
        setNodeData([]);
        setRawNodeData([]);
        console.error("노드 데이터 조회 실패:", nodeResponse.error);
      }

      // 링크 데이터 처리
      if (linkResponse.success) {
        const links = Array.isArray(linkResponse.data) ? linkResponse.data : [];
        setLinkData(links as LinkData[]);
        setRawLinkData(linkResponse.data as Record<string, unknown>[]);
      } else {
        setLinkData([]);
        setRawLinkData([]);
        console.error("링크 데이터 조회 실패:", linkResponse.error);
      }

      // 플랫폼 데이터 처리
      if (platformResponse.success) {
        const platforms = Array.isArray(platformResponse.data)
          ? platformResponse.data
          : [];
        setPlatformData(platforms as PlatformData[]);
        setRawPlatformData(platformResponse.data as Record<string, unknown>[]);
      } else {
        setPlatformData([]);
        setRawPlatformData([]);
        console.error("플랫폼 데이터 조회 실패:", platformResponse.error);
      }

      // 성공 메시지 표시
      const totalCount =
        (nodeResponse.success
          ? Array.isArray(nodeResponse.data)
            ? nodeResponse.data.length
            : 0
          : 0) +
        (linkResponse.success
          ? Array.isArray(linkResponse.data)
            ? linkResponse.data.length
            : 0
          : 0) +
        (platformResponse.success
          ? Array.isArray(platformResponse.data)
            ? platformResponse.data.length
            : 0
          : 0);

      setToast({
        isVisible: true,
        message: `네트워크 데이터를 성공적으로 로드했습니다. (총 ${totalCount}건)`,
        type: "success",
      });
    } catch (error) {
      console.error("네트워크 데이터 조회 중 오류:", error);
      setNodeData([]);
      setLinkData([]);
      setPlatformData([]);
      setRawNodeData([]);
      setRawLinkData([]);
      setRawPlatformData([]);
      setToast({
        isVisible: true,
        message: `조회 중 오류 발생: ${error}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 기존 개별 조회 핸들러들은 제거 (더 이상 필요 없음)
  // const handleNodeView = useCallback(async (netDt: string) => { ... });
  // const handleLineView = useCallback(async (netDt: string) => { ... });
  // const handlePlatformView = useCallback(async (netDt: string) => { ... });

  // 네트워크 옵션 로드 및 자동 조회
  const loadNetworkOptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await NetworkService.getNetworkList();
      if (res.success) {
        const options = (res.data || []).map((option) => ({
          value: String(option.value),
          label: String(option.label),
        }));
        setNetworkOptions(options);

        // 첫 번째 항목이 있으면 자동으로 선택하고 조회
        if (options.length > 0) {
          const firstOption = options[0];
          const newFilters = { network: firstOption.value };
          setFilters(newFilters);

          // 자동 조회 실행 (모든 데이터 조회)
          await handleSearch(newFilters);
        }
      } else {
        setNetworkOptions([]);
        setToast({
          isVisible: true,
          message: res.error || "네트워크 목록 로드 실패",
          type: "error",
        });
      }
    } catch (error) {
      setNetworkOptions([]);
      setToast({
        isVisible: true,
        message: String(error),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [handleSearch]);

  // 토스트 닫기
  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return {
    // 상태
    filters,
    hasSearched,
    networkOptions,
    // 기존 네트워크 파일 목록 관련 상태 제거
    // rowData,
    // detailData,
    // rawDetailData,
    // detailTitle,
    // showDetailGrid,

    // 새로운 데이터 상태들
    nodeData,
    linkData,
    platformData,
    rawNodeData,
    rawLinkData,
    rawPlatformData,

    loading,
    toast,

    // 핸들러
    handleFilterChange,
    handleSearch,
    // 기존 개별 조회 핸들러들 제거
    // handleNodeView,
    // handleLineView,
    // handlePlatformView,
    loadNetworkOptions,
    closeToast,
    // closeDetailGrid,
  };
};

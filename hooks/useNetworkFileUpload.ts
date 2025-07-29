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
  const [rowData, setRowData] = useState<NetworkFileUploadData[]>([]);
  const [detailData, setDetailData] = useState<
    NodeData[] | LinkData[] | PlatformData[]
  >([]);
  const [detailTitle, setDetailTitle] = useState<string>("");
  const [showDetailGrid, setShowDetailGrid] = useState(false);
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

  // 검색 핸들러
  const handleSearch = useCallback(async (values: NetworkFileUploadFilters) => {
    setHasSearched(true);
    setFilters(values);
    setShowDetailGrid(false);

    try {
      console.log("네트워크 파일 목록 조회 시작:", values);
      const response = await NetworkFileUploadService.getNetworkFileList(
        values
      );

      if (response.success) {
        console.log("네트워크 파일 목록 조회 성공:", response.data);
        const networkData = response.data as NetworkFileUploadData[];
        setRowData(networkData);

        // 첫 번째 데이터가 있으면 노드를 자동으로 조회
        if (networkData.length > 0) {
          const firstNetwork = networkData[0];
          console.log(
            "첫 번째 네트워크의 노드 자동 조회:",
            firstNetwork.net_dt
          );
          await handleNodeView(firstNetwork.net_dt);
        }

        setToast({
          isVisible: true,
          message: "네트워크 파일 목록을 성공적으로 받았습니다.",
          type: "success",
        });
      } else {
        console.error("네트워크 파일 목록 조회 실패:", response.error);
        setRowData([]);
        setToast({
          isVisible: true,
          message: `조회 실패: ${response.error}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("네트워크 파일 목록 조회 중 오류:", error);
      setRowData([]);
      setToast({
        isVisible: true,
        message: `조회 중 오류 발생: ${error}`,
        type: "error",
      });
    }
  }, []);

  // 노드 조회 핸들러
  const handleNodeView = useCallback(async (netDt: string) => {
    try {
      console.log("노드 조회 시작:", netDt);
      const response = await NetworkFileUploadService.getNetworkNodeList(netDt);
      console.log("노드 조회 결과:", response.data);

      if (response.success) {
        const nodeData = Array.isArray(response.data) ? response.data : [];
        setDetailData(nodeData as NodeData[]);
        setDetailTitle("노드 목록");
        setShowDetailGrid(true);
        setToast({
          isVisible: true,
          message: `노드 ${nodeData.length}개를 성공적으로 로드했습니다.`,
          type: "success",
        });
      } else {
        setToast({
          isVisible: true,
          message: `노드 조회 실패: ${response.error}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("노드 조회 중 오류:", error);
      setToast({
        isVisible: true,
        message: `노드 조회 중 오류 발생: ${error}`,
        type: "error",
      });
    }
  }, []);

  // 링크 조회 핸들러
  const handleLineView = useCallback(async (netDt: string) => {
    try {
      console.log("링크 조회 시작:", netDt);
      const response = await NetworkFileUploadService.getNetworkLineList(netDt);
      console.log("링크 조회 결과:", response.data);

      if (response.success) {
        const linkData = Array.isArray(response.data) ? response.data : [];
        setDetailData(linkData as LinkData[]);
        setDetailTitle("링크 목록");
        setShowDetailGrid(true);
        setToast({
          isVisible: true,
          message: `링크 ${linkData.length}개를 성공적으로 로드했습니다.`,
          type: "success",
        });
      } else {
        setToast({
          isVisible: true,
          message: `링크 조회 실패: ${response.error}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("링크 조회 중 오류:", error);
      setToast({
        isVisible: true,
        message: `링크 조회 중 오류 발생: ${error}`,
        type: "error",
      });
    }
  }, []);

  // 플랫폼 조회 핸들러
  const handlePlatformView = useCallback(async (netDt: string) => {
    try {
      console.log("플랫폼 조회 시작:", netDt);
      const response = await NetworkFileUploadService.getNetworkPlatformList(
        netDt
      );
      console.log("플랫폼 조회 결과:", response.data);

      if (response.success) {
        const platformData = Array.isArray(response.data) ? response.data : [];
        setDetailData(platformData as PlatformData[]);
        setDetailTitle("플랫폼 목록");
        setShowDetailGrid(true);
        setToast({
          isVisible: true,
          message: `플랫폼 ${platformData.length}개를 성공적으로 로드했습니다.`,
          type: "success",
        });
      } else {
        setToast({
          isVisible: true,
          message: `플랫폼 조회 실패: ${response.error}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("플랫폼 조회 중 오류:", error);
      setToast({
        isVisible: true,
        message: `플랫폼 조회 중 오류 발생: ${error}`,
        type: "error",
      });
    }
  }, []);

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

          // 자동 조회 실행
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

  // 상세 그리드 닫기
  const closeDetailGrid = useCallback(() => {
    setShowDetailGrid(false);
  }, []);

  return {
    // 상태
    filters,
    hasSearched,
    networkOptions,
    rowData,
    detailData,
    detailTitle,
    showDetailGrid,
    loading,
    toast,

    // 핸들러
    handleFilterChange,
    handleSearch,
    handleNodeView,
    handleLineView,
    handlePlatformView,
    loadNetworkOptions,
    closeToast,
    closeDetailGrid,
  };
};

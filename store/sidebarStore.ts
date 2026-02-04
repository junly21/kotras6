import { create } from "zustand";

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}

interface SidebarState {
  openMenus: string[]; // Set 대신 배열로 변경하여 localStorage 저장 가능
  currentPath: string;
  setCurrentPath: (path: string) => void;
  toggleMenu: (menuId: string) => void;
  openMenu: (menuId: string) => void;
  closeMenu: (menuId: string) => void;
  isMenuOpen: (menuId: string) => boolean;
  isCurrentPath: (path: string) => boolean;
  isActiveMenu: (path: string) => boolean; // 활성 메뉴 판별 함수 추가
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  openMenus: [],
  currentPath: "",

  setCurrentPath: (path: string) => {
    set({ currentPath: path });

    // 현재 경로에 해당하는 부모 메뉴들을 자동으로 열기
    const menuData = getMenuData();
    const openParentMenus: string[] = [];

    const findAndOpenParents = (
      items: MenuItem[],
      targetPath: string
    ): boolean => {
      for (const item of items) {
        if (item.path === targetPath) {
          return true;
        }
        if (item.children) {
          if (findAndOpenParents(item.children, targetPath)) {
            openParentMenus.push(item.id);
            return true;
          }
        }
      }
      return false;
    };

    findAndOpenParents(menuData, path);

    // 기존에 열린 메뉴들과 새로 열어야 할 메뉴들을 합침
    const currentOpenMenus = get().openMenus;
    const newOpenMenus = [
      ...new Set([...currentOpenMenus, ...openParentMenus]),
    ];

    set({ openMenus: newOpenMenus });
  },

  toggleMenu: (menuId: string) => {
    set((state) => {
      const newOpenMenus = state.openMenus.includes(menuId)
        ? state.openMenus.filter((id) => id !== menuId)
        : [...state.openMenus, menuId];
      return { openMenus: newOpenMenus };
    });
  },

  openMenu: (menuId: string) => {
    set((state) => {
      if (!state.openMenus.includes(menuId)) {
        return { openMenus: [...state.openMenus, menuId] };
      }
      return state;
    });
  },

  closeMenu: (menuId: string) => {
    set((state) => ({
      openMenus: state.openMenus.filter((id) => id !== menuId),
    }));
  },

  isMenuOpen: (menuId: string) => {
    return get().openMenus.includes(menuId);
  },

  isCurrentPath: (path: string) => {
    return get().currentPath === path;
  },

  isActiveMenu: (path: string) => {
    const currentPath = get().currentPath;
    if (!path || !currentPath) return false;

    // 정확한 경로 일치
    if (currentPath === path) return true;

    // 부모 경로와 일치하는 경우 (예: /settlement/by-institution이 /settlement로 시작하는 경우)
    if (path !== "/" && currentPath.startsWith(path)) return true;

    return false;
  },
}));

// 메뉴 데이터 정의
export const getMenuData = (): MenuItem[] => [
  {
    id: "transaction",
    label: "이용내역",
    icon: "/icon-gnb-transaction.svg",
    children: [
      {
        id: "transaction-analysis",
        label: "상위 이용구간",
        path: "/transaction/analysis",
      },
      {
        id: "transaction-detail",
        label: "상세 내역",
        path: "/transaction/detail",
      },
      {
        id: "transaction-detail-statistics",
        label: "상세 통계",
        path: "/transaction/detail_statistics",
      },
      {
        id: "transaction-amount",
        label: "노선별 내역",
        path: "/transaction/amount",
      },
    ],
  },
  {
    id: "network",
    label: "네트워크",
    icon: "/icon-gnb-network.svg",
    children: [
      {
        id: "network-map",
        label: "지도 조회",
        path: "/network/map",
      },
      {
        id: "network-line",
        label: "노선도 조회",
        path: "/network/line",
      },
      {
        id: "network-optimal-route",
        label: "최적 경로",
        path: "/network/optimal-route",
      },
      {
        id: "network-file-upload",
        label: "파일 등록",
        path: "/network/file-upload",
      },
    ],
  },
  {
    id: "route-search",
    label: "경로탐색",
    icon: "/icon-gnb-search.svg",
    children: [
      // {
      //   id: "route-search-result",
      //   label: "결과 조회(구)",
      //   path: "/route-search/path-key",
      // },
      {
        id: "route-search-resultmap",
        label: "탐색 조회",
        path: "/route-search/resultmap",
      },
      {
        id: "route-search-resultdetail",
        label: "결과 조회",
        path: "/route-search/resultdetail",
      },
    ],
  },
  {
    id: "settlement",
    label: "연락운임",
    icon: "/icon-gnb-result.svg",
    children: [
      {
        id: "settlement-overview",
        label: "정산 결과",
        path: "/settlement/overview",
      },
      {
        id: "settlement-by-institution",
        label: "기관별 조회",
        path: "/settlement/by-institution",
      },
      {
        id: "settlement-by-route",
        label: "노선별 조회",
        path: "/settlement/by-route",
      },
      {
        id: "settlement-by-station",
        label: "역별 조회",
        path: "/settlement/by-station",
      },
      {
        id: "settlement-by-od",
        label: "OD별 조회",
        path: "/settlement/by-od",
      },
      {
        id: "settlement-consignment",
        label: "위탁구간 조회",
        path: "/settlement/consignment",
      },
    ],
  },
  {
    id: "mock-settlement",
    label: "모의정산",
    icon: "/icon-gnb-mok.svg",
    children: [
      {
        id: "mock-settlement-register",
        label: "정산 등록",
        path: "/mock-settlement/register",
      },
      {
        id: "mock-settlement-result",
        label: "정산 결과",
        path: "/mock-settlement/result",
      },
      {
        id: "mock-settlement-by-institution",
        label: "기관별 조회",
        path: "/mock-settlement/by-institution",
      },
      {
        id: "mock-settlement-by-route",
        label: "노선별 조회",
        path: "/mock-settlement/by-route",
      },
      {
        id: "mock-settlement-by-station",
        label: "역별 조회",
        path: "/mock-settlement/by-station",
      },
      {
        id: "mock-settlement-by-od",
        label: "OD별 조회",
        path: "/mock-settlement/by-od",
      },
    ],
  },
  {
    id: "settings",
    label: "환경설정",
    icon: "/icon-gnb-setting.svg",
    children: [
      {
        id: "settings-common-codes",
        label: "공통코드 관리",
        path: "/settings/common-codes",
      },
      {
        id: "settings-detail-codes",
        label: "상세코드 관리",
        path: "/settings/detail-codes",
      },
      {
        id: "settings-logs",
        label: "작업로그 조회",
        path: "/settings/logs",
      },
    ],
  },
];

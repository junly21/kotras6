import { create } from "zustand";

export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  children?: MenuItem[];
}

interface SidebarState {
  openMenus: Set<string>;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  toggleMenu: (menuId: string) => void;
  openMenu: (menuId: string) => void;
  closeMenu: (menuId: string) => void;
  isMenuOpen: (menuId: string) => boolean;
  isCurrentPath: (path: string) => boolean;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  openMenus: new Set(),
  currentPath: "",

  setCurrentPath: (path: string) => {
    set({ currentPath: path });

    // 현재 경로에 해당하는 부모 메뉴들을 자동으로 열기
    const menuData = getMenuData();
    const openParentMenus = new Set<string>();

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
            openParentMenus.add(item.id);
            return true;
          }
        }
      }
      return false;
    };

    findAndOpenParents(menuData, path);
    set({ openMenus: openParentMenus });
  },

  toggleMenu: (menuId: string) => {
    set((state) => {
      const newOpenMenus = new Set(state.openMenus);
      if (newOpenMenus.has(menuId)) {
        newOpenMenus.delete(menuId);
      } else {
        newOpenMenus.add(menuId);
      }
      return { openMenus: newOpenMenus };
    });
  },

  openMenu: (menuId: string) => {
    set((state) => {
      const newOpenMenus = new Set(state.openMenus);
      newOpenMenus.add(menuId);
      return { openMenus: newOpenMenus };
    });
  },

  closeMenu: (menuId: string) => {
    set((state) => {
      const newOpenMenus = new Set(state.openMenus);
      newOpenMenus.delete(menuId);
      return { openMenus: newOpenMenus };
    });
  },

  isMenuOpen: (menuId: string) => {
    return get().openMenus.has(menuId);
  },

  isCurrentPath: (path: string) => {
    return get().currentPath === path;
  },
}));

// 메뉴 데이터 정의
export const getMenuData = (): MenuItem[] => [
  {
    id: "transaction",
    label: "거래내역",
    children: [
      {
        id: "transaction-analysis",
        label: "내역 분석",
        path: "/transaction/analysis",
      },
      {
        id: "transaction-detail",
        label: "상세 조회",
        path: "/transaction/detail",
      },
    ],
  },
  {
    id: "network",
    label: "네트워크",
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
        label: "최적경로",
        path: "/network/optimal-route",
      },
      {
        id: "network-file-upload",
        label: "파일등록",
        path: "/network/file-upload",
      },
    ],
  },
  {
    id: "route-search",
    label: "경로탐색",
    children: [
      {
        id: "route-search-result",
        label: "결과 조회",
        path: "/route-search/result",
      },
    ],
  },
  {
    id: "settlement",
    label: "정산결과",
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
        label: "역사별 조회",
        path: "/settlement/by-station",
      },
      {
        id: "settlement-by-od",
        label: "OD별 조회",
        path: "/settlement/by-od",
      },
    ],
  },
  {
    id: "mock-settlement",
    label: "모의정산",
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
        label: "역사별 조회",
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
  {
    id: "test-grid",
    label: "테스트 그리드",
    path: "/test-grid",
  },
];

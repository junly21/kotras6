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
    id: "dashboard",
    label: "대시보드",
    path: "/dashboard",
  },
  {
    id: "shipping",
    label: "운송 관리",
    children: [
      {
        id: "shipping-list",
        label: "운송 목록",
        path: "/shipping/list",
      },
      {
        id: "shipping-create",
        label: "운송 등록",
        path: "/shipping/create",
      },
      {
        id: "shipping-tracking",
        label: "운송 추적",
        path: "/shipping/tracking",
      },
    ],
  },
  {
    id: "customer",
    label: "고객 관리",
    children: [
      {
        id: "customer-list",
        label: "고객 목록",
        path: "/customer/list",
      },
      {
        id: "customer-create",
        label: "고객 등록",
        path: "/customer/create",
      },
    ],
  },
  {
    id: "reports",
    label: "보고서",
    children: [
      {
        id: "reports-sales",
        label: "매출 보고서",
        path: "/reports/sales",
      },
      {
        id: "reports-shipping",
        label: "운송 보고서",
        path: "/reports/shipping",
      },
    ],
  },
  {
    id: "settings",
    label: "설정",
    path: "/settings",
  },
];

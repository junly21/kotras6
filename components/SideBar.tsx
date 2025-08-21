"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore, getMenuData, MenuItem } from "../store/sidebarStore";
import { useSessionContext } from "../contexts/SessionContext";

const MenuItemComponent: React.FC<{ item: MenuItem; level: number }> = ({
  item,
  level,
}) => {
  const { isMenuOpen, toggleMenu, isCurrentPath } = useSidebarStore();
  const router = useRouter();

  const hasChildren = item.children && item.children.length > 0;
  const isOpen = isMenuOpen(item.id);
  const isActive = item.path ? isCurrentPath(item.path) : false;
  const isClickable = !hasChildren && item.path; // 클릭 가능한지 여부

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (hasChildren) {
      // 자식이 있는 경우 토글만
      toggleMenu(item.id);
    } else if (item.path) {
      // 자식이 없고 경로가 있는 경우 페이지 이동
      router.push(item.path);
    }
  };

  const baseClasses =
    "flex text-[rgba(54,54,54,0.4)] items-center w-full px-3 py-2 text-sm rounded-full transition-colors duration-200";
  const activeClasses = isActive
    ? "bg-blue-100 text-blue-700 font-medium"
    : "text-[#363636] hover:bg-[#E6E6E6] hover:rounded-full";

  const parentClasses = hasChildren
    ? "font-medium text-gray-900"
    : "text-gray-700";

  // 클릭 가능한 경우 cursor-pointer 추가
  const cursorClasses = isClickable ? "cursor-pointer" : "";

  return (
    <div>
      <button
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses} ${parentClasses} ${cursorClasses}`}>
        <span className="flex items-center gap-2">
          {item.icon && <img className="size-8" src={item.icon}></img>}
          {item.label}
        </span>
      </button>

      {hasChildren && isOpen && (
        <div className="mt-4 mb-4 p-4 bg-[#F6F6F6] rounded-xl">
          {item.children!.map((child) => (
            <MenuItemComponent key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function SideBar() {
  const pathname = usePathname();
  const { setCurrentPath } = useSidebarStore();
  const { canAccess } = useSessionContext();
  const menuData = getMenuData();

  // 권한에 따라 메뉴 필터링
  const filterMenuByPermissions = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        // 모의정산 메뉴 권한 체크 - 권한이 없으면 완전히 숨김
        if (
          item.id === "mock-settlement" ||
          item.path?.includes("/mock-settlement")
        ) {
          return canAccess("mockSettlement");
        }

        // 정산 메뉴 권한 체크
        if (item.id === "settlement" || item.path?.includes("/settlement")) {
          return canAccess("settlement");
        }

        // 거래분석 메뉴 권한 체크
        if (
          item.id === "transaction" ||
          item.path?.includes("/transaction/analysis")
        ) {
          return canAccess("transactionAnalysis");
        }

        // 네트워크 관리 메뉴 권한 체크
        if (item.id === "network" || item.path?.includes("/network")) {
          return canAccess("networkManagement");
        }

        // 기본적으로 접근 가능 (홈, 설정 등)
        return true;
      })
      .map((item) => ({
        ...item,
        // 자식 메뉴도 권한 체크
        children: item.children
          ? filterMenuByPermissions(item.children)
          : undefined,
      }));
  };

  const filteredMenuData = filterMenuByPermissions(menuData);

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname, setCurrentPath]);

  return (
    <aside className="w-64 h-full bg-white p-4 hidden md:block">
      <div className="mb-6 hidden">
        <h2>메뉴</h2>
      </div>

      <nav className="space-y-4">
        {filteredMenuData.map((item) => (
          <MenuItemComponent key={item.id} item={item} level={0} />
        ))}
      </nav>
    </aside>
  );
}

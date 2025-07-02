"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore, getMenuData, MenuItem } from "../store/sidebarStore";

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
    "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors duration-200";
  const activeClasses = isActive
    ? "bg-blue-100 text-blue-700 font-medium"
    : "text-gray-700 hover:bg-gray-100";

  const parentClasses = hasChildren
    ? "font-medium text-gray-900"
    : "text-gray-700";

  // 클릭 가능한 경우 cursor-pointer 추가
  const cursorClasses = isClickable ? "cursor-pointer" : "";

  return (
    <div className={`${level > 0 ? "ml-4" : ""}`}>
      <button
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses} ${parentClasses} ${cursorClasses}`}>
        <span>{item.label}</span>
        {hasChildren && (
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
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
  const menuData = getMenuData();

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname, setCurrentPath]);

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 p-4 hidden md:block">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
      </div>

      <nav className="space-y-1">
        {menuData.map((item) => (
          <MenuItemComponent key={item.id} item={item} level={0} />
        ))}
      </nav>
    </aside>
  );
}

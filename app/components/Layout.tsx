import React, { ReactNode } from "react";
import Header from "./Header";
import SideBar from "./SideBar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <Header />
      {/* 메인 영역 */}
      <div className="flex flex-1">
        {/* 사이드바 */}
        <SideBar />
        {/* 컨텐츠 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 메인 컨텐츠 */}
          <main className="flex-1 bg-gray-100 p-8">{children}</main>
          {/* 푸터 */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

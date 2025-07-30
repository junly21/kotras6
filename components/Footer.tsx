import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F5] h-32 text-white py-6 px-4 mt-auto rounded-b-lg">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:items-center sm:justify-between">
        {/* 좌측 정보 */}
        <div className="flex items-center gap-6 opacity-60">
          <div className="text-[#969696] flex border-r border-gray-100 font-bold items-center justify-center text-xl">
            Kotra6
          </div>
          <div className="border-r w-1 h-8 bg-gray-100"></div>
          <div className="text-[#969696] text-sm">
            14118, 경기도 안양시 동안구 엘에스로 116번길 25-32<br/>
            © Copyright 2025. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

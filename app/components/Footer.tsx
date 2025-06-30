import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F5] h-32 text-white py-6 px-4 mt-auto rounded-b-lg">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:items-center sm:justify-between">
        {/* 좌측 정보 */}
        <div className="flex items-center gap-4 ">
          <div className="w-8 h-8 rounded-full bg-black text-[#969696] flex items-center justify-center text-sm border border-gray-600">
            K
          </div>
          <div className="flex gap-1 items-baseline text-[#969696]">
            <span>Kotra6</span>
            <span className="font-semibold">2023 연락운임</span>
          </div>
        </div>

        {/* 저작권 문구 */}
        <div className="text-xs text-gray-400 text-left sm:text-right">
          © 2024 Company Name. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

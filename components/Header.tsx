"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSessionContext } from "@/contexts/SessionContext";

export default function Header() {
  const { getDisplayName } = useSessionContext();

  const handleManualDownload = () => {
    const link = document.createElement("a");
    link.href = "/manual.pdf";
    link.download = "manual.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="flex justify-between bg-[#363636] text-white px-6 py-4 shadow-md">
      <h1 className="text-2xl font-bold">
        <Link href="/">Kotras6</Link>
      </h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img className="size-7" src="/icon-user.svg"></img>
          {getDisplayName()}
        </div>
        <Button
          onClick={handleManualDownload}
          className="border border-white font-bold bg-[#363636]">
          매뉴얼
        </Button>
      </div>
    </header>
  );
}

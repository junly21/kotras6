"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSessionContext } from "@/contexts/SessionContext";

export default function Header() {
  const { getDisplayName } = useSessionContext();

  return (
    <header className="flex justify-between bg-[#363636] text-white px-6 py-4 shadow-md">
      <h1 className="text-2xl font-bold">
        <Link href="/">Kotra6</Link>
      </h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img className="size-7" src="/icon-user.svg"></img>
          {getDisplayName()}
        </div>
        <Button className="border border-white font-bold bg-[#363636]">
          메뉴얼
        </Button>
      </div>
    </header>
  );
}

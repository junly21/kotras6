import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#363636] text-white px-6 py-4 shadow-md">
      <h1 className="text-2xl font-bold">
        <Link href="/">Kotra6</Link>
      </h1>
    </header>
  );
}

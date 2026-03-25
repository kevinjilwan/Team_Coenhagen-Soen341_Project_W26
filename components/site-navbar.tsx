"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function SiteNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-40 bg-[#f2edda]/80 backdrop-blur-md border-b border-[#9a7a2e]/20">
      <Link href="/">
        <Image src="/logo.png" alt="Logo" width={200} height={100} />
      </Link>

      <div className="flex gap-8">
        <Link href="/">Home</Link>
        <Link href="/account">Account</Link>

        <div className="relative">
          <button onClick={() => setOpen(!open)}>Recipes</button>

          {open && (
            <div className="absolute bg-white shadow mt-2">
              <Link href="/recipes/new" className="block px-4 py-2">
                Create Recipes
              </Link>
              <Link href="/recipes" className="block px-4 py-2">
                My Recipes
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
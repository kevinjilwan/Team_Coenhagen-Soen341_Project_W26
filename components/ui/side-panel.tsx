"use client";

import { useState } from "react";
import { Marcellus } from "next/font/google";
import Link from "next/link";

const font = Marcellus ({ subsets: ["latin"], weight: "400" });

export default function SidePanel({ onClose }: { onClose: () => void }) {
  const [recipesOpen, setRecipesOpen] = useState(false);
  
  return (
    <aside className={`${font.className} w-[360px] shrink-0 border-r border-stone-300 px-4 py-6`}>
      <div className="mb-8 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border px-3 py-2 text-2xl hover:bg-amber-200/60"
          aria-label="Close menu"
          title="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="space-y-8 text-3xl text-stone-950">
        <Link href="/" className="block rounded px-3 py-2 hover:bg-amber-200/60">
          Home
        </Link>
        <Link href="/account" className="block rounded px-3 py-2 hover:bg-amber-200/60">
          Account
        </Link>
        
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setRecipesOpen((v) => !v)}
            className="w-full text-left block rounded px-3 py-2 hover:bg-amber-200/60"
          >
            Recipes
          </button>

          {recipesOpen && (
            <div className="ml-6 space-y-2 text-2xl">
              <Link
                href="/recipes/new"
                className="block rounded px-3 py-2 hover:bg-amber-200/60"
              >
                Create Recipes
              </Link>

              <Link
                href="/recipes"
                className="block rounded px-3 py-2 hover:bg-amber-200/60"
              >
                My Recipes
              </Link>
            </div>
          )}
        </div>
        
        <Link href="/settings" className="block rounded px-3 py-2 hover:bg-amber-200/60">
          Settings
        </Link>
      </nav>
    </aside>
  );
}

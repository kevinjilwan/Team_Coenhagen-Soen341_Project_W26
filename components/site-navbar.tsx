"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [mealPlansOpen, setMealPlansOpen] = useState(false);

  const isHome = pathname === "/";
  const isAccount = pathname === "/account";
  const isRecipes =
    pathname === "/recipes" ||
    pathname === "/recipes/new" ||
    pathname === "/recipes/recommended" ||
    pathname.startsWith("/recipes/");
  const isMealPlans =
    pathname === "/meal-plans" ||
    pathname === "/meal-plans/new" ||
    pathname.startsWith("/meal-plans/");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinkClass =
    "text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors font-normal";

  const activeLinkClass =
    "text-base text-[#9a7a2e] font-normal border-b border-[#9a7a2e]";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-40 bg-[#f2edda]/80 backdrop-blur-md border-b border-[#9a7a2e]/20">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Meal Major Logo"
          width={400}
          height={400}
          className="h-52 w-auto"
        />
      </Link>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
        <Link href="/" className={isHome ? activeLinkClass : navLinkClass}>
          Home
        </Link>

        <Link
          href="/account"
          className={isAccount ? activeLinkClass : navLinkClass}
        >
          Account
        </Link>

        <div className="relative">
          <button
            onClick={() => setRecipesOpen((prev) => !prev)}
            className={
              isRecipes
                ? "text-base text-[#9a7a2e] font-normal flex items-center gap-1 border-b border-[#9a7a2e]"
                : "text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors font-normal flex items-center gap-1"
            }
          >
            Recipes
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {recipesOpen && (
            <div className="absolute top-full left-0 mt-2 bg-[#f2edda] border border-[#9a7a2e]/20 rounded-md shadow-lg py-2 min-w-48 z-50">
              <Link
                href="/recipes/new"
                className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors"
              >
                Create Recipes
              </Link>
              <Link
                href="/recipes"
                className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors"
              >
                My Recipes
              </Link>
              <Link
                href="/recipes/recommended"
                className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors"
              >
                Recommended Recipes
              </Link>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMealPlansOpen((prev) => !prev)}
            className={
              isMealPlans
                ? "text-base text-[#9a7a2e] font-normal flex items-center gap-1 border-b border-[#9a7a2e]"
                : "text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors font-normal flex items-center gap-1"
            }
          >
            Weekly Meal Plan
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {mealPlansOpen && (
            <div className="absolute top-full left-0 mt-2 bg-[#f2edda] border border-[#9a7a2e]/20 rounded-md shadow-lg py-2 min-w-56 z-50">
              <Link
                href="/meal-plans/new"
                className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors"
              >
                Create Weekly Meal Plan
              </Link>
              <Link
                href="/meal-plans"
                className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors"
              >
                My Weekly Meal Plans
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={handleLogout}
          className="text-base text-[#6b6450] hover:text-[#151e2d] transition-colors tracking-wide"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}

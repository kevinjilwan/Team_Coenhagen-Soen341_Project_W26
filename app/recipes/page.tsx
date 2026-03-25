import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import RecipeListClient, { RecipeListItem } from "./RecipeListClient";

export default async function RecipesPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/auth/login");

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, description, ingredients, dietary_tags, preparation_time, difficulty, cost")
    .eq("user_id", authData.user.id);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f2edda] flex items-center justify-center">
        <p className="text-sm text-[#6b6450]">
          Failed to load recipes: {error.message}
        </p>
      </div>
    );
  }

  const items = (recipes ?? []) as RecipeListItem[];

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">
      {/* NAV */}
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
          <Link href="/" className="text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors font-normal">
            Home
          </Link>
          <Link href="/account" className="text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors font-normal">
            Account
          </Link>
          <details className="relative group">
            <summary className="list-none cursor-pointer text-base text-[#9a7a2e] font-normal flex items-center gap-1 border-b border-[#9a7a2e]">
              Recipes
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </summary>
            <div className="absolute top-full left-0 mt-2 bg-[#f2edda] border border-[#9a7a2e]/20 rounded-md shadow-lg py-2 min-w-48 z-50">
              <Link href="/recipes/new" className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors">
                Create Recipes
              </Link>
              <Link href="/recipes" className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors">
                My Recipes
              </Link>
            </div>
          </details>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/auth/logout" className="text-base text-[#6b6450] hover:text-[#151e2d] transition-colors tracking-wide">
            Log out
          </Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="pt-44">
        <div className="px-10 pt-12 pb-8 border-b border-[#9a7a2e]/20">
          <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-3">
            <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
            Your collection
          </p>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-4xl font-normal tracking-tight text-[#151e2d]">
              My Recipes
            </h1>
            <Link
              href="/recipes/new"
              className="text-sm font-medium px-4 py-2 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity"
            >
              + New recipe
            </Link>
          </div>
        </div>

        <div className="px-10 py-8 max-w-3xl">
          {items.length === 0 ? (
            <div className="py-16 flex flex-col items-start gap-3">
              <p className="font-serif text-2xl text-[#151e2d]/40 font-normal">No recipes yet.</p>
              <p className="text-sm text-[#6b6450] font-light">Start building your collection.</p>
              <Link
                href="/recipes/new"
                className="mt-2 text-sm font-medium px-4 py-2 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity"
              >
                Create your first recipe →
              </Link>
            </div>
          ) : (
            <RecipeListClient initialItems={items} />
          )}
        </div>

        <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
          <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
          <p className="text-xs text-[#6b6450]">Made for students who actually want to eat well.</p>
        </footer>
      </div>
    </main>
  );
}
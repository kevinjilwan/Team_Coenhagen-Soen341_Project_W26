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
    .select("id, title, description, ingredients, dietary_tags")
    .eq("user_id", authData.user.id);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f2edda] flex items-center justify-center">
        <p className="text-sm text-[#6b6450]">Failed to load recipes: {error.message}</p>
      </div>
    );
  }

  const items = (recipes ?? []) as RecipeListItem[];

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">

      {/* HEADER */}
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

      {/* CONTENT */}
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

      {/* FOOTER */}
      <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
        <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
        <p className="text-xs text-[#6b6450]">Made for students who actually want to eat well.</p>
      </footer>

    </main>
  );
}
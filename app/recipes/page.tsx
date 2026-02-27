import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import RecipeListClient, { RecipeListItem } from "./RecipeListClient";

// keep type in sync with client component; we import it above

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
    return <div className="p-4">Failed to load recipes: {error.message}</div>;
  }

  const items = (recipes ?? []) as RecipeListItem[];

  return (
    <div className="p-4 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">My Recipes</h1>
        <Link href="/recipes/new" className="rounded border px-3 py-2 text-sm text-black">
          New recipe
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded border p-4 text-sm">No recipes yet.</div>
      ) : (
        <RecipeListClient initialItems={items} />
      )}
    </div>
  );
}

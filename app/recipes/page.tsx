import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RecipeListItem = {
  id: string;
  title: string | null;
  description: string | null;
};

export default async function RecipesPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/auth/login");

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, description")
    .eq("user_id", authData.user.id);

  if (error) {
    return <div className="p-4">Failed to load recipes: {error.message}</div>;
  }

  const items = (recipes ?? []) as RecipeListItem[];

  return (
    <div className="p-4 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Link href="/recipes/new" className="rounded border px-3 py-2 text-sm">
          New recipe
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded border p-4 text-sm">No recipes yet.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((recipe) => (
            <li key={recipe.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{recipe.title ?? "Untitled recipe"}</h2>
                  {recipe.description ? (
                    <p className="text-sm opacity-80 mt-1">{recipe.description}</p>
                  ) : null}
                </div>
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="rounded border px-3 py-1.5 text-sm"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

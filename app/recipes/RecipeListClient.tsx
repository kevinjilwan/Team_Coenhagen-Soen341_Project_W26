"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export type RecipeListItem = {
  id: string;
  title: string | null;
  description: string | null;
  ingredients: string[] | null;
  dietary_tags: string[] | null;
};

export default function RecipeListClient({
  initialItems,
}: {
  initialItems: RecipeListItem[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return initialItems;

    return initialItems.filter((item) => {
      // title search
      if (item.title && item.title.toLowerCase().includes(q)) return true;

      // ingredients search
      if (
        item.ingredients &&
        item.ingredients.some((ing) => ing.toLowerCase().includes(q))
      ) {
        return true;
      }

      // dietary tags search
      if (
        item.dietary_tags &&
        item.dietary_tags.some((tag) => tag.toLowerCase().includes(q))
      ) {
        return true;
      }

      return false;
    });
  }, [query, initialItems]);

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes
        </label>
        <input
          id="recipe-search"
          type="text"
          placeholder="Search recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm text-black"
        />
      </div>

      <div className="mb-2 text-sm text-gray-900">
        {filtered.length} of {initialItems.length} recipes
      </div>

      {filtered.length === 0 ? (
        <div className="rounded border p-4 text-sm">No recipes found.</div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((recipe) => (
            <li key={recipe.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-black">
                    {recipe.title ?? "Untitled recipe"}
                  </h2>
                  {recipe.description ? (
                    <p className="text-sm opacity-80 mt-1 text-black">
                      {recipe.description}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="rounded border px-3 py-1.5 text-sm text-black"
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

"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

export type RecipeListItem = {
  id: string;
  title: string | null;
  description: string | null;
  ingredients: string[] | null;
  dietary_tags: string[] | null;
  preparation_time: number | null;
  difficulty: "easy" | "medium" | "hard" | null;
  cost: number | null;
};

const PREP_TIME_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Under 15 min", value: "15" },
  { label: "Under 30 min", value: "30" },
  { label: "Under 60 min", value: "60" },
];

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"] as const;

const COST_OPTIONS = [
  { label: "Any cost", value: "" },
  { label: "Low (< $10)", value: "low" },
  { label: "Medium ($10–$25)", value: "medium" },
  { label: "High (> $25)", value: "high" },
];

export default function RecipeListClient({ initialItems }: { initialItems: RecipeListItem[] }) {
  const [query, setQuery]           = useState("");
  const [activeTag, setActiveTag]   = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string>("");
  const [prepTime, setPrepTime]     = useState<string>("");
  const [cost, setCost]             = useState<string>("");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialItems.forEach((item) => item.dietary_tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [initialItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialItems.filter((item) => {
      if (q) {
        const inTitle = item.title?.toLowerCase().includes(q);
        const inIngredients = item.ingredients?.some((i) => i.toLowerCase().includes(q));
        if (!inTitle && !inIngredients) return false;
      }
      if (activeTag && !item.dietary_tags?.includes(activeTag)) return false;
      if (difficulty && item.difficulty !== difficulty) return false;
      if (prepTime && (item.preparation_time == null || item.preparation_time > Number(prepTime))) return false;
      if (cost === "low"    && (item.cost == null || item.cost > 10)) return false;
      if (cost === "medium" && (item.cost == null || item.cost <= 10 || item.cost > 25)) return false;
      if (cost === "high"   && (item.cost == null || item.cost <= 25)) return false;
      return true;
    });
  }, [query, activeTag, difficulty, prepTime, cost, initialItems]);

  const hasFilters = activeTag || difficulty || prepTime || cost;

  const selectClass = "px-3 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light";

  return (
    <div>
      {/* Search */}
      <div className="mb-5">
        <label htmlFor="recipe-search" className="sr-only">Search recipes</label>
        <input
          id="recipe-search"
          type="text"
          placeholder="Search by name or ingredient..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className={selectClass}>
          {PREP_TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selectClass}>
          <option value="">Any difficulty</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>

        <select value={cost} onChange={(e) => setCost(e.target.value)} className={selectClass}>
          {COST_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setActiveTag(null); setDifficulty(""); setPrepTime(""); setCost(""); }}
            className="text-xs px-3 py-2 rounded-md border border-[#9a7a2e]/30 text-[#6b6450] hover:text-[#151e2d] hover:border-[#151e2d] transition-colors"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeTag === null
                ? "bg-[#151e2d] text-[#f2edda] border-[#151e2d]"
                : "border-[#9a7a2e]/30 text-[#6b6450] hover:border-[#9a7a2e]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeTag === tag
                  ? "bg-[#151e2d] text-[#f2edda] border-[#151e2d]"
                  : "border-[#9a7a2e]/30 text-[#6b6450] hover:border-[#9a7a2e]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-[#6b6450] uppercase tracking-widest mb-4">
        {filtered.length} of {initialItems.length} recipes
      </p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl text-[#151e2d] mb-1">No recipes found.</p>
          <p className="text-sm text-[#6b6450] font-light">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#9a7a2e]/15">
          {filtered.map((recipe) => (
            <li key={recipe.id} className="py-6 flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-xl text-[#151e2d] mb-1">
                  {recipe.title ?? "Untitled recipe"}
                </h2>
                {recipe.description && (
                  <p className="text-sm text-[#6b6450] font-light leading-relaxed mb-2">
                    {recipe.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {recipe.preparation_time != null && (
                    <span className="text-xs text-[#6b6450]">⏱ {recipe.preparation_time} min</span>
                  )}
                  {recipe.difficulty && (
                    <span className="text-xs text-[#6b6450] capitalize">· {recipe.difficulty}</span>
                  )}
                  {recipe.cost != null && (
                    <span className="text-xs text-[#6b6450]">· ${recipe.cost.toFixed(2)}</span>
                  )}
                </div>
                {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {recipe.dietary_tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full border border-[#9a7a2e]/30 text-[#9a7a2e]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/recipes/${recipe.id}/edit`}
                className="text-xs font-medium px-4 py-2 rounded-md border border-[#9a7a2e]/30 text-[#6b6450] hover:text-[#151e2d] hover:border-[#151e2d] transition-colors whitespace-nowrap"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
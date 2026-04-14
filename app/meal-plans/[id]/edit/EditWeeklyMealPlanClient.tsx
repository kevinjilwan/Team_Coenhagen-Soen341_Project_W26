"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteNavbar from "@/components/site-navbar";

type Recipe = {
  id: string;
  title: string | null;
};

type WeeklyMealPlan = {
  id: string;
  title: string | null;
  week_start_date: string;
  created_at: string;
};

type WeeklyMealPlanItem = {
  id: string;
  day_of_week: string;
  meal_type: string;
  recipe_id: string;
  created_at: string;
  recipes: { id: string; title: string | null; description?: string | null } | { id: string; title: string | null; description?: string | null }[] | null;
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
] as const;

function prettyDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function prettyMealType(mealType: string) {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

function formatWeek(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeRecipe(
  recipe: WeeklyMealPlanItem["recipes"]
): { id: string; title: string | null; description?: string | null } | null {
  if (!recipe) return null;
  if (Array.isArray(recipe)) return recipe[0] ?? null;
  return recipe;
}

export default function EditWeeklyMealPlanClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [savingMeta, setSavingMeta] = useState(false);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
  const [items, setItems] = useState<WeeklyMealPlanItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [title, setTitle] = useState("");
  const [weekStartDate, setWeekStartDate] = useState("");

  async function loadPage() {
    try {
      setLoading(true);
      setError(null);

      const [planRes, recipesRes] = await Promise.all([
        fetch(`/api/weekly-meal-plans/${id}`, { method: "GET" }),
        fetch("/api/recipes", { method: "GET" }),
      ]);

      const planData = await planRes.json().catch(() => ({}));
      const recipesData = await recipesRes.json().catch(() => ({}));

      if (!planRes.ok) {
        throw new Error(planData?.error || "Failed to load weekly meal plan.");
      }

      if (!recipesRes.ok) {
        throw new Error(recipesData?.error || "Failed to load recipes.");
      }

      setPlan(planData.weeklyMealPlan ?? null);
      setItems(planData.items ?? []);
      setRecipes(recipesData.recipes ?? []);
      setTitle(planData.weeklyMealPlan?.title ?? "");
      setWeekStartDate(planData.weeklyMealPlan?.week_start_date ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadPage();
  }, [id]);

  const slotLookup = useMemo(() => {
    const map = new Map<string, WeeklyMealPlanItem>();
    for (const item of items) {
      map.set(`${item.day_of_week}:${item.meal_type}`, item);
    }
    return map;
  }, [items]);

  async function savePlanMeta() {
    try {
      setSavingMeta(true);
      setError(null);

      const res = await fetch(`/api/weekly-meal-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          week_start_date: weekStartDate,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update weekly meal plan.");
      }

      await loadPage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setSavingMeta(false);
    }
  }

  async function assignRecipe(
    dayOfWeek: string,
    mealType: string,
    recipeId: string
  ) {
    const slotKey = `${dayOfWeek}:${mealType}`;

    try {
      setBusySlot(slotKey);
      setError(null);

      if (!recipeId) {
        await removeAssignment(dayOfWeek, mealType);
        return;
      }

      const res = await fetch(`/api/weekly-meal-plans/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: dayOfWeek,
          meal_type: mealType,
          recipe_id: recipeId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to assign recipe.");
      }

      await loadPage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
      setBusySlot(null);
    }
  }

  async function removeAssignment(dayOfWeek: string, mealType: string) {
    const slotKey = `${dayOfWeek}:${mealType}`;

    try {
      setBusySlot(slotKey);
      setError(null);

      const res = await fetch(`/api/weekly-meal-plans/${id}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_of_week: dayOfWeek,
          meal_type: mealType,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to remove assignment.");
      }

      await loadPage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
      setBusySlot(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">
    
    <SiteNavbar/>

      <div className="pt-52 pb-20 px-10 max-w-7xl mx-auto">
        {loading && (
          <p className="text-sm text-[#6b6450]">Loading weekly meal plan...</p>
        )}

        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && plan && (
          <>
            <div className="mb-10">
              <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-4">
                <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
                Weekly planner
              </p>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 className="font-serif text-5xl font-normal tracking-tight text-[#151e2d]">
                    Edit Weekly Meal Plan
                  </h1>
                  <p className="text-sm text-[#6b6450] font-light mt-2">
                    Week of {formatWeek(plan.week_start_date)}
                  </p>
                </div>

                <Link
                  href={`/meal-plans/${id}`}
                  className="text-sm px-5 py-2.5 rounded-md border border-[#9a7a2e]/30 text-[#6b6450] hover:text-[#151e2d] hover:border-[#151e2d] transition-colors"
                >
                  Back to Plan
                </Link>
              </div>
            </div>

            <hr className="border-[#9a7a2e]/20 mb-10" />

            <div className="max-w-3xl mb-12 space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-medium tracking-wide uppercase text-[#6b6450]">
                  Plan title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
                  placeholder="Exam Week Plan"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium tracking-wide uppercase text-[#6b6450]">
                  Week start date
                </label>
                <input
                  type="date"
                  value={weekStartDate}
                  onChange={(e) => setWeekStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={savePlanMeta}
                  disabled={savingMeta}
                  className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {savingMeta ? "Saving..." : "Save Plan Details"}
                </button>
              </div>
            </div>

            <hr className="border-[#9a7a2e]/20 mb-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="rounded-lg border border-[#9a7a2e]/20 bg-[#f2edda] p-5"
                >
                  <h2 className="font-serif text-2xl font-normal text-[#151e2d] mb-4">
                    {prettyDay(day)}
                  </h2>

                  <div className="flex flex-col gap-4">
                    {MEAL_TYPES.map((mealType) => {
                      const slotKey = `${day}:${mealType}`;
                      const item = slotLookup.get(slotKey) ?? null;
                      const recipe = item ? normalizeRecipe(item.recipes) : null;

                      return (
                        <div
                          key={mealType}
                          className="rounded-md border border-[#9a7a2e]/20 p-4"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-xs uppercase tracking-wide text-[#6b6450]">
                              {prettyMealType(mealType)}
                            </p>

                            {recipe && (
                              <button
                                type="button"
                                onClick={() => removeAssignment(day, mealType)}
                                disabled={busySlot === slotKey}
                                className="text-xs text-red-700 hover:text-red-800 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <select
                            value={item?.recipe_id ?? ""}
                            onChange={(e) =>
                              assignRecipe(day, mealType, e.target.value)
                            }
                            disabled={busySlot === slotKey}
                            className="w-full px-3 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] focus:outline-none focus:border-[#9a7a2e]/60 transition-colors disabled:opacity-50"
                          >
                            <option value="">No recipe assigned</option>
                            {recipes.map((recipeOption) => (
                              <option key={recipeOption.id} value={recipeOption.id}>
                                {recipeOption.title?.trim() || "Untitled Recipe"}
                              </option>
                            ))}
                          </select>

                          {recipe && (
                            <p className="text-sm text-[#6b6450] mt-3">
                              Assigned: {recipe.title?.trim() || "Untitled Recipe"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
        <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
        <p className="text-xs text-[#6b6450]">
          Made for students who actually want to eat well.
        </p>
      </footer>
    </main>
  );
}
"use client";

import SiteNavbar from "@/components/site-navbar";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RecipeSummary = {
  id: string;
  title: string | null;
  description: string | null;
};

type WeeklyMealPlanItem = {
  id: string;
  day_of_week: string;
  meal_type: string;
  recipe_id: string;
  created_at: string;
  recipes: RecipeSummary | RecipeSummary[] | null;
};

type WeeklyMealPlan = {
  id: string;
  title: string | null;
  week_start_date: string;
  created_at: string;
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

function normalizeRecipe(recipe: WeeklyMealPlanItem["recipes"]): RecipeSummary | null {
  if (!recipe) return null;
  if (Array.isArray(recipe)) return recipe[0] ?? null;
  return recipe;
}

export default function WeeklyMealPlanViewClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
  const [items, setItems] = useState<WeeklyMealPlanItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/weekly-meal-plans/${id}`, {
          method: "GET",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load weekly meal plan.");
        }

        setPlan(data.weeklyMealPlan ?? null);
        setItems(data.items ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onDeletePlan() {
    try {
      setDeleting(true);
      setError(null);

      const res = await fetch(`/api/weekly-meal-plans/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete weekly meal plan.");
      }

      router.push("/meal-plans");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  const grid = useMemo(() => {
    const lookup = new Map<string, WeeklyMealPlanItem>();

    for (const item of items) {
      lookup.set(`${item.day_of_week}:${item.meal_type}`, item);
    }

    return DAYS.map((day) => ({
      day,
      slots: MEAL_TYPES.map((mealType) => ({
        mealType,
        item: lookup.get(`${day}:${mealType}`) ?? null,
      })),
    }));
  }, [items]);

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">

      <SiteNavbar />

      {/* DELETE MODAL */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-[#9a7a2e]/20 bg-[#f2edda] p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-normal text-[#151e2d]">
              Delete weekly meal plan?
            </h2>
            <p className="mt-3 text-sm text-[#6b6450] leading-relaxed">
              This weekly meal plan will be permanently deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-[#9a7a2e]/20 px-4 py-2 text-sm text-[#151e2d] hover:bg-[#ede6cf] transition-colors"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                disabled={deleting}
                onClick={onDeletePlan}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="pt-52 pb-20 px-10 max-w-7xl mx-auto">
        {loading && (
          <p className="text-sm text-[#6b6450]">Loading weekly meal plan...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && plan && (
          <>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-4">
                  <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
                  Weekly planner
                </p>
                <h1 className="font-serif text-5xl font-normal tracking-tight text-[#151e2d]">
                  {plan.title?.trim() || "Untitled Weekly Meal Plan"}
                </h1>
                <p className="text-sm text-[#6b6450] font-light mt-2">
                  Week of {formatWeek(plan.week_start_date)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/meal-plans"
                  className="text-sm px-5 py-2.5 rounded-md border border-[#9a7a2e]/30 text-[#6b6450] hover:text-[#151e2d] hover:border-[#151e2d] transition-colors"
                >
                  Back
                </Link>

                <Link
                  href={`/meal-plans/${plan.id}/edit`}
                  className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity"
                >
                  Edit Plan
                </Link>

                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="text-sm font-medium px-5 py-2.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <hr className="border-[#9a7a2e]/20 mb-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {grid.map(({ day, slots }) => (
                <div
                  key={day}
                  className="rounded-lg border border-[#9a7a2e]/20 bg-[#f2edda] p-5"
                >
                  <h2 className="font-serif text-2xl font-normal text-[#151e2d] mb-4">
                    {prettyDay(day)}
                  </h2>

                  <div className="flex flex-col gap-3">
                    {slots.map(({ mealType, item }) => {
                      const recipe = item ? normalizeRecipe(item.recipes) : null;

                      return (
                        <div
                          key={mealType}
                          className="rounded-md border border-[#9a7a2e]/20 p-4"
                        >
                          <p className="text-xs uppercase tracking-wide text-[#6b6450] mb-2">
                            {prettyMealType(mealType)}
                          </p>

                          {recipe ? (
                            <div>
                              <p className="font-medium text-[#151e2d]">
                                {recipe.title?.trim() || "Untitled Recipe"}
                              </p>
                              {recipe.description && (
                                <p className="text-sm text-[#6b6450] mt-1">
                                  {recipe.description}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-[#6b6450]">
                              No recipe assigned.
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

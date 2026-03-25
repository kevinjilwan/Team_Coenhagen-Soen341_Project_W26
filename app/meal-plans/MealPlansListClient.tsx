"use client";

import SiteNavbar from "@/components/site-navbar";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type WeeklyMealPlan = {
  id: string;
  title: string | null;
  week_start_date: string;
  created_at: string;
};

function formatWeek(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MealPlansListClient() {
  const router = useRouter();
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [mealPlansOpen, setMealPlansOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<WeeklyMealPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/weekly-meal-plans", { method: "GET" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load weekly meal plans.");
        }

        setPlans(data.weeklyMealPlans ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">
      
    <SiteNavbar/>
      

      {/* CONTENT */}
      <div className="pt-52 pb-20 px-10 max-w-4xl mx-auto">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-4">
              <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
              Weekly planner
            </p>
            <h1 className="font-serif text-5xl font-normal tracking-tight text-[#151e2d]">
              My Weekly Meal Plans
            </h1>
            <p className="text-sm text-[#6b6450] font-light mt-2">
              View and manage all of your weekly plans.
            </p>
          </div>

          <Link
            href="/meal-plans/new"
            className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            + Create Weekly Meal Plan
          </Link>
        </div>

        <hr className="border-[#9a7a2e]/20 mb-10" />

        {loading && (
          <p className="text-sm text-[#6b6450]">Loading weekly meal plans...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && plans.length === 0 && (
          <div className="py-10">
            <p className="font-serif text-2xl text-[#151e2d]/50 mb-2">
              No weekly meal plans yet.
            </p>
            <p className="text-sm text-[#6b6450] mb-5">
              Create your first plan to start organizing meals by week.
            </p>
            <Link
              href="/meal-plans/new"
              className="inline-block text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity"
            >
              Create Weekly Meal Plan
            </Link>
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <div className="flex flex-col gap-4">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/meal-plans/${plan.id}`}
                className="block rounded-lg border border-[#9a7a2e]/20 px-6 py-5 hover:border-[#9a7a2e]/50 transition-colors bg-[#f2edda]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-[#151e2d]">
                      {plan.title?.trim() || "Untitled Weekly Meal Plan"}
                    </h2>
                    <p className="text-sm text-[#6b6450] mt-1">
                      Week of {formatWeek(plan.week_start_date)}
                    </p>
                  </div>

                  <span className="text-sm text-[#6b6450]">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
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
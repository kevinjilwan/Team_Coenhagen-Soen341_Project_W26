"use client";

import SiteNavbar from "@/components/site-navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateWeeklyMealPlanClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [weekStartDate, setWeekStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onCreate() {
    setSaving(true);
    setMsg(null);

    const payload = {
      title: title.trim() || null,
      week_start_date: weekStartDate,
    };

    if (!payload.week_start_date) {
      setMsg("Week start date is required.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/weekly-meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMsg(data?.error || "Failed to create weekly meal plan.");
      setSaving(false);
      return;
    }

    router.push("/meal-plans");
    router.refresh();
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light";

  const labelClass =
    "text-xs font-medium tracking-wide uppercase text-[#6b6450]";

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">
     
      <SiteNavbar />

      {/* CONTENT */}
      <div className="pt-52 pb-20 px-10 max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-4">
            <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
            Weekly planner
          </p>
          <h1 className="font-serif text-5xl font-normal tracking-tight text-[#151e2d]">
            Create Weekly Meal Plan
          </h1>
          <p className="text-sm text-[#6b6450] font-light mt-2">
            Create a plan for a specific week, then assign recipes to each day.
          </p>
        </div>

        <hr className="border-[#9a7a2e]/20 mb-10" />

        {msg && <p className="text-xs text-red-600 mb-6">{msg}</p>}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Plan title</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Exam Week Plan"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Week start date *</label>
            <input
              type="date"
              className={inputClass}
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>

          <hr className="border-[#9a7a2e]/20" />

          <div className="flex items-center gap-3">
            <button
              onClick={onCreate}
              disabled={saving}
              className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create weekly meal plan"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/meal-plans")}
              className="text-sm px-5 py-2.5 rounded-md border border-[#9a7a2e]/30 text-[#6b6450] hover:text-[#151e2d] hover:border-[#151e2d] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
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
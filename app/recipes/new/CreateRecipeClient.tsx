"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Difficulty = "easy" | "medium" | "hard";

function lines(text: string) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

export default function CreateRecipeClient() {
  const router = useRouter();
  async function handleLogout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push("/");
  router.refresh();
}
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cost, setCost] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onCreate() {
    setSaving(true);
    setMsg(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      prep_time_minutes: prepTime === "" ? null : Number(prepTime),
      cook_time_minutes: cookTime === "" ? null : Number(cookTime),
      difficulty,
      estimated_cost: cost === "" ? null : Number(cost),
      ingredients: lines(ingredientsText),
      steps: lines(stepsText),
    };

    if (!payload.title) {
      setMsg("Title is required.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMsg(data?.error || "Failed to create recipe.");
      setSaving(false);
      return;
    }

    router.push("/recipes");
    router.refresh();
  }

  const inputClass = "w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light";
  const labelClass = "text-xs font-medium tracking-wide uppercase text-[#6b6450]";

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-40 bg-[#f2edda]/80 backdrop-blur-md border-b border-[#9a7a2e]/20">
        <Link href="/">
          <Image src="/logo.png" alt="Meal Major Logo" width={400} height={400} className="h-52 w-auto" />
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          <Link href="/" className="text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors font-normal">
            Home
          </Link>
          <Link href="/account" className="text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors font-normal">
            Account
          </Link>
          <div className="relative">
            <button
              onClick={() => setRecipesOpen(!recipesOpen)}
              className="text-base text-[#9a7a2e] font-normal flex items-center gap-1 border-b border-[#9a7a2e]"
            >
              Recipes
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {recipesOpen && (
              <div className="absolute top-full left-0 mt-2 bg-[#f2edda] border border-[#9a7a2e]/20 rounded-md shadow-lg py-2 min-w-48">
                <Link href="/recipes/new" className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors">
                  Create Recipes
                </Link>
                <Link href="/recipes" className="block px-4 py-2 text-base text-[#151e2d] hover:text-[#9a7a2e] transition-colors">
                  My Recipes
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleLogout}
            className="text-base text-[#6b6450] hover:text-[#151e2d] transition-colors tracking-wide"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="pt-52 pb-20 px-10 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-4">
            <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
            Your kitchen
          </p>
          <h1 className="font-serif text-5xl font-normal tracking-tight text-[#151e2d]">Create Recipe</h1>
          <p className="text-sm text-[#6b6450] font-light mt-2">Add ingredients, steps, time, cost, and difficulty.</p>
        </div>

        <hr className="border-[#9a7a2e]/20 mb-10" />

        {msg && <p className="text-xs text-red-600 mb-6">{msg}</p>}

        <div className="flex flex-col gap-6">

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recipe title" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Description</label>
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Prep time <span className="normal-case tracking-normal text-[#6b6450]/60">(min)</span></label>
              <input className={inputClass} value={prepTime} onChange={(e) => setPrepTime(e.target.value)} inputMode="numeric" placeholder="15" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Cook time <span className="normal-case tracking-normal text-[#6b6450]/60">(min)</span></label>
              <input className={inputClass} value={cookTime} onChange={(e) => setCookTime(e.target.value)} inputMode="numeric" placeholder="30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Difficulty</label>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDifficulty(opt)}
                    className={`flex-1 text-xs px-3 py-2.5 rounded-md border transition-colors capitalize ${
                      difficulty === opt
                        ? "bg-[#151e2d] text-[#f2edda] border-[#151e2d]"
                        : "bg-transparent text-[#6b6450] border-[#9a7a2e]/30 hover:border-[#9a7a2e]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Estimated cost <span className="normal-case tracking-normal text-[#6b6450]/60">($)</span></label>
              <input className={inputClass} value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" placeholder="12.50" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Ingredients <span className="normal-case tracking-normal text-[#6b6450]/60">(one per line)</span></label>
            <textarea className={`${inputClass} min-h-[120px] resize-y`} value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Steps <span className="normal-case tracking-normal text-[#6b6450]/60">(one per line)</span></label>
            <textarea className={`${inputClass} min-h-[140px] resize-y`} value={stepsText} onChange={(e) => setStepsText(e.target.value)} />
          </div>

          <hr className="border-[#9a7a2e]/20" />

          <div className="flex items-center gap-3">
            <button
              onClick={onCreate}
              disabled={saving}
              className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create recipe"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/recipes")}
              className="text-sm px-5 py-2.5 rounded-md border border-[#9a7a2e]/30 text-[#6b6450] hover:text-[#151e2d] hover:border-[#151e2d] transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>

      <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
        <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
        <p className="text-xs text-[#6b6450]">Made for students who actually want to eat well.</p>
      </footer>

    </main>
  );
}
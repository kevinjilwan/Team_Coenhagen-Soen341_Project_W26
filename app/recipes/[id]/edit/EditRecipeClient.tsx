"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Difficulty = "easy" | "medium" | "hard";

type Recipe = {
  id: string;
  title?: string | null;
  description?: string | null;
  ingredients?: string[] | string | null;
  preparation_time?: number | string | null;
  preparation_steps?: string[] | string | null;
  cost?: number | null;
  dietary_tags?: string[] | null;
  difficulty?: string | null;
};

function normalizeStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    return v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export default function EditRecipeClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [prepTime, setPrepTime] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [tagsText, setTagsText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/recipes/${id}`, { method: "GET" });
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error ?? "Failed to load recipe");

        const r: Recipe = json.recipe;

        setTitle(r.title ?? "");
        setDescription(r.description ?? "");

        const ing = normalizeStringArray(r.ingredients);
        const stp = normalizeStringArray(r.preparation_steps);

        setIngredientsText(ing.join("\n"));
        setStepsText(stp.join("\n"));
        setPrepTime(r.preparation_time?.toString() ?? "");
        setCost(r.cost?.toString() ?? "");
        if (r.difficulty === "easy" || r.difficulty === "medium" || r.difficulty === "hard") {
          setDifficulty(r.difficulty);
        }
        setTagsText((r.dietary_tags ?? []).join(", "));
      } catch (e: unknown) {
        setError(toErrorMessage(e, "Error"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const payload = useMemo(() => {
    const ingredientsArr = ingredientsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const stepsArr = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tagsArr = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      title,
      description,
      ingredients: ingredientsArr,
      preparation_steps: stepsArr,
      preparation_time: prepTime ? Number(prepTime) : null,
      cost: cost ? Number(cost) : null,
      difficulty,
      dietary_tags: tagsArr,
    };
  }, [title, description, ingredientsText, stepsText, prepTime, cost, difficulty, tagsText]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/recipes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to save");

      router.push("/recipes");
      router.refresh();
    } catch (e: unknown) {
      setError(toErrorMessage(e, "Error saving recipe"));
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteConfirmed() {
    try {
      setError(null);

      const res = await fetch("/api/recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to delete");

      router.push("/recipes");
      router.refresh();
    } catch (e: unknown) {
      setError(toErrorMessage(e, "Error deleting recipe"));
    } finally {
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="px-10 py-10">
        <p className="text-sm text-[#6b6450]">Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-10">
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-[#9a7a2e]/20 bg-[#f2edda] p-6 shadow-xl">
            <h2 className="font-serif text-2xl font-normal text-[#151e2d]">
              Delete recipe?
            </h2>
            <p className="mt-3 text-sm text-[#6b6450] leading-relaxed">
              “<span className="font-medium text-[#151e2d]">{title || "This recipe"}</span>”
              will be permanently deleted. Are you sure you want to do this?
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
                className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                onClick={onDeleteConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 max-w-3xl rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSave} className="max-w-3xl space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#151e2d]">
            Title
          </label>
          <input
            className="w-full rounded-md border border-[#9a7a2e]/20 bg-[#f2edda] px-4 py-3 text-sm text-[#151e2d] outline-none focus:border-[#9a7a2e]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#151e2d]">
            Description
          </label>
          <input
            className="w-full rounded-md border border-[#9a7a2e]/20 bg-[#f2edda] px-4 py-3 text-sm text-[#151e2d] outline-none focus:border-[#9a7a2e]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#151e2d]">
            Ingredients (one per line)
          </label>
          <textarea
            className="w-full min-h-[140px] rounded-md border border-[#9a7a2e]/20 bg-[#f2edda] px-4 py-3 text-sm text-[#151e2d] outline-none focus:border-[#9a7a2e]"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#151e2d]">
            Preparation steps (one per line)
          </label>
          <textarea
            className="w-full min-h-[160px] rounded-md border border-[#9a7a2e]/20 bg-[#f2edda] px-4 py-3 text-sm text-[#151e2d] outline-none focus:border-[#9a7a2e]"
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#151e2d]">
              Preparation time (minutes)
            </label>
            <input
              className="w-full rounded-md border border-[#9a7a2e]/20 bg-[#f2edda] px-4 py-3 text-sm text-[#151e2d] outline-none focus:border-[#9a7a2e]"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#151e2d]">
              Cost
            </label>
            <input
              className="w-full rounded-md border border-[#9a7a2e]/20 bg-[#f2edda] px-4 py-3 text-sm text-[#151e2d] outline-none focus:border-[#9a7a2e]"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              inputMode="decimal"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#151e2d]">
            Difficulty
          </label>
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#151e2d]">
            Dietary tags (comma-separated)
          </label>
          <input
            className="w-full rounded-md border border-[#9a7a2e]/20 bg-[#f2edda] px-4 py-3 text-sm text-[#151e2d] outline-none focus:border-[#9a7a2e]"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="vegan, gluten-free, halal..."
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity disabled:opacity-50"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            className="text-sm font-medium px-5 py-2.5 rounded-md border border-[#9a7a2e]/20 text-[#151e2d] hover:bg-[#ede6cf] transition-colors"
            type="button"
            onClick={() => router.push("/recipes")}
          >
            Cancel
          </button>

          <button
            className="text-sm font-medium px-5 py-2.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
            type="button"
            onClick={() => setConfirmOpen(true)}
          >
            Delete recipe
          </button>
        </div>
      </form>
    </div>
  );
}
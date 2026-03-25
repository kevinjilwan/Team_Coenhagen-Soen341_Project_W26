"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Recipe = {
  id: string;
  title?: string | null;
  description?: string | null;
  ingredients?: string[] | string | null;
  preparation_time?: number | string | null;
  preparation_steps?: string[] | string | null;
  cost?: number | null;
  dietary_tags?: string[] | null;
};

function normalizeStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    // supports text column: split lines
    return v.split("\n").map((s) => s.trim()).filter(Boolean);
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
      dietary_tags: tagsArr,
    };
  }, [title, description, ingredientsText, stepsText, prepTime, cost, tagsText]);

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

  if (loading) return <div className="p-4">Loading recipe...</div>;

  return (
    <div className="p-4 max-w-2xl">
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg border bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">Delete recipe?</h2>
            <p className="mt-2 text-sm text-gray-600">
              "<span className="font-medium font-bold">{title || "This recipe"}"</span> will be
              permanently deleted. Are you sure you want to do this?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="rounded border px-4 py-2 text-sm text-gray-900 hover:bg-gray-50"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                onClick={onDeleteConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Edit Recipe</h1>

      {error && (
        <div className="mb-3 rounded border p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSave} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            className="w-full mt-1 rounded border p-2 bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <input
            className="w-full mt-1 rounded border p-2 bg-transparent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ingredients (one per line)</label>
          <textarea
            className="w-full mt-1 min-h-[120px] rounded border p-2 bg-transparent"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Preparation steps (one per line)</label>
          <textarea
            className="w-full mt-1 min-h-[140px] rounded border p-2 bg-transparent"
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Preparation time (minutes)</label>
            <input
              className="w-full mt-1 rounded border p-2 bg-transparent"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cost</label>
            <input
              className="w-full mt-1 rounded border p-2 bg-transparent"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              inputMode="decimal"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Dietary tags (comma-separated)</label>
          <input
            className="w-full mt-1 rounded border p-2 bg-transparent"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="vegan, gluten-free, halal..."
          />
        </div>

        <div className="flex gap-2">
          <button
            className="rounded border px-4 py-2"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <button
            className="rounded border px-4 py-2"
            type="button"
            onClick={() => router.push("/recipes")}
          >
            Cancel
          </button>

          <button
            className="rounded border px-4 py-2"
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

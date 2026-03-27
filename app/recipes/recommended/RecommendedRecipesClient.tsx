"use client";

import { FormEvent, useState } from "react";
import SiteNavbar from "@/components/site-navbar";

type RecommendedRecipe = {
  id?: string;
  title?: string | null;
  description?: string | null;
  ingredients?: string[] | null;
  preparation_steps?: string[] | null;
  preparation_time?: number | null;
  cost?: number | null;
  difficulty?: "easy" | "medium" | "hard" | null;
  dietary_tags?: string[] | null;
};

type RecommendationResponse = {
  primary?: RecommendedRecipe[];
  related?: RecommendedRecipe[];
  error?: string;
};

const API_ENDPOINT = "/api/recommended";

function parseIngredients(value: string) {
  return value
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
}

export default function RecommendedRecipesClient() {
  const [ingredientsText, setIngredientsText] = useState("");
  const [availableTime, setAvailableTime] = useState("");
  const [primaryResults, setPrimaryResults] = useState<RecommendedRecipe[]>([]);
  const [relatedResults, setRelatedResults] = useState<RecommendedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    setError(null);

    const ingredients = parseIngredients(ingredientsText);
    const time = Number(availableTime);

    if (ingredients.length === 0) {
      setError("Enter at least one ingredient.");
      setPrimaryResults([]);
      setRelatedResults([]);
      return;
    }

    if (!availableTime || Number.isNaN(time) || time <= 0) {
      setError("Enter a valid available time in minutes.");
      setPrimaryResults([]);
      setRelatedResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ingredients,
          maxTime: time,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as RecommendationResponse;
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommended recipes.");
      }

      setPrimaryResults(data.primary ?? []);
      setRelatedResults(data.related ?? []);
      setSubmitted(true);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to fetch recommended recipes.";
      setPrimaryResults([]);
      setRelatedResults([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light";
  const labelClass = "text-xs font-medium tracking-wide uppercase text-[#6b6450]";

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">
      <SiteNavbar />

      <div className="pt-52 pb-20 px-10 max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-4">
            <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
            Recipe ideas
          </p>
          <h1 className="font-serif text-5xl font-normal tracking-tight text-[#151e2d]">
            Get Recommended Recipes
          </h1>
          <p className="text-sm text-[#6b6450] font-light mt-2 max-w-2xl">
            Enter the ingredients you already have and how much time you can spend.
            We&apos;ll send that to the recommendation API and show whatever it returns.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#9a7a2e]/20 bg-[#f7f2e4] p-6 md:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ingredients" className={labelClass}>
                Available ingredients
              </label>
              <textarea
                id="ingredients"
                className={`${inputClass} min-h-[140px] resize-y`}
                value={ingredientsText}
                onChange={(event) => setIngredientsText(event.target.value)}
                placeholder="rice, eggs, spinach, garlic"
              />
              <p className="text-xs text-[#6b6450]/80">
                Separate ingredients with commas.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="available-time" className={labelClass}>
                Available time
              </label>
              <input
                id="available-time"
                type="number"
                min="1"
                className={inputClass}
                value={availableTime}
                onChange={(event) => setAvailableTime(event.target.value)}
                placeholder="30"
              />
              <p className="text-xs text-[#6b6450]/80">Enter the time in minutes.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {loading ? "Finding recipes..." : "Get recommendations"}
              </button>
            </div>
          </div>
        </form>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-2">
                <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
                Results
              </p>
              <h2 className="font-serif text-3xl font-normal tracking-tight text-[#151e2d]">
                Recommended Recipes
              </h2>
            </div>
            {submitted && !error && (
              <p className="text-sm text-[#6b6450]">
                {primaryResults.length + relatedResults.length} recipe
                {primaryResults.length + relatedResults.length === 1 ? "" : "s"} returned
              </p>
            )}
          </div>

          {!submitted && !loading && !error && (
            <div className="rounded-2xl border border-dashed border-[#9a7a2e]/30 px-6 py-10 text-sm text-[#6b6450]">
              Submit the form to see recommendations from the API here.
            </div>
          )}

          {submitted && primaryResults.length === 0 && relatedResults.length === 0 && !error && (
            <div className="rounded-2xl border border-[#9a7a2e]/20 px-6 py-10 text-sm text-[#6b6450] bg-[#f7f2e4]">
              No recipes were returned for that ingredient and time combination.
            </div>
          )}

          {(primaryResults.length > 0 || relatedResults.length > 0) && (
            <div className="grid gap-8">
              {primaryResults.length > 0 && (
                <div>
                  <h3 className="font-serif text-2xl text-[#151e2d] mb-3">Best matches</h3>
                  <ul className="grid gap-4">
                    {primaryResults.map((recipe, index) => (
                      <RecipeCard
                        key={recipe.id ?? `${recipe.title ?? "primary"}-${index}`}
                        recipe={recipe}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {relatedResults.length > 0 && (
                <div>
                  <h3 className="font-serif text-2xl text-[#151e2d] mb-3">Related ideas</h3>
                  <ul className="grid gap-4">
                    {relatedResults.map((recipe, index) => (
                      <RecipeCard
                        key={recipe.id ?? `${recipe.title ?? "related"}-${index}`}
                        recipe={recipe}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
        <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
        <p className="text-xs text-[#6b6450]">Made for students who actually want to eat well.</p>
      </footer>
    </main>
  );
}

function RecipeCard({ recipe }: { recipe: RecommendedRecipe }) {
  return (
    <li className="rounded-2xl border border-[#9a7a2e]/20 bg-[#f7f2e4] px-6 py-5">
      <h4 className="font-serif text-2xl text-[#151e2d]">
        {recipe.title ?? "Untitled recipe"}
      </h4>

      {recipe.description && (
        <p className="mt-2 text-sm text-[#6b6450] leading-relaxed">
          {recipe.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6b6450]">
        {recipe.preparation_time != null && <span>{recipe.preparation_time} min</span>}
        {recipe.difficulty && <span className="capitalize">{recipe.difficulty}</span>}
        {recipe.cost != null && <span>${recipe.cost.toFixed(2)}</span>}
      </div>

      {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.dietary_tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full border border-[#9a7a2e]/30 text-[#9a7a2e]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-wide uppercase text-[#6b6450] mb-2">
            Ingredients
          </p>
          <p className="text-sm text-[#6b6450] leading-relaxed">
            {recipe.ingredients.join(", ")}
          </p>
        </div>
      )}

      {recipe.preparation_steps && recipe.preparation_steps.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-wide uppercase text-[#6b6450] mb-2">
            Steps
          </p>
          <ol className="grid gap-2 text-sm text-[#6b6450] leading-relaxed">
            {recipe.preparation_steps.map((step, index) => (
              <li key={`${recipe.title ?? "step"}-${index}`}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
}

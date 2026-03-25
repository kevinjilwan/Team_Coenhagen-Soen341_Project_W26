"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Difficulty = "easy" | "medium" | "hard";

function lines(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CreateRecipeClient() {
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

    setMsg("Recipe created!");
    setTitle("");
    setDescription("");
    setPrepTime("");
    setCookTime("");
    setDifficulty("easy");
    setCost("");
    setIngredientsText("");
    setStepsText("");
    setSaving(false);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Recipe</h1>
        <p className="text-sm text-muted-foreground">
          Add ingredients, steps, time, cost, and difficulty.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipe details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="prep">Prep time (minutes)</Label>
              <Input id="prep" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cook">Cook time (minutes)</Label>
              <Input id="cook" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cost">Estimated cost</Label>
              <Input id="cost" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ingredients">Ingredients (one per line)</Label>
            <textarea
              id="ingredients"
              className="min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="steps">Steps (one per line)</Label>
            <textarea
              id="steps"
              className="min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm"
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onCreate} disabled={saving}>
              {saving ? "Creating..." : "Create recipe"}
            </Button>
            {msg && <p className="text-sm">{msg}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export type RecommendedRecipe = {
  title: string;
  description: string;
  ingredients: string[];
  preparation_steps: string[];
  preparation_time: number;
  cost: number;
  difficulty: "easy" | "medium" | "hard";
  dietary_tags: string[];
};

export type RecommendationsResponse = {
  primary: RecommendedRecipe[];
  related: RecommendedRecipe[];
};

const SYSTEM_PROMPT = `You are a professional chef and recipe assistant.
When given a list of available ingredients and a maximum preparation time, return a JSON object
with exactly two arrays: "primary" and "related".

"primary" — 3 recipes that can be made using ONLY the provided ingredients plus basic pantry
staples (salt, pepper, oil, butter, common spices). These should require no grocery run.

"related" — 2 recipes that are inspired by or pair well with the provided ingredients but
intentionally expand beyond them, requiring a few additional ingredients the user may not have.
These can exceed the stated preparation time slightly and should offer more variety in cuisine
or technique.

Vary style, cuisine, and difficulty across all 5 recipes.

You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanation.
The object must have exactly two keys: "primary" and "related", each an array of recipes.
Each recipe must have exactly these fields:
- title: string
- description: string (1–2 sentences)
- ingredients: string[] (each item is a quantity + ingredient, e.g. "2 cloves garlic")
- preparation_steps: string[] (clear, numbered-style steps as plain strings)
- preparation_time: number (total minutes, integer)
- cost: number (estimated cost in USD, e.g. 8.50)
- difficulty: "easy" | "medium" | "hard"
- dietary_tags: string[] (e.g. ["vegetarian", "gluten-free"] — empty array if none apply)`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ingredients: string[] = body.ingredients ?? [];
  const maxTime: number | null = body.maxTime ?? null;

  if (!ingredients.length) {
    return NextResponse.json(
      { error: "At least one ingredient is required." },
      { status: 400 }
    );
  }

  if (maxTime == null || isNaN(maxTime) || maxTime <= 0) {
    return NextResponse.json(
      { error: "A valid preparation time (in minutes) is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });

  const userMessage = `Available ingredients: ${ingredients.join(", ")}\nMaximum preparation time: ${maxTime} minutes\n\nReturn the primary and related recipe lists.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let parsed: RecommendationsResponse;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse recommendations from AI." },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed?.primary) || !Array.isArray(parsed?.related)) {
      return NextResponse.json(
        { error: "Unexpected response format from AI." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { primary: parsed.primary, related: parsed.related },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

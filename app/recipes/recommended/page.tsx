import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecommendedRecipesClient from "./RecommendedRecipesClient";

export default async function RecommendedRecipesPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/auth/login");
  }

  return <RecommendedRecipesClient />;
}

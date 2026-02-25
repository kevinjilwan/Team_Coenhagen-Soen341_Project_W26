import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateRecipeClient from "./CreateRecipeClient";

export default async function NewRecipePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/auth/login");

  return <CreateRecipeClient />;
}
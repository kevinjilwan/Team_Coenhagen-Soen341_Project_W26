"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProfileState = {
  full_name: string;
  phone: string;
};

type PreferencesState = {
  allergies: string[];
  diet_focus: "balanced" | "protein" | "carbs" | "fats";
  lactose_intolerant: boolean;
};

// You can change this list anytime
const ALLERGY_OPTIONS = [
  "nuts",
  "peanuts",
  "tree nuts",
  "dairy",
  "eggs",
  "gluten",
  "soy",
  "fish",
  "shellfish",
  "sesame",
] as const;

export default function AccountClient(props: {
  userId: string;
  initialProfile: ProfileState;
  initialPreferences: PreferencesState;
}) {
  const supabase = useMemo(() => createClient(), []);

  // Form state
  const [fullName, setFullName] = useState(props.initialProfile.full_name);
  const [phone, setPhone] = useState(props.initialProfile.phone);

  const [allergies, setAllergies] = useState<string[]>(
    props.initialPreferences.allergies ?? [],
  );
  const [dietFocus, setDietFocus] = useState<PreferencesState["diet_focus"]>(
    props.initialPreferences.diet_focus ?? "balanced",
  );
  const [lactoseIntolerant, setLactoseIntolerant] = useState(
    props.initialPreferences.lactose_intolerant ?? false,
  );

  // UI state
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [prefsMsg, setPrefsMsg] = useState<string | null>(null);

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  };

  const allergiesLabel =
    allergies.length === 0 ? "Select allergies" : allergies.join(", ");

  const saveInfo = async () => {
    setSavingInfo(true);
    setInfoMsg(null);

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: props.userId,
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
      { onConflict: "user_id" },
    );

    if (error) setInfoMsg(error.message);
    else setInfoMsg("Saved!");

    setSavingInfo(false);
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    setPrefsMsg(null);

    const { error } = await supabase.from("preferences").upsert(
      {
        user_id: props.userId,
        allergies,
        diet_focus: dietFocus,
        lactose_intolerant: lactoseIntolerant,
      },
      { onConflict: "user_id" },
    );

    if (error) setPrefsMsg(error.message);
    else setPrefsMsg("Saved!");

    setSavingPrefs(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pt-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          <p className="text-sm text-muted-foreground">
            Manage your info and meal preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Kevin Jilwan"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 514-555-1234"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={saveInfo} disabled={savingInfo}>
                {savingInfo ? "Saving..." : "Save"}
              </Button>
              {infoMsg && (
                <p className="text-sm text-muted-foreground">{infoMsg}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Preferences */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Allergies multi-select */}
            <div className="grid gap-2">
              <Label>Allergies</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    <span className="truncate">{allergiesLabel}</span>
                    <span className="ml-3 text-muted-foreground">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  {ALLERGY_OPTIONS.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt}
                      checked={allergies.includes(opt)}
                      onCheckedChange={() => toggleAllergy(opt)}
                    >
                      {opt}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Diet focus */}
            <div className="grid gap-2">
              <Label>Diet focus</Label>
              <div className="flex flex-wrap gap-2">
                {(["balanced", "protein", "carbs", "fats"] as const).map(
                  (opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant={dietFocus === opt ? "default" : "outline"}
                      onClick={() => setDietFocus(opt)}
                    >
                      {opt}
                    </Button>
                  ),
                )}
              </div>
            </div>

            {/* Lactose */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="lactose"
                checked={lactoseIntolerant}
                onCheckedChange={(v) => setLactoseIntolerant(Boolean(v))}
              />
              <Label htmlFor="lactose">Lactose intolerant</Label>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={savePreferences} disabled={savingPrefs}>
                {savingPrefs ? "Saving..." : "Save"}
              </Button>
              {prefsMsg && (
                <p className="text-sm text-muted-foreground">{prefsMsg}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

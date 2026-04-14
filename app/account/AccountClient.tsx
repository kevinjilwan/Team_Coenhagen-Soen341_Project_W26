"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import SiteNavbar from "@/components/site-navbar";

type ProfileState = {
  full_name: string;
  phone: string;
};

type PreferencesState = {
  allergies: string[];
  diet_focus: "balanced" | "protein" | "carbs" | "fats";
  lactose_intolerant: boolean;
};

const ALLERGY_OPTIONS = [
  "nuts", "peanuts", "tree nuts", "dairy", "eggs",
  "gluten", "soy", "fish", "shellfish", "sesame",
] as const;

export default function AccountClient(props: {
  userId: string;
  initialProfile: ProfileState;
  initialPreferences: PreferencesState;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [fullName, setFullName] = useState(props.initialProfile.full_name);
  const [phone, setPhone] = useState(props.initialProfile.phone);
  const [allergies, setAllergies] = useState<string[]>(props.initialPreferences.allergies ?? []);
  const [dietFocus, setDietFocus] = useState<PreferencesState["diet_focus"]>(props.initialPreferences.diet_focus ?? "balanced");
  const [lactoseIntolerant, setLactoseIntolerant] = useState(props.initialPreferences.lactose_intolerant ?? false);
  const [allergiesOpen, setAllergiesOpen] = useState(false);

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [prefsMsg, setPrefsMsg] = useState<string | null>(null);

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const saveInfo = async () => {
    setSavingInfo(true);
    setInfoMsg(null);
    const { error } = await supabase.from("profiles").upsert(
      { user_id: props.userId, full_name: fullName.trim(), phone: phone.trim() },
      { onConflict: "user_id" }
    );
    setInfoMsg(error ? error.message : "Saved!");
    setSavingInfo(false);
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    setPrefsMsg(null);
    const { error } = await supabase.from("preferences").upsert(
      { user_id: props.userId, allergies, diet_focus: dietFocus, lactose_intolerant: lactoseIntolerant },
      { onConflict: "user_id" }
    );
    setPrefsMsg(error ? error.message : "Saved!");
    setSavingPrefs(false);
  };

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">

      <SiteNavbar/>

      {/* PAGE CONTENT */}
      <div className="pt-52 pb-20 px-10">

        {/* Header */}
        <div className="mb-10">
          <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-4">
            <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
            Your profile
          </p>
          <h1 className="font-serif text-5xl font-normal tracking-tight text-[#151e2d]">Account</h1>
          <p className="text-sm text-[#6b6450] font-light mt-2">Manage your info and meal preferences.</p>
        </div>

        <hr className="border-[#9a7a2e]/20 mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#9a7a2e]/20 rounded-lg overflow-hidden">

          {/* My Info */}
          <div className="p-9 md:border-r border-[#9a7a2e]/20">
            <p className="font-serif text-xl text-[#151e2d] mb-6">My Info</p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="full-name" className="text-xs font-medium tracking-wide uppercase text-[#6b6450]">Full name</label>
                <input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Kevin Jilwan"
                  className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium tracking-wide uppercase text-[#6b6450]">Phone number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 514-555-1234"
                  className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-[#151e2d] placeholder:text-[#6b6450]/50 focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light"
                />
              </div>

              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={saveInfo}
                  disabled={savingInfo}
                  className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {savingInfo ? "Saving..." : "Save"}
                </button>
                {infoMsg && <p className="text-xs text-[#9a7a2e]">{infoMsg}</p>}
              </div>
            </div>
          </div>

          {/* My Preferences */}
          <div className="p-9">
            <p className="font-serif text-xl text-[#151e2d] mb-6">My Preferences</p>

            <div className="flex flex-col gap-5">

              {/* Allergies */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium tracking-wide uppercase text-[#6b6450]">Allergies</label>
                <div className="relative">
                  <button
                    onClick={() => setAllergiesOpen(!allergiesOpen)}
                    className="w-full px-4 py-2.5 rounded-md bg-[#ede7d0] border border-[#9a7a2e]/20 text-sm text-left text-[#151e2d] focus:outline-none focus:border-[#9a7a2e]/60 transition-colors font-light flex items-center justify-between"
                  >
                    <span className={allergies.length === 0 ? "text-[#6b6450]/50" : ""}>
                      {allergies.length === 0 ? "Select allergies" : allergies.join(", ")}
                    </span>
                    <svg className="w-3.5 h-3.5 text-[#6b6450]" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {allergiesOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#f2edda] border border-[#9a7a2e]/20 rounded-md shadow-lg py-2 z-10">
                      {ALLERGY_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => toggleAllergy(opt)}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#151e2d] hover:text-[#9a7a2e] transition-colors text-left"
                        >
                          <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${allergies.includes(opt) ? "bg-[#151e2d] border-[#151e2d]" : "border-[#9a7a2e]/40"}`}>
                            {allergies.includes(opt) && (
                              <svg className="w-2.5 h-2.5 text-[#f2edda]" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Diet focus */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium tracking-wide uppercase text-[#6b6450]">Diet focus</label>
                <div className="flex flex-wrap gap-2">
                  {(["balanced", "protein", "carbs", "fats"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setDietFocus(opt)}
                      className={`text-xs px-4 py-2 rounded-md border transition-colors font-normal capitalize ${
                        dietFocus === opt
                          ? "bg-[#151e2d] text-[#f2edda] border-[#151e2d]"
                          : "bg-transparent text-[#6b6450] border-[#9a7a2e]/30 hover:border-[#9a7a2e]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lactose */}
              <div className="flex items-center gap-3">
                <button
                  id="lactose-intolerant"
                  onClick={() => setLactoseIntolerant(!lactoseIntolerant)}
                  aria-pressed={lactoseIntolerant}
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    lactoseIntolerant ? "bg-[#151e2d] border-[#151e2d]" : "border-[#9a7a2e]/40 bg-[#ede7d0]"
                  }`}
                >
                  {lactoseIntolerant && (
                    <svg className="w-2.5 h-2.5 text-[#f2edda]" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <label
                  htmlFor="lactose-intolerant"
                  aria-pressed={lactoseIntolerant}
                  onClick={() => setLactoseIntolerant(!lactoseIntolerant)}
                  className="text-sm text-[#151e2d] cursor-pointer font-light"
                >
                  Lactose intolerant
                </label>
              </div>

              <div className="flex items-center gap-4 mt-1">
                <button
                  onClick={savePreferences}
                  disabled={savingPrefs}
                  className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {savingPrefs ? "Saving..." : "Save"}
                </button>
                {prefsMsg && <p className="text-xs text-[#9a7a2e]">{prefsMsg}</p>}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
        <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
        <p className="text-xs text-[#6b6450]">Made for students who actually want to eat well.</p>
      </footer>

    </main>
  );
}

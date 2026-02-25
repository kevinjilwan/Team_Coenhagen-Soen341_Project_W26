"use client";

import { useState } from "react";
import SidePanel from "@/components/ui/side-panel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {open && <SidePanel onClose={() => setOpen(false)} />}

      <div className="flex-1">
        {!open && (
          <div className="p-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-md border px-3 py-2 hover:bg-amber-200/60"
            >
              ☰
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
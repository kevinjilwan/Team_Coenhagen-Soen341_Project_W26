'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SiteNavbar from "@/components/site-navbar";

export default function HomePage() {
  const [recipesOpen, setRecipesOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f2edda] text-[#151e2d] antialiased font-light">

      <SiteNavbar/>

      {/* HERO */}
      <section className="pt-64 pb-20 px-10 max-w-3xl ml-[1050px]">
        <p className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#9a7a2e] mb-6">
          <span className="inline-block w-5 h-px bg-[#9a7a2e]" />
          Meal planning for students
        </p>
        <h1 className="font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-normal leading-[1.06] tracking-tight text-[#151e2d] mb-5">
          Eat well.<br />
          <em className="italic text-[#9a7a2e]">Every week.</em>
        </h1>
        <p className="text-base text-[#6b6450] leading-relaxed max-w-md mb-9 font-light">
          Meal Major helps you plan your meals, manage recipes, and stay on track without the stress of figuring out what to eat every day.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/auth/sign-up" className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#151e2d] text-[#f2edda] hover:opacity-80 transition-opacity">
            Get  started
          </Link>
          <Link href="/auth/login" className="text-sm text-[#6b6450] hover:text-[#151e2d] transition-colors flex items-center gap-1">
            Log in
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* DIVIDER */}
      <hr className="mx-10 border-[#9a7a2e]/20" />

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 mx-10 border-b border-[#9a7a2e]/20">
        {[
          { icon: "🗓", title: "Weekly meal plans",    desc: "Assign meals to each day of the week. No more last-minute decisions." },
          { icon: "📋", title: "Recipe manager",       desc: "Save and organize your favorite recipes in one place." },
          { icon: "⚙️", title: "Dietary preferences", desc: "Track restrictions and avoid repeating the same meals." },
        ].map((f, i) => (
          <div
            key={i}
            className={[
              "py-9",
              i !== 2 ? "md:border-r border-[#9a7a2e]/20 pr-9" : "",
              i !== 0 ? "md:pl-9" : "",
              i !== 2 ? "max-md:border-b border-[#9a7a2e]/20" : "",
            ].join(" ")}
          >
            <span className="text-base mb-3 block">{f.icon}</span>
            <p className="font-serif text-lg text-[#151e2d] mb-1">{f.title}</p>
            <p className="text-sm text-[#6b6450] leading-relaxed font-light">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA BANNER */}
      <div className="mx-10 my-12 px-12 py-10 bg-[#151e2d] rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#f2edda] mb-1">Start planning today.</h2>
          <p className="text-sm text-[#f2edda]/50">Free for students. No credit card required.</p>
        </div>
        <Link href="/auth/sign-up" className="text-sm font-medium px-5 py-2.5 rounded-md bg-[#f2edda] text-[#151e2d] hover:opacity-85 transition-opacity whitespace-nowrap">
          Get started →
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="mx-10 py-5 border-t border-[#9a7a2e]/20 flex items-center justify-between">
        <p className="text-xs text-[#6b6450]">© 2026 Meal Major</p>
        <p className="text-xs text-[#6b6450]">Made for students who actually want to eat well.</p>
      </footer>

    </main>
  );
}
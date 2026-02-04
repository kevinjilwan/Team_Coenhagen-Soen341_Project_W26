import { Reenie_Beanie } from "next/font/google";
import Link from "next/link";

const handwriting = Reenie_Beanie({
  subsets: ["latin"],
  weight: "400",
});


export default function SidePanel() {
  return (
    <aside className={`${handwriting.className} w-[360px] shrink-0 border-r border-stone-300 px-4 py-6`}>
        <div className="mb-8 flex items-center gap-2">
        <span className="text-3xl font-semibold text-stone-900">Meal Major</span>
        </div>

        <nav className="space-y-8 text-3xl text-stone-950">
        <Link href="/" className="block rounded px-3 py-2 hover:bg-amber-200/60">
            Home
        </Link>
        <Link href="/account" className="block rounded px-3 py-2 hover:bg-amber-200/60">
            Account
        </Link>
        <Link href="/settings" className="block rounded px-3 py-2 hover:bg-amber-200/60">
            Settings
        </Link>
        </nav>
    </aside>
  );
}
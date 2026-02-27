import Link from "next/link";
import Image from "next/image";
import { Marcellus  } from "next/font/google";

const font = Marcellus({ subsets: ["latin"], weight: "400" });

function Logo() {
  return(
  <Link href="/">
    <Image src="/logo.png" alt="Meal Major Logo" width={200} height={200} />
  </Link>
  );
}

function HeaderText(){
  return (
    <Link href="/" className={`text-7xl font-semibold text-center italic ${font.className} text-gray-900`} >
      Meal Major
    </Link>
  );
}

function GetStartedButton() {
  return (
  <Link href="/auth/sign-up" className=" text-xl font-medium px-4 py-1.5 rounded-full
    text-white bg-[#e0d5c5]">
    Get started
  </Link>
  );
}

export default function HomePage() {
  return (
      
      <header className="grid grid-cols-3 items-center px-6 py-0 border-b border-stone-300">
        <div className="justify-self-start px-10">
          <Logo />
        </div>

        <div className="justify-self-center text-center">
          <HeaderText />
        </div>

        <div className="justify-self-end px-40">
          <GetStartedButton />
        </div>
      </header>
  );
}
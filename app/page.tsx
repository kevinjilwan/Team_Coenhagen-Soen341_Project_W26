import Link from "next/link";
import { Indie_Flower  } from "next/font/google";

const font = Indie_Flower({ subsets: ["latin"], weight: "400" });


function WelcomeText(){
  return (
    <p className={`text-6xl text-gray-900 ${font.className}`}>
      Welcome to Meal Major
    </p>
    );
  }

function SubWelcomeText(){
  return (
  <p className={`text-2xl text-gray-900 ${font.className}`} >
    MealMajor helps students plan meals and stay organized by managing recipes and creating a personalized <br />
    weekly meal plan. Easily track dietary preferences, assign meals to each day, and avoid repetition.
  </p>
  );
}


function LoginButton() {
  return (
  <Link href="/auth/login" className="text-sm font-medium px-4 py-1.5 rounded-full
    text-white bg-[#e0d5c5]">
    Login
  </Link>
  );
}

export default function HomePage() {
  return (
      <section className="grid place-items-center text-center gap-10 mt-12">
        <WelcomeText />
        <SubWelcomeText />
        <LoginButton />
      </section>
  );
}




import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "CareNest · Portal",
  description: "Family health in one place",
};

export default function PortalPage() {
  return (
    <div className="relative min-h-[calc(100vh-5.5rem)] overflow-hidden">
      <Image
        src="/carenest-portal-family.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 z-10 flex items-end justify-center px-4 pb-8 sm:pb-10">
        <Link
          href="/"
          className="inline-flex min-w-[12rem] items-center justify-center rounded-xl bg-nest-magenta px-12 py-4 text-base font-semibold tracking-wide text-white shadow-[0_14px_36px_rgba(55,65,81,0.5)] ring-2 ring-white ring-offset-2 ring-offset-nest-peach transition hover:bg-nest-magentadark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nest-gold"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

import { SignOutButton } from "./sign-out-button";

export function PartnerNav() {
  return (
    <nav className="flex items-center gap-5 text-sm">
      <Link
        href="/partner/dashboard"
        className="text-gray-500 hover:text-black transition"
      >
        Dashboard
      </Link>
      <Link
        href="/partner/profile"
        className="text-gray-500 hover:text-black transition"
      >
        Profile
      </Link>
      <SignOutButton />
    </nav>
  );
}

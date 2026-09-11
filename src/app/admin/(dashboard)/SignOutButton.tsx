"use client";

import { signOut } from "../actions";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M9 6V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Sign out
    </button>
  );
}

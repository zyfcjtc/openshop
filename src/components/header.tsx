"use client";

import Link from "next/link";

type Props = {
  storeName: string;
  logoUrl: string | null;
};

export function Header({ storeName, logoUrl }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName}
              className="h-10 w-auto"
            />
          ) : null}
          <span className="text-lg font-bold text-gray-900">{storeName}</span>
        </Link>
      </div>
    </header>
  );
}

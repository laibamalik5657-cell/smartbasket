"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 6h18l-2 13H5L3 6z" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Smart Basket
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-brand"
                    : "text-foreground hover:text-brand"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            aria-label="Favourites"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-brand-light hover:text-brand"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          <button
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-brand-light hover:text-brand"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
              2
            </span>
          </button>

          <Link
            href="/login"
            className="ml-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Sign Up
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-surface md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-brand-light text-brand"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
              <button
                aria-label="Favourites"
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Favourites (3)
              </button>
              <button
                aria-label="Cart"
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Cart (2)
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm font-medium text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-brand px-3 py-2 text-center text-sm font-medium text-white"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

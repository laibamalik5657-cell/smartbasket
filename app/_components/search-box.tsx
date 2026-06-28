"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import apiClient from "@/lib/axios";

interface SearchResult {
  slug: string;
  name: string;
  image: string;
  price: number;
}

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // Debounce + blur timers. Fetching happens in event handlers (not an effect)
  // so this stays clear of the repo's `set-state-in-effect` lint rule.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blur = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    setQuery(value);
    if (debounce.current) clearTimeout(debounce.current);

    const term = value.trim();
    if (!term) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounce.current = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(
          `/products?q=${encodeURIComponent(term)}`,
        );
        setResults((data.products ?? []).slice(0, 6));
        setActive(-1);
        setOpen(true);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 250);
  }

  function goTo(slug: string) {
    setOpen(false);
    router.push(`/product/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = active >= 0 ? results[active] : results[0];
      if (pick) goTo(pick.slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      className="relative max-w-md"
      onFocus={() => {
        if (blur.current) clearTimeout(blur.current);
        if (results.length > 0) setOpen(true);
      }}
      onBlur={() => {
        // Delay close so a click on a result registers first.
        blur.current = setTimeout(() => setOpen(false), 120);
      }}
    >
      <div className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-border focus-within:ring-brand">
        <span className="pl-3 text-muted-foreground">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for fruits, snacks, drinks…"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={() => {
            const pick = results[active >= 0 ? active : 0];
            if (pick) goTo(pick.slug);
          }}
          className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Search
        </button>
      </div>

      {open && results.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-white py-1 text-left shadow-lg"
        >
          {results.map((p, i) => (
            <li key={p.slug} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => goTo(p.slug)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                  i === active ? "bg-brand-light" : "hover:bg-surface"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-9 w-9 rounded-md object-cover"
                />
                <span className="flex-1 text-foreground">{p.name}</span>
                <span className="text-muted-foreground">Rs. {p.price}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

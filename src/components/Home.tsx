"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ListSummary } from "@/data";
import { CATEGORIES, CATEGORY_LABEL, type Category } from "@/data/types";
import { loadResults, type Result } from "@/lib/storage";

type Filter = "all" | Category;

export function Home({ lists }: { lists: ListSummary[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [results, setResults] = useState<Record<string, Result>>({});

  useEffect(() => {
    setResults(loadResults());
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? lists : lists.filter((l) => l.category === filter)),
    [filter, lists],
  );

  const done = lists.filter((l) => results[l.id]).length;
  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = {};
    for (const l of lists) c[l.category] = (c[l.category] ?? 0) + 1;
    return c;
  }, [lists]);

  function random() {
    const pool = visible.filter((l) => !results[l.id]);
    const from = pool.length ? pool : visible;
    const pick = from[Math.floor(Math.random() * from.length)];
    if (pick) router.push(`/jeu/${pick.id}`);
  }

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-24">
      <header className="pt-10 sm:pt-16 pb-8 sm:pb-12 border-b border-line">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="serif text-[3.25rem] sm:text-[4.5rem] leading-[0.95]">
              Top <em>10</em>
            </h1>
            <p className="mt-4 max-w-md text-ink-2 text-[15px] leading-relaxed">
              Les chiffres sont là. À vous de retrouver les dix noms. Des classements
              récents, sourcés, à jouer à voix haute entre amis.
            </p>
          </div>
          <div className="hidden sm:block text-right num text-sm text-muted leading-6">
            <div>{lists.length} classements</div>
            <div>{done} terminé{done > 1 ? "s" : ""}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={random}
            className="inline-flex items-center gap-2 rounded-full bg-ink text-paper px-5 py-2.5 text-[15px] font-medium hover:bg-ink-2 transition-colors"
          >
            Jouer au hasard
            <span aria-hidden className="num">→</span>
          </button>
          <span className="sm:hidden num text-sm text-muted">
            {lists.length} classements · {done} terminé{done > 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <nav
        aria-label="Catégories"
        className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-paper/95 backdrop-blur-sm"
      >
        <ul className="flex gap-2 overflow-x-auto no-scrollbar">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            Tout <Count n={lists.length} />
          </Chip>
          {CATEGORIES.filter((c) => counts[c.key]).map((c) => (
            <Chip key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)}>
              {c.label} <Count n={counts[c.key] ?? 0} />
            </Chip>
          ))}
        </ul>
      </nav>

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
        {visible.map((l) => {
          const r = results[l.id];
          return (
            <li key={l.id} className="bg-paper">
              <Link
                href={`/jeu/${l.id}`}
                className="group flex h-full flex-col justify-between gap-6 p-5 sm:p-6 hover:bg-paper-2 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-muted">
                    <span>{CATEGORY_LABEL[l.category]}</span>
                    <span className="num">{l.year}</span>
                  </div>
                  <h2 className="serif mt-3 text-[1.6rem] leading-[1.1] text-ink group-hover:text-accent-ink transition-colors">
                    {l.title}
                  </h2>
                  <p className="mt-2 text-[13px] text-ink-2 leading-snug">{l.measure}</p>
                </div>
                <div className="flex items-center justify-between text-[12px] text-muted">
                  <span className="truncate pr-3">{l.source}</span>
                  {r ? (
                    <span
                      className={`num shrink-0 rounded-full px-2 py-0.5 border ${
                        r.found === 10
                          ? "border-ok text-ok"
                          : "border-line-2 text-ink-2"
                      }`}
                    >
                      {r.found}/10
                    </span>
                  ) : (
                    <span className="num shrink-0 text-line-2">—</span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="mt-16 text-[13px] text-muted leading-relaxed max-w-xl">
        Chaque classement indique sa source et l'année des données. Les valeurs
        sont celles publiées par l'organisme cité ; les classements « instantanés »
        (fortunes, streams, capitalisations) datent du jour indiqué.
      </footer>
    </main>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li className="shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
          active
            ? "border-ink bg-ink text-paper"
            : "border-line-2 text-ink-2 hover:border-ink"
        }`}
      >
        {children}
      </button>
    </li>
  );
}

function Count({ n }: { n: number }) {
  return <span className="num opacity-60 text-[11px]">{n}</span>;
}

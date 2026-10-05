"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ListSummary } from "@/data";
import { CATEGORIES, CATEGORY_LABEL, type Category } from "@/data/types";
import { useResults } from "@/lib/storage";

type Filter = "all" | Category;

export function Home({ lists }: { lists: ListSummary[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const results = useResults();

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
      <header className="pt-12 sm:pt-20 pb-8">
        <h1 className="display text-[3.5rem] sm:text-[5rem]">Top 10</h1>
        <p className="mt-4 max-w-md text-ink-2 text-[15px] sm:text-base leading-relaxed">
          Les chiffres sont là. À vous de retrouver les dix noms. Des classements
          récents, sourcés, à jouer à voix haute entre amis.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={random}
            className="inline-flex items-center gap-2 rounded-full bg-ink text-white px-5 py-3 text-[15px] font-medium hover:bg-ink-2 transition-colors"
          >
            Jouer au hasard
            <span aria-hidden>→</span>
          </button>
          <span className="num text-[13px] text-muted">
            {lists.length} classements · {done} terminé{done > 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <nav
        aria-label="Catégories"
        className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-bg/90 backdrop-blur"
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

      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((l) => {
          const r = results[l.id];
          return (
            <li key={l.id}>
              <Link
                href={`/jeu/${l.id}`}
                className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-card p-5 hover:border-ink-2 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[12px] text-muted">
                    <span className="font-medium">{CATEGORY_LABEL[l.category]}</span>
                    <span className="num">{l.year}</span>
                  </div>
                  <h2 className="mt-3 text-[19px] font-semibold tracking-[-0.02em] leading-[1.2] text-ink">
                    {l.title}
                  </h2>
                  <p className="mt-1.5 text-[13px] text-muted leading-snug">{l.measure}</p>
                </div>
                <div className="flex items-center justify-between text-[12px] text-muted">
                  <span className="truncate pr-3">{l.source}</span>
                  {r ? (
                    <span
                      className={`num shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        r.found === 10 ? "bg-ok/10 text-ok" : "bg-bg text-ink-2"
                      }`}
                    >
                      {r.found}/10
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="mt-16 text-[13px] text-muted leading-relaxed max-w-xl">
        Chaque classement indique sa source et l&apos;année des données. Les valeurs
        sont celles publiées par l&apos;organisme cité ; les classements « instantanés »
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
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
          active ? "bg-ink text-white" : "bg-card border border-line text-ink-2 hover:border-ink-2"
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

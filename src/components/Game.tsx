"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TopItem, TopList } from "@/data/types";
import { CATEGORY_LABEL } from "@/data/types";
import { formatValue } from "@/lib/format";
import { findMatch } from "@/lib/match";
import { saveResult } from "@/lib/storage";

type Feedback = { kind: "wrong" | "dup"; text: string; key: number } | null;

function firstLetter(name: string): string {
  const m = name.match(/[\p{L}\p{N}]/u);
  return m ? m[0].toUpperCase() : name[0];
}

export function Game({ list, otherIds }: { list: TopList; otherIds: string[] }) {
  const router = useRouter();
  const [found, setFound] = useState<Map<string, string>>(() => new Map());
  // 0 = rien, 1 = indice vague, 2 = indice + première lettre
  const [hints, setHints] = useState<Map<string, number>>(() => new Map());
  const [gaveUp, setGaveUp] = useState(false);
  const [wrong, setWrong] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [lastFound, setLastFound] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const done = gaveUp || found.size === list.items.length;
  const remaining = useMemo(
    () => list.items.filter((it) => !found.has(it.name)),
    [list.items, found],
  );
  const rankOnly = list.items.every((it) => it.value === null);
  const hintCount = useMemo(() => [...hints.values()].reduce((a, b) => a + b, 0), [hints]);

  useEffect(() => {
    if (!done) return;
    saveResult(list.id, { found: found.size, hints: hintCount, gaveUp, at: Date.now() });
  }, [done, found.size, hintCount, gaveUp, list.id]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 1600);
    return () => clearTimeout(t);
  }, [feedback]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const guess = value.trim();
    if (!guess || done) return;
    const hit = findMatch(guess, remaining);
    if (hit) {
      setFound((prev) => new Map(prev).set(hit.item.name, hit.as));
      setLastFound(hit.item.name);
      setFeedback(null);
      setValue("");
      return;
    }
    const already = findMatch(guess, list.items.filter((it) => found.has(it.name)));
    if (already) {
      setFeedback({ kind: "dup", text: `${already.as} est déjà trouvé`, key: Date.now() });
    } else {
      setWrong((w) => w + 1);
      setFeedback({ kind: "wrong", text: "Non, pas dans le classement", key: Date.now() });
    }
    setValue("");
    inputRef.current?.focus();
  }

  function hint(it: TopItem) {
    if (done) return;
    setHints((prev) => {
      const level = prev.get(it.name) ?? 0;
      const max = it.hint ? 2 : 1;
      if (level >= max) return prev;
      // Sans indice rédigé, le premier niveau donne directement la lettre.
      return new Map(prev).set(it.name, it.hint ? level + 1 : 2);
    });
    inputRef.current?.focus();
  }

  function replay() {
    setFound(new Map());
    setHints(new Map());
    setGaveUp(false);
    setWrong(0);
    setValue("");
    setFeedback(null);
    setLastFound(null);
  }

  function next() {
    const pick = otherIds[Math.floor(Math.random() * otherIds.length)];
    if (pick) router.push(`/jeu/${pick}`);
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pb-40">
      <header className="pt-6 sm:pt-10">
        <div className="flex items-center justify-between text-[13px]">
          <Link href="/" className="text-muted hover:text-ink transition-colors">
            ← Tous les classements
          </Link>
          <span className="font-medium text-muted">{CATEGORY_LABEL[list.category]}</span>
        </div>
        <h1 className="display mt-6 text-[2rem] sm:text-[2.75rem] leading-[1.05]">{list.title}</h1>
        <p className="mt-3 text-[15px] text-ink-2">
          {list.measure} <span className="text-muted">·</span>{" "}
          <span className="num">{list.year}</span>
        </p>
      </header>

      <section className="mt-6 rounded-2xl border border-line bg-card overflow-hidden">
        <div className="flex items-baseline justify-between px-4 sm:px-5 py-3 border-b border-line bg-bg/60">
          <span className="num text-[13px] text-ink-2">
            <span className="font-semibold text-ink">{found.size}</span>
            <span className="text-muted">/{list.items.length}</span>
          </span>
          <span className="num text-[13px] text-muted">{rankOnly ? "ordre officiel" : list.unit}</span>
        </div>

        <ol className="divide-y divide-line">
          {list.items.map((it) => {
            const isFound = found.has(it.name);
            const show = isFound || gaveUp;
            const level = hints.get(it.name) ?? 0;
            const exhausted = level >= (it.hint ? 2 : 1);
            return (
              <li
                key={it.name}
                className={`grid ${rankOnly ? "grid-cols-[1.75rem_1fr]" : "grid-cols-[1.75rem_1fr_auto]"} items-center gap-3 px-4 sm:px-5 py-3.5 ${
                  lastFound === it.name ? "flash" : ""
                }`}
              >
                <span className="num text-[13px] text-muted">{String(it.rank).padStart(2, "0")}</span>

                {show ? (
                  <div className="reveal min-w-0">
                    <span
                      className={`block truncate text-[16px] ${
                        isFound ? "text-ink font-semibold" : "text-muted"
                      }`}
                    >
                      {found.get(it.name) ?? it.name}
                    </span>
                    {(it.note || it.ties?.length) && (
                      <span className="block truncate text-[12px] text-muted">
                        {it.note}
                        {it.note && it.ties?.length ? " · " : ""}
                        {it.ties?.length
                          ? `ex æquo : ${[it.name, ...it.ties]
                              .filter((n) => n !== (found.get(it.name) ?? it.name))
                              .join(", ")}`
                          : ""}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      {level === 0 ? (
                        <span className="slot block w-3/4 max-w-56" />
                      ) : (
                        <div className="reveal text-[13px] leading-snug">
                          {it.hint && <span className="block text-ink-2">{it.hint}</span>}
                          {level >= 2 && (
                            <span className="block text-muted">
                              Commence par{" "}
                              <span className="num font-semibold text-ink">{firstLetter(it.name)}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {!exhausted && (
                      <button
                        type="button"
                        onClick={() => hint(it)}
                        className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-muted hover:border-ink-2 hover:text-ink transition-colors"
                      >
                        {level === 0 ? "Indice" : "Lettre"}
                      </button>
                    )}
                  </div>
                )}

                {!rankOnly && (
                  <span className="num text-[15px] font-medium text-right whitespace-nowrap">
                    {formatValue(it.value, list.precision)}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-5 px-1 text-[13px] text-muted leading-relaxed">
        <p>
          Source :{" "}
          {list.source.url ? (
            <a
              href={list.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-line-2 hover:text-ink transition-colors"
            >
              {list.source.name}
            </a>
          ) : (
            list.source.name
          )}
          {" · "}
          données {list.year}.
        </p>
        {done ? (
          list.notes && <p className="mt-1">{list.notes}</p>
        ) : (
          <p className="mt-1">Les précisions sur les données apparaissent en fin de partie.</p>
        )}
      </section>

      {/* Barre de saisie / résultat */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-card/95 backdrop-blur border-t border-line">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {done ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="display text-[1.75rem]">
                  {found.size}
                  <span className="text-muted font-medium"> / {list.items.length}</span>
                </div>
                <div className="mt-1 num text-[12px] text-muted">
                  {hintCount} indice{hintCount > 1 ? "s" : ""} · {wrong} erreur{wrong > 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={replay}
                  className="rounded-full border border-line-2 px-4 py-2.5 text-[14px] font-medium text-ink-2 hover:border-ink transition-colors"
                >
                  Rejouer
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="rounded-full bg-ink text-white px-4 py-2.5 text-[14px] font-medium hover:bg-ink-2 transition-colors"
                >
                  Un autre →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="flex items-center gap-2">
              <div
                key={feedback?.key ?? 0}
                className={`relative flex-1 ${feedback?.kind === "wrong" ? "shake" : ""}`}
              >
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Votre réponse…"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  aria-label="Votre réponse"
                  className={`w-full rounded-full border bg-bg px-5 py-3 text-[16px] outline-none transition-colors focus:border-ink focus:bg-card ${
                    feedback?.kind === "wrong" ? "border-bad" : "border-line"
                  }`}
                />
                {feedback && (
                  <span
                    role="status"
                    className={`pointer-events-none absolute -top-7 left-4 text-[12px] font-medium ${
                      feedback.kind === "wrong" ? "text-bad" : "text-muted"
                    }`}
                  >
                    {feedback.text}
                  </span>
                )}
              </div>
              <button
                type="submit"
                aria-label="Valider"
                className="shrink-0 size-12 rounded-full bg-ink text-white text-lg hover:bg-ink-2 transition-colors"
              >
                ↵
              </button>
              <button
                type="button"
                onClick={() => setGaveUp(true)}
                className="shrink-0 text-[13px] font-medium text-muted hover:text-ink transition-colors px-1"
              >
                Révéler
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

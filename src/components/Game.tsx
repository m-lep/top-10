"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TopItem, TopList } from "@/data/types";
import { CATEGORY_LABEL } from "@/data/types";
import { formatValue } from "@/lib/format";
import { findMatch, hintShape } from "@/lib/match";
import { saveResult } from "@/lib/storage";

type Feedback = { kind: "wrong" | "dup" | "ok"; text: string; key: number } | null;

export function Game({ list, otherIds }: { list: TopList; otherIds: string[] }) {
  const router = useRouter();
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [hints, setHints] = useState<Set<string>>(() => new Set());
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

  useEffect(() => {
    if (!done) return;
    saveResult(list.id, { found: found.size, hints: hints.size, gaveUp, at: Date.now() });
  }, [done, found.size, hints.size, gaveUp, list.id]);

  useEffect(() => {
    if (!feedback || feedback.kind === "ok") return;
    const t = setTimeout(() => setFeedback(null), 1600);
    return () => clearTimeout(t);
  }, [feedback]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const guess = value.trim();
    if (!guess || done) return;
    const hit = findMatch(guess, remaining);
    if (hit) {
      setFound((prev) => new Set(prev).add(hit.name));
      setLastFound(hit.name);
      setFeedback(null);
      setValue("");
      return;
    }
    const already = findMatch(guess, list.items.filter((it) => found.has(it.name)));
    if (already) {
      setFeedback({ kind: "dup", text: `${already.name} est déjà trouvé`, key: Date.now() });
    } else {
      setWrong((w) => w + 1);
      setFeedback({ kind: "wrong", text: "Non, pas dans le classement", key: Date.now() });
    }
    setValue("");
    inputRef.current?.focus();
  }

  function hint(it: TopItem) {
    if (done) return;
    setHints((prev) => new Set(prev).add(it.name));
    inputRef.current?.focus();
  }

  function replay() {
    setFound(new Set());
    setHints(new Set());
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
          <Link href="/" className="text-ink-2 hover:text-ink transition-colors">
            ← Tous les classements
          </Link>
          <span className="uppercase tracking-[0.12em] text-[11px] text-muted">
            {CATEGORY_LABEL[list.category]}
          </span>
        </div>
        <h1 className="serif mt-6 text-[2.25rem] sm:text-[3rem] leading-[1.02]">{list.title}</h1>
        <p className="mt-3 text-[15px] text-ink-2">
          {list.measure} <span className="text-muted">·</span>{" "}
          <span className="num">{list.year}</span>
        </p>
      </header>

      <div className="mt-8 flex items-baseline justify-between border-b border-ink pb-2">
        <span className="num text-sm text-muted">
          {found.size}
          <span className="opacity-60">/{list.items.length}</span> trouvés
        </span>
        <span className="num text-sm text-muted">{list.unit}</span>
      </div>

      <ol className="divide-y divide-line">
        {list.items.map((it) => {
          const isFound = found.has(it.name);
          const show = isFound || gaveUp;
          const hinted = hints.has(it.name);
          return (
            <li
              key={it.name}
              className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-3.5 ${
                lastFound === it.name ? "flash" : ""
              }`}
            >
              <span className="num text-sm text-muted">{String(it.rank).padStart(2, "0")}</span>

              {show ? (
                <div className="reveal min-w-0">
                  <span
                    className={`block truncate text-[17px] ${
                      isFound ? "text-ink font-medium" : "text-muted"
                    }`}
                  >
                    {it.name}
                  </span>
                  {it.note && <span className="block text-[12px] text-muted">{it.note}</span>}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => hint(it)}
                  aria-label={hinted ? "Indice affiché" : "Afficher un indice"}
                  className="group flex items-center gap-3 min-w-0 h-7 text-left"
                >
                  {hinted ? (
                    <span className="num text-[14px] text-ink-2 tracking-wide truncate">
                      {hintShape(it.name)}
                    </span>
                  ) : (
                    <>
                      <span className="slot block h-5 flex-1" />
                      <span className="num text-[11px] text-muted opacity-50 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                        indice
                      </span>
                    </>
                  )}
                </button>
              )}

              <span className="num text-[15px] sm:text-base text-right whitespace-nowrap">
                {formatValue(it.value, list.precision)}
              </span>
            </li>
          );
        })}
      </ol>

      <section className="mt-8 text-[13px] text-muted leading-relaxed">
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
        {list.notes && <p className="mt-1">{list.notes}</p>}
      </section>

      {/* Barre de saisie / résultat */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-paper/95 backdrop-blur-sm border-t border-line">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {done ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="serif text-[1.75rem] leading-none">
                  {found.size}
                  <span className="text-muted"> / {list.items.length}</span>
                </div>
                <div className="mt-1 num text-[12px] text-muted">
                  {hints.size} indice{hints.size > 1 ? "s" : ""} · {wrong} erreur{wrong > 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={replay}
                  className="rounded-full border border-line-2 px-4 py-2 text-[14px] text-ink-2 hover:border-ink transition-colors"
                >
                  Rejouer
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="rounded-full bg-ink text-paper px-4 py-2 text-[14px] font-medium hover:bg-ink-2 transition-colors"
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
                  className={`w-full rounded-full border bg-paper px-5 py-3 text-[16px] outline-none transition-colors focus:border-ink ${
                    feedback?.kind === "wrong" ? "border-accent" : "border-line-2"
                  }`}
                />
                {feedback && (
                  <span
                    role="status"
                    className={`pointer-events-none absolute -top-7 left-4 text-[12px] ${
                      feedback.kind === "wrong" ? "text-accent-ink" : "text-muted"
                    }`}
                  >
                    {feedback.text}
                  </span>
                )}
              </div>
              <button
                type="submit"
                aria-label="Valider"
                className="num shrink-0 size-12 rounded-full bg-ink text-paper text-lg hover:bg-ink-2 transition-colors"
              >
                ↵
              </button>
              <button
                type="button"
                onClick={() => setGaveUp(true)}
                className="shrink-0 text-[13px] text-muted hover:text-ink transition-colors px-1"
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

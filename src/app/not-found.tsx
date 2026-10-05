import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="serif text-4xl">Ce classement n'existe pas.</p>
      <Link href="/" className="underline underline-offset-4 text-ink-2">
        Retour aux classements
      </Link>
    </main>
  );
}

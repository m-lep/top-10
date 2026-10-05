import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LISTS, getList } from "@/data";
import { Game } from "@/components/Game";

export function generateStaticParams() {
  return LISTS.map((l) => ({ id: l.id }));
}

export async function generateMetadata(props: PageProps<"/jeu/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const list = getList(id);
  if (!list) return {};
  return {
    title: list.title,
    description: `${list.measure} · ${list.year} · Source : ${list.source.name}. Retrouvez les dix noms.`,
  };
}

export default async function Page(props: PageProps<"/jeu/[id]">) {
  const { id } = await props.params;
  const list = getList(id);
  if (!list) notFound();
  const others = LISTS.filter((l) => l.id !== list.id).map((l) => l.id);
  return <Game list={list} otherIds={others} />;
}

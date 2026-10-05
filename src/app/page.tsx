import { summaries } from "@/data";
import { Home } from "@/components/Home";

export default function Page() {
  return <Home lists={summaries()} />;
}

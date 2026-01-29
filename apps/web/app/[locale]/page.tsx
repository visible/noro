import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Landing } from "./landing";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return <Landing session={session} />;
}

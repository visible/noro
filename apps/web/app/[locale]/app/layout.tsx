import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Sidebar } from "./sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const user = await getUser();

	if (!user) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen bg-stone-950 text-white flex">
			<Sidebar user={user} />
			<main className="flex-1 p-8">{children}</main>
		</div>
	);
}

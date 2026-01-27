import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen bg-stone-950 text-white flex">
			<Suspense fallback={<div className="w-64 border-r border-white/10" />}>
				<Sidebar user={session.user} />
			</Suspense>
			<main className="flex-1 p-8">{children}</main>
		</div>
	);
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar, SidebarProvider, MobileHeader } from "@/components/sidebar";
import { CommandWrapper } from "@/components/commandwrapper";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<SidebarProvider>
			<div className="min-h-screen bg-stone-950 text-white flex">
				<Suspense fallback={<div className="hidden md:block w-64 border-r border-white/10" />}>
					<Sidebar user={session.user} />
				</Suspense>
				<div className="flex-1 flex flex-col min-w-0">
					<MobileHeader />
					<main className="flex-1 p-4 md:p-8 pt-[72px] md:pt-8 overflow-x-hidden">{children}</main>
				</div>
			</div>
			<CommandWrapper />
		</SidebarProvider>
	);
}

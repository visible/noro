import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar, SidebarProvider, MobileHeader, MainContent } from "@/components/sidebar";
import { CommandWrapper } from "@/components/wrapper";
import { ToastProvider, Toaster } from "@/components/ui/toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<ToastProvider>
			<SidebarProvider>
				<div className="h-screen bg-[#0a0a0a] text-white overflow-hidden">
					<Suspense fallback={<div className="hidden md:block w-56 shrink-0 border-r border-white/5 fixed h-full" />}>
						<Sidebar user={session.user} />
					</Suspense>
					<MainContent>
						<MobileHeader />
						<main className="flex-1 pt-[56px] md:pt-0 overflow-hidden">{children}</main>
					</MainContent>
				</div>
				<CommandWrapper />
			</SidebarProvider>
			<Toaster />
		</ToastProvider>
	);
}

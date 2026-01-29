import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar, SidebarProvider, MobileHeader } from "@/components/sidebar";
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
				<div className="h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
					<Suspense fallback={<div className="hidden md:block w-56 shrink-0 border-r border-white/5" />}>
						<Sidebar user={session.user} />
					</Suspense>
					<div className="flex-1 flex flex-col min-w-0 h-screen">
						<MobileHeader />
						<main className="flex-1 pt-[56px] md:pt-0 overflow-hidden">{children}</main>
					</div>
				</div>
				<CommandWrapper />
			</SidebarProvider>
			<Toaster />
		</ToastProvider>
	);
}

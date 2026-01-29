"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { GoogleButton } from "@/components/google";
import { AuthPanel } from "@/components/authpanel";
import { signIn, useSession } from "@/lib/client";

export default function Login() {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isPending && session) {
			router.replace("/vault");
		}
	}, [session, isPending, router]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await signIn.email({ email, password });

			if (result.error) {
				setError(result.error.message || "login failed");
				return;
			}

			router.push("/vault");
		} catch {
			setError("something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-dvh bg-[#0a0a0a] text-[#ededed] antialiased selection:bg-[#d4b08c] selection:text-black font-sans flex">
			<div className="w-full lg:w-[40%] min-h-dvh flex flex-col relative">
				<main className="flex relative z-10 flex-1 justify-center items-center px-8 py-12 lg:px-16">
					<div className="w-full max-w-[340px]">
						<Link
							href="/"
							className="flex gap-2 items-center mb-16 group"
						>
							<div className="text-[#ededed] group-hover:text-[#d4b08c] transition-colors duration-300">
								<Logo />
							</div>
							<span className="font-serif italic text-lg tracking-wide text-[#ededed]">noro</span>
						</Link>

						<div className="mb-10">
							<h1 className="text-2xl font-serif text-[#ededed] mb-2">
								Welcome back
							</h1>
							<p className="text-sm text-white/50">
								Don&apos;t have an account?{" "}
								<Link
									href="/register"
									className="text-[#d4b08c] hover:text-[#e5c9a8] transition-colors"
								>
									Get started →
								</Link>
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label htmlFor="email" className="block mb-2 text-xs font-medium text-white/40 uppercase tracking-wider">
									Email
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
									className="w-full px-4 py-3.5 bg-white/3 border border-white/10 rounded-lg text-[#ededed] placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/50 focus:bg-white/5 transition-all duration-200"
									required
								/>
							</div>

							<div>
								<label htmlFor="password" className="block mb-2 text-xs font-medium text-white/40 uppercase tracking-wider">
									Password
								</label>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-4 py-3.5 bg-white/3 border border-white/10 rounded-lg text-[#ededed] placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/50 focus:bg-white/5 transition-all duration-200"
									required
								/>
							</div>

							{error && (
								<div className="px-4 py-3 rounded-lg border bg-red-500/10 border-red-500/20">
									<p className="text-sm text-red-400">{error}</p>
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="w-full py-3.5 bg-[#ededed] text-[#0a0a0a] font-medium rounded-lg hover:bg-[#d4b08c] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Signing in..." : "Continue"}
							</button>
						</form>

						<div className="flex gap-4 items-center my-8">
							<div className="flex-1 h-px bg-white/10" />
							<span className="text-xs uppercase text-white/30 tracking-wider">or</span>
							<div className="flex-1 h-px bg-white/10" />
						</div>

						<GoogleButton />

						<p className="mt-8 text-xs leading-relaxed text-white/40">
							By signing in, you agree to our{" "}
							<Link href="/terms" className="text-white/60 hover:text-[#d4b08c] transition-colors">Terms of Service</Link>
							{" "}and{" "}
							<Link href="/privacy" className="text-white/60 hover:text-[#d4b08c] transition-colors">Privacy Policy</Link>.
						</p>
					</div>
				</main>
			</div>

			<AuthPanel
				title="Welcome back"
				subtitle="Your secrets are encrypted client-side before transmission. We never see your data."
			/>
		</div>
	);
}

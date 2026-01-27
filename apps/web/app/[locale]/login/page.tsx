"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { signIn } from "@/lib/client";

const BackgroundBeams = dynamic(
	() => import("@/components/background-beams").then((mod) => mod.BackgroundBeams),
	{ ssr: false },
);

export default function Login() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

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

			router.push("/app");
		} catch {
			setError("something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-dvh bg-black text-white flex selection:bg-[#FF6B00] selection:text-black">
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative">
				<div className="max-w-sm w-full mx-auto lg:mx-0">
					<h1 className="text-4xl font-bold mb-2 tracking-tight">welcome back</h1>
					<p className="text-white/60 mb-8">sign in to your vault</p>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm text-white/60 mb-2">email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00] transition-colors"
								required
							/>
						</div>

						<div>
							<label className="block text-sm text-white/60 mb-2">password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00] transition-colors"
								required
							/>
						</div>

						{error && <p className="text-red-500 text-sm">{error}</p>}

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors disabled:opacity-50"
						>
							{loading ? "signing in..." : "sign in"}
						</button>
					</form>

					<p className="mt-6 text-white/40 text-sm">
						don&apos;t have an account?{" "}
						<Link href="/register" className="text-[#FF6B00] hover:underline">
							create one
						</Link>
					</p>
				</div>
			</div>

			<div className="hidden lg:flex lg:w-1/2 relative">
				<div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 flex flex-col items-center gap-3 z-10">
					<div className="w-3 h-3 rounded-full bg-[#FF6B00]" />
					<div className="flex-1 w-px bg-gradient-to-b from-[#FF6B00] via-[#FF6B00]/50 to-transparent" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #FF6B00 0px, #FF6B00 8px, transparent 8px, transparent 16px)" }} />
					<div className="w-2 h-2 rounded-full bg-[#FF6B00]/60" />
					<div className="flex-1 w-px" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 8px, #FF6B00 8px, #FF6B00 16px)" }} />
					<div className="w-3 h-3 rounded-full bg-[#FF6B00]" />
				</div>
				<BackgroundBeams className="absolute inset-0">
					<div />
				</BackgroundBeams>
			</div>

			<Link
				href="/"
				className="fixed bottom-0 right-0 p-8 z-50 hover:opacity-60 transition-opacity"
			>
				<Logo />
			</Link>
		</div>
	);
}

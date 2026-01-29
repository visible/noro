"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { GoogleButton } from "@/components/google";
import { AuthPanel } from "@/components/authpanel";
import { signUp } from "@/lib/client";

export default function Register() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await signUp.email({
				email,
				password,
				name: name || email.split("@")[0],
			});

			if (result.error) {
				setError(result.error.message || "registration failed");
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
				<main className="relative z-10 flex-1 flex items-center justify-center px-8 lg:px-16 py-12">
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
							<h1 className="font-serif text-2xl text-[#ededed] mb-2">
								Create your account
							</h1>
							<p className="text-white/50 text-sm">
								Already have an account?{" "}
								<Link
									href="/login"
									className="text-[#d4b08c] hover:text-[#e5c9a8] transition-colors"
								>
									Sign in →
								</Link>
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label htmlFor="name" className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
									Name <span className="text-white/20 normal-case">(optional)</span>
								</label>
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="John Doe"
									className="w-full px-4 py-3.5 bg-white/3 border border-white/10 rounded-lg text-[#ededed] placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/50 focus:bg-white/5 transition-all duration-200"
								/>
							</div>

							<div>
								<label htmlFor="email" className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
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
								<label htmlFor="password" className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
									Password
								</label>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Minimum 12 characters"
									className="w-full px-4 py-3.5 bg-white/3 border border-white/10 rounded-lg text-[#ededed] placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/50 focus:bg-white/5 transition-all duration-200"
									required
									minLength={12}
								/>
							</div>

							{error && (
								<div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
									<p className="text-red-400 text-sm">{error}</p>
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className="w-full py-3.5 bg-[#ededed] text-[#0a0a0a] font-medium rounded-lg hover:bg-[#d4b08c] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Creating account..." : "Create account"}
							</button>
						</form>

						<div className="flex items-center gap-4 my-8">
							<div className="flex-1 h-px bg-white/10" />
							<span className="text-xs text-white/30 uppercase tracking-wider">or</span>
							<div className="flex-1 h-px bg-white/10" />
						</div>

						<GoogleButton />

						<p className="mt-8 text-xs text-white/40 leading-relaxed">
							By continuing, you agree to our{" "}
							<Link href="/terms" className="text-white/60 hover:text-[#d4b08c] transition-colors">Terms</Link>
							{" "}and{" "}
							<Link href="/privacy" className="text-white/60 hover:text-[#d4b08c] transition-colors">Privacy Policy</Link>
						</p>
					</div>
				</main>
			</div>

			<AuthPanel
				title="Your vault awaits"
				subtitle="Store and share secrets with military-grade encryption. Everything is encrypted before it leaves your device."
			/>
		</div>
	);
}

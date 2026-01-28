"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { signIn } from "@/lib/client";

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

			router.push("/vault");
		} catch {
			setError("something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-dvh bg-[#0a0a0a] text-[#ededed] antialiased selection:bg-[#d4b08c] selection:text-black font-sans flex">
			{/* Left Side - Form */}
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

						<button
							type="button"
							className="w-full py-3.5 bg-white/3 border border-white/10 text-[#ededed] font-medium rounded-lg hover:bg-white/6 hover:border-white/15 transition-all duration-200 flex items-center justify-center gap-3"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
								<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
								<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
								<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
							</svg>
							Continue with Google
						</button>

						<p className="mt-8 text-xs leading-relaxed text-white/40">
							By signing in, you agree to our{" "}
							<Link href="/terms" className="text-white/60 hover:text-[#d4b08c] transition-colors">Terms of Service</Link>
							{" "}and{" "}
							<Link href="/privacy" className="text-white/60 hover:text-[#d4b08c] transition-colors">Privacy Policy</Link>.
						</p>
					</div>
				</main>
			</div>

			{/* Right Side - Visual */}
			<div className="hidden lg:flex w-[60%] min-h-dvh bg-[#0d0c0a] relative overflow-hidden items-center justify-center">
				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-linear-to-bl from-[#d4b08c]/2 via-transparent to-transparent" />
				
				{/* Grid pattern */}
				<div className="absolute inset-0 opacity-[0.03]" style={{
					backgroundImage: `
						linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
					`,
					backgroundSize: '60px 60px'
				}} />
				
				{/* Main content */}
				<div className="relative z-10 max-w-md px-12">
					{/* Animated dots visualization */}
					<div className="relative mb-16">
						<div className="flex justify-center gap-8 mb-8">
							{[0, 1, 2].map((i) => (
								<div key={i} className="relative">
									<div 
										className="w-3 h-3 rounded-full bg-[#d4b08c]/20 animate-pulse"
										style={{ animationDelay: `${i * 0.3}s` }}
									/>
									<div 
										className="absolute inset-0 w-3 h-3 rounded-full bg-[#d4b08c]/40 animate-ping"
										style={{ animationDelay: `${i * 0.3}s`, animationDuration: '2s' }}
									/>
								</div>
							))}
						</div>
						
						{/* Connection lines */}
						<div className="flex justify-center">
							<svg width="200" height="60" className="text-white/10" aria-hidden="true">
								<path d="M20 0 L20 30 L100 30 L100 60" fill="none" stroke="currentColor" strokeWidth="1" />
								<path d="M100 0 L100 60" fill="none" stroke="currentColor" strokeWidth="1" />
								<path d="M180 0 L180 30 L100 30" fill="none" stroke="currentColor" strokeWidth="1" />
							</svg>
						</div>
						
						{/* Central node */}
						<div className="flex justify-center -mt-1">
							<div className="w-4 h-4 rounded-full bg-[#d4b08c] shadow-[0_0_20px_rgba(212,176,140,0.4)]" />
						</div>
					</div>
					
					{/* Text content */}
					<div className="text-center">
						<h2 className="font-serif text-2xl text-[#ededed]/90 mb-4">
							Welcome back
						</h2>
						<p className="text-white/40 text-sm leading-relaxed mb-10">
							Your secrets are encrypted client-side before transmission. 
							We never see your data.
						</p>

						{/* Stats */}
						<div className="flex justify-center gap-12">
							{[
								{ value: "256-bit", label: "Encryption" },
								{ value: "Zero", label: "Knowledge" },
								{ value: "100%", label: "Private" },
							].map((stat) => (
								<div key={stat.label} className="text-center">
									<p className="text-lg font-medium text-[#d4b08c]">{stat.value}</p>
									<p className="text-[10px] uppercase tracking-wider text-white/30 mt-1">{stat.label}</p>
								</div>
							))}
						</div>
					</div>
				</div>

			</div>
		</div>
	);
}

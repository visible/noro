"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { signUp } from "@/lib/client";

const BackgroundBeams = dynamic(
	() => import("@/components/background-beams").then((mod) => mod.BackgroundBeams),
	{ ssr: false },
);

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

			router.push("/app");
		} catch {
			setError("something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-dvh bg-black text-white flex selection:bg-[#FF6B00] selection:text-black">
			<div className="w-full lg:w-2/5 flex flex-col justify-center px-8 md:px-16 lg:px-20 relative">
				<div className="max-w-md w-full mx-auto lg:mx-0">
					<h1 className="text-4xl font-bold mb-2 tracking-tight">get started</h1>
					<p className="text-white/50 mb-8">create your secure vault</p>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="block text-sm text-white/50 mb-2">name</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#FF6B00]/20 transition-all duration-200"
								placeholder="optional"
							/>
						</div>

						<div>
							<label className="block text-sm text-white/50 mb-2">email</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#FF6B00]/20 transition-all duration-200"
								required
							/>
						</div>

						<div>
							<label className="block text-sm text-white/50 mb-2">password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#FF6B00]/20 transition-all duration-200"
								required
								minLength={12}
							/>
							<p className="text-xs text-white/30 mt-2">minimum 12 characters</p>
						</div>

						{error && <p className="text-red-500 text-sm">{error}</p>}

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3.5 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF8533] active:bg-[#E65C00] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "creating account..." : "create account"}
						</button>
					</form>

					<p className="mt-8 text-white/40 text-sm">
						already have an account?{" "}
						<Link href="/login" className="text-[#FF6B00] hover:text-[#FF8533] transition-colors">
							sign in
						</Link>
					</p>
				</div>
			</div>

			<div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
				<div className="absolute left-0 top-[15%] bottom-[15%] w-[2px] bg-[#FF6B00] z-20" />
				<div className="absolute left-[-6px] top-[15%] bottom-[15%] w-4 bg-[#FF6B00]/20 blur-md z-10" />
				<div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/[0.03] via-transparent to-transparent" />
				<BackgroundBeams className="absolute inset-0">
					<div />
				</BackgroundBeams>
			</div>

			<Link
				href="/"
				className="fixed top-0 left-0 p-8 z-50 hover:opacity-60 transition-opacity"
			>
				<Logo />
			</Link>
		</div>
	);
}

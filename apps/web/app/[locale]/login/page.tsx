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

			router.push("/app");
		} catch {
			setError("something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4">
			<Link href="/" className="mb-12">
				<Logo />
			</Link>

			<div className="w-full max-w-sm">
				<h1 className="text-2xl font-bold mb-8 text-center">sign in</h1>

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

				<p className="mt-6 text-center text-white/40 text-sm">
					don&apos;t have an account?{" "}
					<Link href="/register" className="text-[#FF6B00] hover:underline">
						create one
					</Link>
				</p>
			</div>
		</div>
	);
}

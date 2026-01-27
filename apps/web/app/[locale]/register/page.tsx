"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
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
				<h1 className="text-2xl font-bold mb-8 text-center">create account</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm text-white/60 mb-2">name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00] transition-colors"
						/>
					</div>

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
							minLength={12}
						/>
						<p className="text-xs text-white/40 mt-1">minimum 12 characters</p>
					</div>

					{error && <p className="text-red-500 text-sm">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors disabled:opacity-50"
					>
						{loading ? "creating account..." : "create account"}
					</button>
				</form>

				<p className="mt-6 text-center text-white/40 text-sm">
					already have an account?{" "}
					<Link href="/login" className="text-[#FF6B00] hover:underline">
						sign in
					</Link>
				</p>
			</div>
		</div>
	);
}

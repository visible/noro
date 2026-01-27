"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

export default function Register() {
	const router = useRouter();
	const [step, setStep] = useState<"form" | "recovery">("form");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [secretKey, setSecretKey] = useState("");
	const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, name }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "registration failed");
				return;
			}

			setSecretKey(data.secretKey);
			setRecoveryCodes(data.recoveryCodes);
			setStep("recovery");
		} catch {
			setError("something went wrong");
		} finally {
			setLoading(false);
		}
	}

	if (step === "recovery") {
		return (
			<div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4">
				<div className="w-full max-w-md">
					<h1 className="text-2xl font-bold mb-4 text-center">save your recovery kit</h1>
					<p className="text-white/60 text-center mb-8">
						store this information securely. you&apos;ll need it to sign in on new devices.
					</p>

					<div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
						<h2 className="text-sm text-white/60 mb-2">secret key</h2>
						<p className="font-mono text-sm break-all bg-black/30 p-3 rounded">{secretKey}</p>
					</div>

					<div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
						<h2 className="text-sm text-white/60 mb-4">recovery codes</h2>
						<div className="grid grid-cols-2 gap-2">
							{recoveryCodes.map((code, i) => (
								<p key={code} className="font-mono text-xs bg-black/30 p-2 rounded">
									{i + 1}. {code}
								</p>
							))}
						</div>
					</div>

					<button
						onClick={() => router.push("/app")}
						className="w-full py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
					>
						i&apos;ve saved my recovery kit
					</button>

					<p className="mt-4 text-center text-white/40 text-xs">
						print this page or save it somewhere safe. do not email or screenshot.
					</p>
				</div>
			</div>
		);
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
							minLength={8}
						/>
						<p className="text-xs text-white/40 mt-1">minimum 8 characters</p>
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

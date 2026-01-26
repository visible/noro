import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Header, Section, Code, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "API",
	description: "programmatic access to noro for creating and managing secrets.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Api() {
	return (
		<article className="py-12">
			<Header
				section="API"
				title="Overview"
				description="programmatic access to noro for creating and managing secrets."
			/>

			<Section id="introduction" title="Introduction">
				<p className="text-black/60 mb-4 max-w-2xl">
					the noro API allows you to create and manage one-time secrets programmatically. integrate secret sharing into your applications, CI/CD pipelines, or automation workflows.
				</p>
				<p className="text-black/60 max-w-2xl">
					all API endpoints are versioned under <code className="text-[#C53D43]">/api/v1</code> and require authentication via bearer token.
				</p>
			</Section>

			<Section id="quickstart" title="Quickstart">
				<p className="text-black/60 mb-4 max-w-2xl">
					1. generate an API key:
				</p>
				<Code>{`curl -X POST https://noro.sh/api/v1/keys`}</Code>
				<p className="text-black/60 mt-6 mb-4 max-w-2xl">
					2. create a secret:
				</p>
				<Code>{`curl -X POST https://noro.sh/api/v1/secrets \\
  -H "Authorization: Bearer noro_..." \\
  -H "Content-Type: application/json" \\
  -d '{"data":"base64_encrypted_data"}'`}</Code>
				<p className="text-black/60 mt-6 mb-4 max-w-2xl">
					3. claim a secret:
				</p>
				<Code>{`curl https://noro.sh/api/v1/secrets/abc123 \\
  -H "Authorization: Bearer noro_..."`}</Code>
			</Section>

			<Section id="features" title="Features">
				<div className="space-y-4">
					<div>
						<h3 className="text-lg font-semibold mb-2 text-black">bearer token auth</h3>
						<p className="text-black/60 max-w-2xl">
							secure authentication using API keys with the <code className="text-[#C53D43]">noro_</code> prefix.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-2 text-black">webhooks</h3>
						<p className="text-black/60 max-w-2xl">
							receive notifications when secrets are created, viewed, or expire.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-2 text-black">rate limiting</h3>
						<p className="text-black/60 max-w-2xl">
							100 requests per minute per API key using sliding window.
						</p>
					</div>
				</div>
			</Section>

			<section className="mb-12">
				<h2 id="next-steps" className="text-3xl font-semibold mb-8 text-black">Next steps</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					<Link href="/docs/api/auth" className="block border border-black/10 rounded-xl p-6 hover:bg-black/5 transition-colors">
						<h3 className="font-semibold mb-2 text-black">Authentication</h3>
						<p className="text-sm text-black/50">generate and use API keys</p>
					</Link>
					<Link href="/docs/api/endpoints" className="block border border-black/10 rounded-xl p-6 hover:bg-black/5 transition-colors">
						<h3 className="font-semibold mb-2 text-black">Endpoints</h3>
						<p className="text-sm text-black/50">full API reference</p>
					</Link>
					<Link href="/docs/api/webhooks" className="block border border-black/10 rounded-xl p-6 hover:bg-black/5 transition-colors">
						<h3 className="font-semibold mb-2 text-black">Webhooks</h3>
						<p className="text-sm text-black/50">event notifications</p>
					</Link>
				</div>
			</section>

			<Prevnext />
		</article>
	);
}

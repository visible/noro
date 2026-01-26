import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Authentication",
	description: "how to authenticate with the noro API using bearer tokens.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Auth() {
	return (
		<article className="py-12">
			<Header
				section="API"
				title="Authentication"
				description="generate and use API keys to authenticate requests."
			/>

			<Section id="api-keys" title="API Keys">
				<p className="text-black/60 mb-4 max-w-2xl">
					API keys are used to authenticate all requests to the noro API. keys have the format:
				</p>
				<Code>noro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</Code>
				<p className="text-black/60 mt-4 max-w-2xl">
					the <code className="text-[#C53D43]">noro_</code> prefix followed by 32 alphanumeric characters.
				</p>
			</Section>

			<Section id="generate" title="Generate a key">
				<p className="text-black/60 mb-4 max-w-2xl">
					create a new API key by calling the keys endpoint:
				</p>
				<Code>{`curl -X POST https://noro.sh/api/v1/keys`}</Code>
				<p className="text-black/60 mt-4 mb-4 max-w-2xl">
					response:
				</p>
				<Code>{`{
  "key": "noro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}`}</Code>
				<p className="text-black/60 mt-4 max-w-2xl">
					optionally, include a webhook URL to receive notifications:
				</p>
				<Code className="mt-4">{`curl -X POST https://noro.sh/api/v1/keys \\
  -H "Content-Type: application/json" \\
  -d '{"webhook":"https://example.com/webhook"}'`}</Code>
			</Section>

			<Section id="usage" title="Using your key">
				<p className="text-black/60 mb-4 max-w-2xl">
					include your API key in the <code className="text-[#C53D43]">Authorization</code> header with the <code className="text-[#C53D43]">Bearer</code> scheme:
				</p>
				<Code>{`Authorization: Bearer noro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`}</Code>
				<p className="text-black/60 mt-4 mb-4 max-w-2xl">
					example request:
				</p>
				<Code>{`curl https://noro.sh/api/v1/secrets/abc123 \\
  -H "Authorization: Bearer noro_..."`}</Code>
			</Section>

			<Section id="security" title="Security">
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>store keys securely in environment variables</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>never commit keys to version control</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>rotate keys periodically</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>use separate keys for different environments</span>
					</li>
				</ul>
			</Section>

			<Section id="rate-limits" title="Rate limits">
				<p className="text-black/60 mb-4 max-w-2xl">
					API requests are rate limited to prevent abuse:
				</p>
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><strong className="text-black">100 requests per minute</strong> per API key</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>sliding window algorithm</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>returns <code className="text-[#C53D43]">429</code> when exceeded</span>
					</li>
				</ul>
			</Section>

			<Prevnext />
		</article>
	);
}

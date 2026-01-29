import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Authentication",
	description: "how to authenticate with the noro API using bearer tokens.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
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
				<p className="text-white/60 mb-4 max-w-2xl">
					API keys are used to authenticate all requests to the noro API. keys have the format:
				</p>
				<Code>noro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6</Code>
				<p className="text-white/60 mt-4 max-w-2xl">
					the <code className="text-[#d4b08c]">noro_</code> prefix followed by 32 alphanumeric characters.
				</p>
			</Section>

			<Section id="generate" title="Generate a key">
				<p className="text-white/60 mb-4 max-w-2xl">
					create a new API key by calling the keys endpoint:
				</p>
				<Code>{`curl -X POST https://noro.sh/api/v1/keys`}</Code>
				<p className="text-white/60 mt-4 mb-4 max-w-2xl">
					response:
				</p>
				<Code>{`{
  "key": "noro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expires": 1714000000000
}`}</Code>
				<p className="text-white/60 mt-4 max-w-2xl">
					optionally, include a webhook URL to receive notifications:
				</p>
				<Code className="mt-4">{`curl -X POST https://noro.sh/api/v1/keys \\
  -H "Content-Type: application/json" \\
  -d '{"webhook":"https://example.com/webhook"}'`}</Code>
			</Section>

			<Section id="expiration" title="Key expiration">
				<p className="text-white/60 mb-4 max-w-2xl">
					API keys expire after <strong className="text-[#ededed]">90 days</strong> by default. the <code className="text-[#d4b08c]">expires</code> field in the response is a unix timestamp in milliseconds.
				</p>
				<p className="text-white/60 mb-4 max-w-2xl">
					check your key&apos;s expiration date:
				</p>
				<Code>{`curl https://noro.sh/api/v1/keys \\
  -H "Authorization: Bearer noro_..."`}</Code>
				<p className="text-white/60 mt-4 max-w-2xl">
					generate a new key before expiration to avoid service interruption.
				</p>
			</Section>

			<Section id="revoke" title="Revoke a key">
				<p className="text-white/60 mb-4 max-w-2xl">
					delete your API key if it&apos;s compromised or no longer needed:
				</p>
				<Code>{`curl -X DELETE https://noro.sh/api/v1/keys \\
  -H "Authorization: Bearer noro_..."`}</Code>
			</Section>

			<Section id="update" title="Update webhook">
				<p className="text-white/60 mb-4 max-w-2xl">
					change or remove the webhook URL for your key:
				</p>
				<Code>{`curl -X PATCH https://noro.sh/api/v1/keys \\
  -H "Authorization: Bearer noro_..." \\
  -H "Content-Type: application/json" \\
  -d '{"webhook":"https://new-url.com/webhook"}'`}</Code>
				<p className="text-white/60 mt-4 max-w-2xl">
					set webhook to empty string to remove it.
				</p>
			</Section>

			<Section id="usage" title="Using your key">
				<p className="text-white/60 mb-4 max-w-2xl">
					include your API key in the <code className="text-[#d4b08c]">Authorization</code> header with the <code className="text-[#d4b08c]">Bearer</code> scheme:
				</p>
				<Code>{`Authorization: Bearer noro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`}</Code>
				<p className="text-white/60 mt-4 mb-4 max-w-2xl">
					example request:
				</p>
				<Code>{`curl https://noro.sh/api/v1/secrets/abc123 \\
  -H "Authorization: Bearer noro_..."`}</Code>
			</Section>

			<Section id="security" title="Security">
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>store keys securely in environment variables</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>never commit keys to version control</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>rotate keys periodically</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>use separate keys for different environments</span>
					</li>
				</ul>
			</Section>

			<Section id="rate-limits" title="Rate limits">
				<p className="text-white/60 mb-4 max-w-2xl">
					API requests are rate limited to prevent abuse:
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span><strong className="text-[#ededed]">100 requests per minute</strong> per API key</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>sliding window algorithm</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>returns <code className="text-[#d4b08c]">429</code> when exceeded</span>
					</li>
				</ul>
				<p className="text-white/60 mt-4 mb-4 max-w-2xl">
					responses include rate limit headers:
				</p>
				<Code>{`x-ratelimit-limit: 100
x-ratelimit-remaining: 99
x-ratelimit-reset: 1706000060000
x-request-id: req_abc123...`}</Code>
			</Section>

			<Prevnext />
		</article>
	);
}

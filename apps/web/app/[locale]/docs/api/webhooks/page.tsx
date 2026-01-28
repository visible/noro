import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Webhooks",
	description: "receive notifications when secrets are created, viewed, or expire.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

export default function Webhooks() {
	return (
		<article className="py-12">
			<Header
				section="API"
				title="Webhooks"
				description="receive real-time notifications for secret events."
			/>

			<Section id="setup" title="Setup">
				<p className="text-white/60 mb-4 max-w-2xl">
					configure a webhook URL when generating your API key:
				</p>
				<Code>{`curl -X POST https://noro.sh/api/v1/keys \\
  -H "Content-Type: application/json" \\
  -d '{"webhook":"https://example.com/webhook"}'`}</Code>
				<p className="text-white/60 mt-4 max-w-2xl">
					the webhook URL must use HTTPS.
				</p>
			</Section>

			<Section id="events" title="Events">
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold mb-2 text-[#ededed]">secret.created</h3>
						<p className="text-white/60 mb-2 max-w-2xl">
							fired when a new secret is stored.
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-2 text-[#ededed]">secret.viewed</h3>
						<p className="text-white/60 mb-2 max-w-2xl">
							fired when a secret is claimed (but views remain).
						</p>
					</div>
					<div>
						<h3 className="text-lg font-semibold mb-2 text-[#ededed]">secret.expired</h3>
						<p className="text-white/60 mb-2 max-w-2xl">
							fired when the last view is consumed and the secret is deleted.
						</p>
					</div>
				</div>
			</Section>

			<Section id="payload" title="Payload">
				<p className="text-white/60 mb-4 max-w-2xl">
					all webhook events include the same payload structure:
				</p>
				<Code>{`{
  "event": "secret.created",
  "timestamp": 1706000000000,
  "data": {
    "id": "abc123"
  }
}`}</Code>
			</Section>

			<Section id="headers" title="Headers">
				<p className="text-white/60 mb-4 max-w-2xl">
					webhook requests include a signature header for verification:
				</p>
				<Code>x-noro-signature: t=1706000000000,v1=5d41402abc4b...</Code>
				<p className="text-white/60 mt-4 max-w-2xl">
					the header contains a timestamp (<code className="text-[#d4b08c]">t</code>) and signature (<code className="text-[#d4b08c]">v1</code>). the signature is HMAC-SHA256 of <code className="text-[#d4b08c]">timestamp.body</code>.
				</p>
			</Section>

			<Section id="verification" title="Verification">
				<p className="text-white/60 mb-4 max-w-2xl">
					verify the signature and check timestamp to prevent replay attacks:
				</p>
				<Code>{`const crypto = require("crypto");

function verify(body, header, secret) {
  const [tPart, vPart] = header.split(",");
  const timestamp = tPart.split("=")[1];
  const signature = vPart.split("=")[1];


  const age = Date.now() - parseInt(timestamp);
  if (age > 300000) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + "." + body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}</Code>
			</Section>

			<Section id="delivery" title="Delivery">
				<p className="text-white/60 mb-4 max-w-2xl">
					webhooks are delivered via upstash qstash with automatic retries:
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>3 retry attempts on failure</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>exponential backoff between retries</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>10 second timeout per request</span>
					</li>
				</ul>
			</Section>

			<Section id="best-practices" title="Best practices">
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>always verify the signature</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>respond with 200 quickly, process async</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>handle duplicate deliveries idempotently</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>use a queue for processing</span>
					</li>
				</ul>
			</Section>

			<Prevnext />
		</article>
	);
}

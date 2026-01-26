import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Endpoints",
	description: "complete API reference for noro secret management.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Endpoints() {
	return (
		<article className="py-12">
			<Header
				section="API"
				title="Endpoints"
				description="complete reference for all API endpoints."
			/>

			<Section id="base-url" title="Base URL">
				<Code>https://noro.sh/api/v1</Code>
			</Section>

			<Section id="health" title="GET /health">
				<p className="text-black/60 mb-4 max-w-2xl">
					check API and database health status.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "status": "healthy",
  "redis": "connected",
  "latency": 42,
  "timestamp": 1706000000000
}`}</Code>
			</Section>

			<Section id="get-key" title="GET /keys">
				<p className="text-black/60 mb-4 max-w-2xl">
					get your API key info. requires authentication.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mb-2">request headers</h4>
				<Code>Authorization: Bearer noro_...</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "hint": "noro_****ab12",
  "webhook": "https://example.com/webhook",
  "created": 1706000000000,
  "expires": 1714000000000
}`}</Code>
			</Section>

			<Section id="create-key" title="POST /keys">
				<p className="text-black/60 mb-4 max-w-2xl">
					generate a new API key. keys expire after 90 days.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mb-2">request body</h4>
				<Code>{`{
  "webhook": "https://example.com/webhook"  // optional
}`}</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "key": "noro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expires": 1714000000000
}`}</Code>
			</Section>

			<Section id="update-key" title="PATCH /keys">
				<p className="text-black/60 mb-4 max-w-2xl">
					update your API key settings. requires authentication.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mb-2">request headers</h4>
				<Code>Authorization: Bearer noro_...</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">request body</h4>
				<Code>{`{
  "webhook": "https://new-url.com/webhook"  // set to "" to remove
}`}</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "updated": true
}`}</Code>
			</Section>

			<Section id="delete-key" title="DELETE /keys">
				<p className="text-black/60 mb-4 max-w-2xl">
					revoke your API key. requires authentication.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mb-2">request headers</h4>
				<Code>Authorization: Bearer noro_...</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "deleted": true
}`}</Code>
			</Section>

			<Section id="create-secret" title="POST /secrets">
				<p className="text-black/60 mb-4 max-w-2xl">
					create a new secret. requires authentication.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mb-2">request headers</h4>
				<Code>{`Authorization: Bearer noro_...
Content-Type: application/json`}</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">request body</h4>
				<Code>{`{
  "data": "base64_encrypted_data",  // required
  "ttl": "1d",                      // optional: 1h, 6h, 12h, 1d, 7d
  "type": "text",                   // optional: text, file
  "filename": "secret.txt",         // optional: for files
  "mimetype": "text/plain",         // optional: for files
  "views": 1                        // optional: 1-5
}`}</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "id": "abc123",
  "url": "https://noro.sh/abc123"
}`}</Code>
			</Section>

			<Section id="claim-secret" title="GET /secrets/:id">
				<p className="text-black/60 mb-4 max-w-2xl">
					claim a secret and retrieve its data. requires authentication.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mb-2">request headers</h4>
				<Code>Authorization: Bearer noro_...</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "data": "base64_encrypted_data",
  "type": "text",
  "filename": null,
  "mimetype": null,
  "remaining": 0
}`}</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">errors</h4>
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">404</code> secret not found or already claimed</span>
					</li>
				</ul>
			</Section>

			<Section id="revoke-secret" title="DELETE /secrets/:id">
				<p className="text-black/60 mb-4 max-w-2xl">
					revoke a secret before it&apos;s claimed. requires authentication.
				</p>
				<h4 className="text-sm font-semibold text-black/50 mb-2">request headers</h4>
				<Code>Authorization: Bearer noro_...</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">response</h4>
				<Code>{`{
  "deleted": true
}`}</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">errors</h4>
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">404</code> secret not found</span>
					</li>
				</ul>
			</Section>

			<Section id="errors" title="Error responses">
				<p className="text-black/60 mb-4 max-w-2xl">
					all errors return a JSON object with an <code className="text-[#C53D43]">error</code> field:
				</p>
				<Code>{`{
  "error": "error message"
}`}</Code>
				<h4 className="text-sm font-semibold text-black/50 mt-4 mb-2">status codes</h4>
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">400</code> bad request</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">401</code> unauthorized</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">404</code> not found</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">413</code> payload too large (5MB max)</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">429</code> rate limited</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span><code className="text-[#C53D43]">500</code> server error</span>
					</li>
				</ul>
			</Section>

			<Prevnext />
		</article>
	);
}

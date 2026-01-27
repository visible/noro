import { describe, test, expect, beforeEach, mock } from "bun:test";

const store = new Map<string, { value: string; ttl?: number }>();

mock.module("@/lib/redis", () => ({
	redis: {
		get: async (key: string) => store.get(key)?.value ?? null,
		set: async (key: string, value: string, opts?: { ex?: number; keepTtl?: boolean }) => {
			store.set(key, { value, ttl: opts?.ex });
			return "OK";
		},
		del: async (key: string) => {
			const existed = store.has(key);
			store.delete(key);
			return existed ? 1 : 0;
		},
		exists: async (key: string) => (store.has(key) ? 1 : 0),
	},
}));

mock.module("@upstash/ratelimit", () => ({
	Ratelimit: class {
		constructor() {}
		static slidingWindow() {
			return {};
		}
		async limit() {
			return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 };
		}
	},
}));

mock.module("@/lib/webhook", () => ({
	send: async () => {},
}));

const baseurl = "http://localhost:3000/api/v1";

async function createkey(webhook?: string): Promise<string> {
	const res = await fetch(`${baseurl}/keys`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: webhook ? JSON.stringify({ webhook }) : "{}",
	});
	const data = await res.json();
	return data.key;
}

describe("api keys", () => {
	beforeEach(() => {
		store.clear();
	});

	test("POST /keys creates api key", async () => {
		const { POST } = await import("@/app/api/v1/keys/route");
		const req = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.key).toMatch(/^noro_[a-z0-9]{32}$/);
		expect(data.expires).toBeGreaterThan(Date.now());
	});

	test("POST /keys with webhook", async () => {
		const { POST } = await import("@/app/api/v1/keys/route");
		const req = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ webhook: "https://example.com/hook" }),
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.key).toMatch(/^noro_/);
	});

	test("POST /keys rejects invalid webhook", async () => {
		const { POST } = await import("@/app/api/v1/keys/route");
		const req = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ webhook: "http://insecure.com" }),
		});
		const res = await POST(req);

		expect(res.status).toBe(400);
	});

	test("GET /keys requires auth", async () => {
		const { GET } = await import("@/app/api/v1/keys/route");
		const req = new Request(`${baseurl}/keys`);
		const res = await GET(req);

		expect(res.status).toBe(401);
	});

	test("GET /keys returns key info", async () => {
		const { POST, GET } = await import("@/app/api/v1/keys/route");

		const createreq = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const createres = await POST(createreq);
		const { key } = await createres.json();

		const getreq = new Request(`${baseurl}/keys`, {
			headers: { authorization: `Bearer ${key}` },
		});
		const getres = await GET(getreq);
		const data = await getres.json();

		expect(getres.status).toBe(200);
		expect(data.hint).toBe(`noro_****${key.slice(-4)}`);
		expect(data.created).toBeGreaterThan(0);
	});

	test("DELETE /keys removes key", async () => {
		const { POST, DELETE, GET } = await import("@/app/api/v1/keys/route");

		const createreq = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const createres = await POST(createreq);
		const { key } = await createres.json();

		const deletereq = new Request(`${baseurl}/keys`, {
			method: "DELETE",
			headers: { authorization: `Bearer ${key}` },
		});
		const deleteres = await DELETE(deletereq);

		expect(deleteres.status).toBe(200);

		const getreq = new Request(`${baseurl}/keys`, {
			headers: { authorization: `Bearer ${key}` },
		});
		const getres = await GET(getreq);

		expect(getres.status).toBe(401);
	});
});

describe("secrets", () => {
	beforeEach(() => {
		store.clear();
	});

	test("POST /secrets requires auth", async () => {
		const { POST } = await import("@/app/api/v1/secrets/route");
		const req = new Request(`${baseurl}/secrets`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ data: "test" }),
		});
		const res = await POST(req);

		expect(res.status).toBe(401);
	});

	test("POST /secrets creates secret", async () => {
		const { POST: createkey } = await import("@/app/api/v1/keys/route");
		const { POST } = await import("@/app/api/v1/secrets/route");

		const keyreq = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const keyres = await createkey(keyreq);
		const { key } = await keyres.json();

		const req = new Request(`${baseurl}/secrets`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${key}`,
			},
			body: JSON.stringify({ data: "secret123" }),
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.id).toHaveLength(8);
		expect(data.url).toContain(data.id);
	});

	test("POST /secrets validates data", async () => {
		const { POST: createkey } = await import("@/app/api/v1/keys/route");
		const { POST } = await import("@/app/api/v1/secrets/route");

		const keyreq = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const keyres = await createkey(keyreq);
		const { key } = await keyres.json();

		const req = new Request(`${baseurl}/secrets`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${key}`,
			},
			body: JSON.stringify({}),
		});
		const res = await POST(req);

		expect(res.status).toBe(400);
	});

	test("GET /secrets/:id claims secret", async () => {
		const { POST: createkey } = await import("@/app/api/v1/keys/route");
		const { POST } = await import("@/app/api/v1/secrets/route");
		const { GET } = await import("@/app/api/v1/secrets/[id]/route");

		const keyreq = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const keyres = await createkey(keyreq);
		const { key } = await keyres.json();

		const createreq = new Request(`${baseurl}/secrets`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${key}`,
			},
			body: JSON.stringify({ data: "mysecret", views: 2 }),
		});
		const createres = await POST(createreq);
		const { id } = await createres.json();

		const getreq = new Request(`${baseurl}/secrets/${id}`, {
			headers: { authorization: `Bearer ${key}` },
		});
		const getres = await GET(getreq, { params: Promise.resolve({ id }) });
		const data = await getres.json();

		expect(getres.status).toBe(200);
		expect(data.data).toBe("mysecret");
		expect(data.remaining).toBe(1);
	});

	test("GET /secrets/:id deletes after last view", async () => {
		const { POST: createkey } = await import("@/app/api/v1/keys/route");
		const { POST } = await import("@/app/api/v1/secrets/route");
		const { GET } = await import("@/app/api/v1/secrets/[id]/route");

		const keyreq = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const keyres = await createkey(keyreq);
		const { key } = await keyres.json();

		const createreq = new Request(`${baseurl}/secrets`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${key}`,
			},
			body: JSON.stringify({ data: "onetimesecret", views: 1 }),
		});
		const createres = await POST(createreq);
		const { id } = await createres.json();

		const getreq1 = new Request(`${baseurl}/secrets/${id}`, {
			headers: { authorization: `Bearer ${key}` },
		});
		const getres1 = await GET(getreq1, { params: Promise.resolve({ id }) });
		const data1 = await getres1.json();

		expect(data1.remaining).toBe(0);

		const getreq2 = new Request(`${baseurl}/secrets/${id}`, {
			headers: { authorization: `Bearer ${key}` },
		});
		const getres2 = await GET(getreq2, { params: Promise.resolve({ id }) });

		expect(getres2.status).toBe(404);
	});

	test("DELETE /secrets/:id revokes secret", async () => {
		const { POST: createkey } = await import("@/app/api/v1/keys/route");
		const { POST } = await import("@/app/api/v1/secrets/route");
		const { DELETE, GET } = await import("@/app/api/v1/secrets/[id]/route");

		const keyreq = new Request(`${baseurl}/keys`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		const keyres = await createkey(keyreq);
		const { key } = await keyres.json();

		const createreq = new Request(`${baseurl}/secrets`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${key}`,
			},
			body: JSON.stringify({ data: "deleteme" }),
		});
		const createres = await POST(createreq);
		const { id } = await createres.json();

		const deletereq = new Request(`${baseurl}/secrets/${id}`, {
			method: "DELETE",
			headers: { authorization: `Bearer ${key}` },
		});
		const deleteres = await DELETE(deletereq, { params: Promise.resolve({ id }) });

		expect(deleteres.status).toBe(200);

		const getreq = new Request(`${baseurl}/secrets/${id}`, {
			headers: { authorization: `Bearer ${key}` },
		});
		const getres = await GET(getreq, { params: Promise.resolve({ id }) });

		expect(getres.status).toBe(404);
	});
});

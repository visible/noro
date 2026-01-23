export default function Home() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <img src="/icon.svg" alt="" width={28} height={28} aria-hidden="true" style={{ filter: "invert(1)" }} />
        <span style={{ color: "#888", fontSize: 13, fontWeight: 500 }}>noro</span>
      </div>
      <p style={{ fontSize: 13, marginBottom: "0.25rem" }}>share env vars with one command</p>
      <p style={{ color: "#555", fontSize: 11, marginBottom: "3rem" }}>one-time links that self-destruct after claiming</p>

      <section style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 13, color: "#666", marginBottom: "0.75rem" }}><span style={{ color: "#888" }}>&gt;</span> share?</p>
        <pre style={{ background: "#111", padding: "0.75rem", borderRadius: 6, fontSize: 11, lineHeight: 1.6, border: "1px solid #222", color: "#888" }}>
{`noro share OPENAI_API_KEY

  → noro.sh/a8f3k2#key
  → or: npx noro a8f3k2#key`}
        </pre>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 13, color: "#666", marginBottom: "0.75rem" }}><span style={{ color: "#888" }}>&gt;</span> claim?</p>
        <pre style={{ background: "#111", padding: "0.75rem", borderRadius: 6, fontSize: 11, lineHeight: 1.6, border: "1px solid #222", color: "#888" }}>
{`npx noro a8f3k2#key

  # in project folder:
  → ✓ added OPENAI_API_KEY to .env

  # anywhere else:
  → OPENAI_API_KEY=sk-********
  → ✓ copied to clipboard`}
        </pre>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 13, color: "#666", marginBottom: "0.75rem" }}><span style={{ color: "#888" }}>&gt;</span> install?</p>
        <pre style={{ background: "#111", padding: "0.75rem", borderRadius: 6, fontSize: 11, lineHeight: 1.6, border: "1px solid #222", color: "#888" }}>
{`npm i -g noro`}
        </pre>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 13, color: "#666", marginBottom: "0.75rem" }}><span style={{ color: "#888" }}>&gt;</span> how?</p>
        <div style={{ paddingLeft: "1rem", fontSize: 11 }}>
          <p style={{ color: "#555", margin: "0.5rem 0" }}>secrets encrypted client-side with aes-256-gcm</p>
          <p style={{ color: "#555", margin: "0.5rem 0" }}>key never leaves your machine, only in url fragment</p>
          <p style={{ color: "#555", margin: "0.5rem 0" }}>server only stores encrypted blob, can't read it</p>
          <p style={{ color: "#555", margin: "0.5rem 0" }}>deleted immediately after first claim</p>
        </div>
      </section>

      <footer style={{ paddingTop: "2rem", borderTop: "1px solid #1a1a1a" }}>
        <a href="https://github.com/visible" target="_blank" rel="noopener noreferrer" style={{ color: "#444", fontSize: 11, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          visible
        </a>
      </footer>
    </div>
  )
}

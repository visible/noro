import type { SecretEngine, SecretLease, DatabaseConfig } from "./types";
import { generatepassword, generateusername, createlease, getlease, revokelease } from "./engine";

async function connectpostgres(config: DatabaseConfig) {
  const { Pool } = await import("pg");
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.adminuser,
    password: config.adminpassword,
    ssl: { rejectUnauthorized: false },
  });
  return {
    query: async (sql: string) => {
      await pool.query(sql);
    },
    end: async () => {
      await pool.end();
    },
  };
}

async function connectmysql(config: DatabaseConfig) {
  const mysql = await import("mysql2/promise");
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.adminuser,
    password: config.adminpassword,
    ssl: {},
  });
  return {
    query: async (sql: string) => {
      await conn.execute(sql);
    },
    end: async () => {
      await conn.end();
    },
  };
}

export async function generatedatabasecreds(engine: SecretEngine): Promise<SecretLease> {
  const config = engine.config as DatabaseConfig;
  const username = generateusername();
  const password = generatepassword();
  const db = config.type === "postgres"
    ? await connectpostgres(config)
    : await connectmysql(config);
  try {
    if (config.type === "postgres") {
      await db.query(`CREATE USER ${username} WITH PASSWORD '${password}'`);
      await db.query(`GRANT CONNECT ON DATABASE ${config.database} TO ${username}`);
      await db.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${username}`);
    } else {
      await db.query(`CREATE USER '${username}'@'%' IDENTIFIED BY '${password}'`);
      await db.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${config.database}.* TO '${username}'@'%'`);
      await db.query(`FLUSH PRIVILEGES`);
    }
  } finally {
    await db.end();
  }
  const lease = await createlease(
    engine.id,
    { username, password, host: config.host, port: String(config.port), database: config.database },
    config.ttl
  );
  schedulerevocation(lease.id, engine, config.ttl);
  return lease;
}

export async function revokedatabasecreds(engine: SecretEngine, lease: SecretLease): Promise<void> {
  if (lease.revoked) return;
  const config = engine.config as DatabaseConfig;
  const { username } = lease.credentials;
  const db = config.type === "postgres"
    ? await connectpostgres(config)
    : await connectmysql(config);
  try {
    if (config.type === "postgres") {
      await db.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${username}`);
      await db.query(`REVOKE CONNECT ON DATABASE ${config.database} FROM ${username}`);
      await db.query(`DROP USER IF EXISTS ${username}`);
    } else {
      await db.query(`REVOKE ALL PRIVILEGES ON ${config.database}.* FROM '${username}'@'%'`);
      await db.query(`DROP USER IF EXISTS '${username}'@'%'`);
    }
  } finally {
    await db.end();
  }
  await revokelease(lease.id);
}

function schedulerevocation(leaseid: string, engine: SecretEngine, ttl: number): void {
  setTimeout(async () => {
    const lease = await getlease(leaseid);
    if (!lease || lease.revoked) return;
    await revokedatabasecreds(engine, lease);
  }, ttl * 1000);
}

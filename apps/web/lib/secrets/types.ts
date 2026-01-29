export type EngineType = "database" | "aws";

export interface DatabaseConfig {
  type: "postgres" | "mysql";
  host: string;
  port: number;
  database: string;
  adminuser: string;
  adminpassword: string;
  ttl: number;
}

export interface AwsConfig {
  rolearn: string;
  region: string;
  accesskey: string;
  secretkey: string;
  ttl: number;
}

export interface SecretEngine {
  id: string;
  type: EngineType;
  name: string;
  config: DatabaseConfig | AwsConfig;
  userid: string;
  created: number;
}

export interface SecretLease {
  id: string;
  engineid: string;
  credentials: Record<string, string>;
  expires: number;
  revoked: boolean;
  created: number;
}

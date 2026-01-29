import type { SecretEngine, SecretLease, AwsConfig } from "./types";
import { generateusername, createlease } from "./engine";

export async function generateawscreds(engine: SecretEngine): Promise<SecretLease> {
  const config = engine.config as AwsConfig;
  const { STSClient, AssumeRoleCommand } = await import("@aws-sdk/client-sts");
  const client = new STSClient({
    region: config.region,
    credentials: {
      accessKeyId: config.accesskey,
      secretAccessKey: config.secretkey,
    },
  });
  const sessionname = generateusername();
  const command = new AssumeRoleCommand({
    RoleArn: config.rolearn,
    RoleSessionName: sessionname,
    DurationSeconds: Math.min(config.ttl, 43200),
  });
  const response = await client.send(command);
  if (!response.Credentials) {
    throw new Error("failed to assume role");
  }
  const lease = await createlease(
    engine.id,
    {
      accesskey: response.Credentials.AccessKeyId!,
      secretkey: response.Credentials.SecretAccessKey!,
      sessiontoken: response.Credentials.SessionToken!,
      expiration: response.Credentials.Expiration!.toISOString(),
    },
    config.ttl
  );
  return lease;
}

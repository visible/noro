/*
Prisma model needed:

model Passkey {
  id           String   @id @default(cuid())
  userId       String
  credentialId String   @unique
  publicKey    String   @db.Text
  counter      Int      @default(0)
  transports   String?
  deviceType   String?
  backedUp     Boolean  @default(false)
  name         String?
  createdAt    DateTime @default(now())
  lastUsed     DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("passkey")
}

Add to User model:
  passkeys Passkey[]
*/

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
  type AuthenticatorTransportFuture,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";
import { db } from "./db";

const rpname = "noro";
const rpid = process.env.WEBAUTHN_RP_ID || "localhost";
const origin = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000";

type PasskeyRecord = {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string | null;
  deviceType: string | null;
  backedUp: boolean;
  name: string | null;
  createdAt: Date;
  lastUsed: Date | null;
};

export type PasskeyCredential = {
  id: string;
  credentialid: string;
  publickey: string;
  counter: number;
  transports: AuthenticatorTransportFuture[];
  devicetype: string | null;
  backedup: boolean;
  name: string | null;
  createdat: Date;
  lastused: Date | null;
};

export type RegistrationChallenge = { challenge: string; userid: string; username: string; expires: number };
export type AuthenticationChallenge = { challenge: string; userid?: string; expires: number };

type PrfExtension = { prf?: { results?: { first?: ArrayBuffer } } };
type PasskeyDb = { passkey: {
  findMany: (a: unknown) => Promise<PasskeyRecord[]>;
  findUnique: (a: unknown) => Promise<PasskeyRecord | null>;
  findFirst: (a: unknown) => Promise<PasskeyRecord | null>;
  create: (a: unknown) => Promise<PasskeyRecord>;
  update: (a: unknown) => Promise<PasskeyRecord>;
  delete: (a: unknown) => Promise<PasskeyRecord>;
}};

const passkeydb = db as unknown as PasskeyDb;

function parsetransports(t: string | null): AuthenticatorTransportFuture[] {
  if (!t) return [];
  try { return JSON.parse(t) as AuthenticatorTransportFuture[]; } catch { return []; }
}

function serializetransports(t?: AuthenticatorTransportFuture[]): string | null {
  return t?.length ? JSON.stringify(t) : null;
}

function topasskeycredential(p: PasskeyRecord): PasskeyCredential {
  return {
    id: p.id, credentialid: p.credentialId, publickey: p.publicKey, counter: p.counter,
    transports: parsetransports(p.transports), devicetype: p.deviceType, backedup: p.backedUp,
    name: p.name, createdat: p.createdAt, lastused: p.lastUsed,
  };
}

export async function generateregistrationoptions(
  userid: string, username: string, displayname?: string
): Promise<{ options: PublicKeyCredentialCreationOptionsJSON; challenge: RegistrationChallenge }> {
  const existing = await passkeydb.passkey.findMany({
    where: { userId: userid }, select: { credentialId: true, transports: true },
  });
  const excludecredentials = existing.map((p) => ({ id: p.credentialId, transports: parsetransports(p.transports) }));

  const options = await generateRegistrationOptions({
    rpName: rpname, rpID: rpid, userName: username, userDisplayName: displayname || username,
    attestationType: "none", excludeCredentials: excludecredentials,
    authenticatorSelection: { residentKey: "required", userVerification: "preferred", authenticatorAttachment: "platform" },
    extensions: { prf: {} } as Record<string, unknown>,
  });

  return { options, challenge: { challenge: options.challenge, userid, username, expires: Date.now() + 300000 } };
}

export async function verifyregistration(
  response: RegistrationResponseJSON, challenge: RegistrationChallenge, label?: string
): Promise<{ verified: boolean; credential?: PasskeyCredential; error?: string }> {
  if (Date.now() > challenge.expires) return { verified: false, error: "challenge expired" };

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response, expectedChallenge: challenge.challenge, expectedOrigin: origin, expectedRPID: rpid, requireUserVerification: false,
    });
  } catch (e) { return { verified: false, error: e instanceof Error ? e.message : "verification failed" }; }

  if (!verification.verified || !verification.registrationInfo) return { verified: false, error: "registration not verified" };
  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  const existing = await passkeydb.passkey.findUnique({ where: { credentialId: credential.id } });
  if (existing) return { verified: false, error: "credential already registered" };

  const passkey = await passkeydb.passkey.create({
    data: {
      userId: challenge.userid, credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64"), counter: credential.counter,
      transports: serializetransports(credential.transports), deviceType: credentialDeviceType,
      backedUp: credentialBackedUp, name: label || null,
    },
  });
  return { verified: true, credential: topasskeycredential(passkey) };
}

export async function generateauthoptions(
  userid?: string
): Promise<{ options: PublicKeyCredentialRequestOptionsJSON; challenge: AuthenticationChallenge }> {
  let allowcredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] | undefined;
  if (userid) {
    const passkeys = await passkeydb.passkey.findMany({ where: { userId: userid }, select: { credentialId: true, transports: true } });
    allowcredentials = passkeys.map((p) => ({ id: p.credentialId, transports: parsetransports(p.transports) }));
  }
  const options = await generateAuthenticationOptions({ rpID: rpid, allowCredentials: allowcredentials, userVerification: "preferred" });
  return { options, challenge: { challenge: options.challenge, userid, expires: Date.now() + 300000 } };
}

export async function verifyauthentication(
  response: AuthenticationResponseJSON, challenge: AuthenticationChallenge
): Promise<{ verified: boolean; userid?: string; credentialid?: string; prfoutput?: ArrayBuffer; error?: string }> {
  if (Date.now() > challenge.expires) return { verified: false, error: "challenge expired" };

  const passkey = await passkeydb.passkey.findUnique({ where: { credentialId: response.id }, include: { user: true } });
  if (!passkey) return { verified: false, error: "passkey not found" };
  if (challenge.userid && passkey.userId !== challenge.userid) return { verified: false, error: "passkey does not belong to user" };

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response, expectedChallenge: challenge.challenge, expectedOrigin: origin, expectedRPID: rpid,
      credential: { id: passkey.credentialId, publicKey: Buffer.from(passkey.publicKey, "base64"), counter: passkey.counter, transports: parsetransports(passkey.transports) },
      requireUserVerification: false,
    });
  } catch (e) { return { verified: false, error: e instanceof Error ? e.message : "verification failed" }; }

  if (!verification.verified) return { verified: false, error: "authentication not verified" };
  await passkeydb.passkey.update({ where: { id: passkey.id }, data: { counter: verification.authenticationInfo.newCounter, lastUsed: new Date() } });

  const prfoutput = (response.clientExtensionResults as PrfExtension)?.prf?.results?.first;
  return { verified: true, userid: passkey.userId, credentialid: passkey.id, prfoutput };
}

export async function listpasskeys(userid: string): Promise<PasskeyCredential[]> {
  const passkeys = await passkeydb.passkey.findMany({ where: { userId: userid }, orderBy: { createdAt: "desc" } });
  return passkeys.map(topasskeycredential);
}

export async function deletepasskey(userid: string, passkeyid: string): Promise<boolean> {
  const passkey = await passkeydb.passkey.findFirst({ where: { id: passkeyid, userId: userid } });
  if (!passkey) return false;
  await passkeydb.passkey.delete({ where: { id: passkeyid } });
  return true;
}

export async function renamepasskey(userid: string, passkeyid: string, name: string): Promise<boolean> {
  const passkey = await passkeydb.passkey.findFirst({ where: { id: passkeyid, userId: userid } });
  if (!passkey) return false;
  await passkeydb.passkey.update({ where: { id: passkeyid }, data: { name } });
  return true;
}

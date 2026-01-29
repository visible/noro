export type EmergencyStatus = "pending" | "requested" | "approved" | "denied" | "expired";

export interface EmergencyAccess {
	id: string;
	grantorId: string;
	granteeId: string;
	status: EmergencyStatus;
	waitDays: number;
	requestedAt: Date | null;
	approvedAt: Date | null;
	deniedAt: Date | null;
	expiresAt: Date | null;
	grantorPublicKey: string | null;
	grantorPrivateKey: string | null;
	encryptedVaultKey: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TrustedContact {
	id: string;
	email: string;
	name: string;
	status: EmergencyStatus;
	waitDays: number;
	createdAt: Date;
}

export interface EmergencyRequest {
	id: string;
	grantorEmail: string;
	grantorName: string;
	status: EmergencyStatus;
	waitDays: number;
	requestedAt: Date | null;
	expiresAt: Date | null;
}

export interface CreateContactPayload {
	email: string;
	waitDays?: number;
}

export interface RequestAccessPayload {
	grantorId: string;
}

export interface RespondPayload {
	action: "approve" | "deny";
	encryptedVaultKey?: string;
}

export interface KeyPair {
	publicKey: string;
	privateKey: string;
}

import type { ItemType } from "./generated/prisma/enums";

export type FolderIcon = "folder" | "star" | "archive" | "lock" | "globe" | "code" | "key" | "user";

export type FolderData = {
	id: string;
	name: string;
	parentId: string | null;
	icon: FolderIcon;
	createdAt: string;
	updatedAt: string;
};

export type SpecialFolder = "all" | "favorites" | "trash";

export type LoginData = {
	username?: string;
	password?: string;
	url?: string;
	totp?: string;
	notes?: string;
};

export type NoteData = {
	content: string;
};

export type CardData = {
	holder: string;
	number: string;
	expiry: string;
	cvv: string;
	pin?: string;
	notes?: string;
};

export type IdentityData = {
	firstname?: string;
	lastname?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	notes?: string;
};

export type SshData = {
	privatekey: string;
	publickey?: string;
	passphrase?: string;
	notes?: string;
};

export type ApiData = {
	key: string;
	secret?: string;
	endpoint?: string;
	notes?: string;
};

export type OtpData = {
	secret: string;
	issuer?: string;
	account?: string;
	digits?: number;
	period?: number;
	algorithm?: "sha1" | "sha256" | "sha512";
};

export type PasskeyData = {
	credentialid: string;
	publickey: string;
	rpid: string;
	origin: string;
	notes?: string;
};

export type ItemDataMap = {
	login: LoginData;
	note: NoteData;
	card: CardData;
	identity: IdentityData;
	ssh: SshData;
	api: ApiData;
	otp: OtpData;
	passkey: PasskeyData;
};

export type ItemData<T extends ItemType> = ItemDataMap[T];

export type CreateItemInput<T extends ItemType> = {
	type: T;
	title: string;
	data: ItemDataMap[T];
	tags?: string[];
	favorite?: boolean;
	folderId?: string | null;
};

export type UpdateItemInput<T extends ItemType> = {
	title?: string;
	data?: Partial<ItemDataMap[T]>;
	tags?: string[];
	favorite?: boolean;
	folderId?: string | null;
};

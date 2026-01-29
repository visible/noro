export interface Credential {
	id: string;
	site: string;
	username: string;
	password: string;
	created: number;
}

export interface Session {
	email: string;
	token: string;
}

export interface VaultItem {
	id: string;
	type: string;
	title: string;
	username?: string;
	password?: string;
	url?: string;
	notes?: string;
	favorite: boolean;
}

export interface RecentSecret {
	id: string;
	url: string;
	preview: string;
	created: number;
}

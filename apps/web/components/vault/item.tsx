"use client";

import { useState, useCallback } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type {
	LoginData,
	CardData,
	IdentityData,
	SshData,
	ApiData,
	OtpData,
	PasskeyData,
	NoteData,
	ItemDataMap,
} from "@/lib/types";

interface VaultItemData {
	id: string;
	type: ItemType;
	title: string;
	data: ItemDataMap[ItemType];
	tags: string[];
	favorite: boolean;
	createdAt: string;
	updatedAt: string;
}

interface Props {
	item: VaultItemData;
	onEdit?: () => void;
	onFavorite?: () => void;
	onClose?: () => void;
	compact?: boolean;
}

interface FieldProps {
	label: string;
	value: string | undefined;
	masked?: boolean;
	mono?: boolean;
	url?: boolean;
}

const iconpaths = {
	eye: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z",
	eyeoff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
	copy: "M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
	check: "M20 6L9 17l-5-5",
	star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
	external: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
	close: "M18 6L6 18M6 6l12 12",
};

function Svg({ path, className }: { path: string; className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={path} />
		</svg>
	);
}

function Field({ label, value, masked, mono, url }: FieldProps) {
	const [visible, setVisible] = useState(false);
	const [copied, setCopied] = useState(false);

	const copy = useCallback(async () => {
		if (!value) return;
		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [value]);

	if (!value) return null;

	const displayValue = masked && !visible ? "\u2022".repeat(Math.min(value.length, 24)) : value;

	return (
		<div className="group">
			<label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
			<div className="flex items-center gap-2">
				<span className={`flex-1 text-sm text-white break-all ${mono ? "font-mono" : ""}`}>
					{url ? (
						<a
							href={value.startsWith("http") ? value : `https://${value}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#d4b08c] hover:underline inline-flex items-center gap-1"
						>
							{displayValue}
							<Svg path={iconpaths.external} className="w-3 h-3" />
						</a>
					) : (
						displayValue
					)}
				</span>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					{masked && (
						<button
							type="button"
							onClick={() => setVisible(!visible)}
							className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
							aria-label={visible ? "hide" : "show"}
						>
							<Svg path={visible ? iconpaths.eyeoff : iconpaths.eye} className="w-4 h-4" />
						</button>
					)}
					<button
						type="button"
						onClick={copy}
						className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
						aria-label="copy"
					>
						<Svg
							path={copied ? iconpaths.check : iconpaths.copy}
							className={`w-4 h-4 ${copied ? "text-green-500" : ""}`}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}

function LoginFields({ data }: { data: LoginData }) {
	return (
		<div className="space-y-4">
			<Field label="username" value={data.username} mono />
			<Field label="password" value={data.password} masked mono />
			<Field label="website" value={data.url} url />
			<Field label="totp secret" value={data.totp} masked mono />
			<Field label="notes" value={data.notes} />
		</div>
	);
}

function NoteFields({ data }: { data: NoteData }) {
	return (
		<div className="space-y-4">
			<Field label="content" value={data.content} />
		</div>
	);
}

function CardFields({ data }: { data: CardData }) {
	return (
		<div className="space-y-4">
			<Field label="cardholder" value={data.holder} />
			<Field label="card number" value={data.number} masked mono />
			<div className="grid grid-cols-2 gap-4">
				<Field label="expiry" value={data.expiry} mono />
				<Field label="cvv" value={data.cvv} masked mono />
			</div>
			<Field label="pin" value={data.pin} masked mono />
			<Field label="notes" value={data.notes} />
		</div>
	);
}

function IdentityFields({ data }: { data: IdentityData }) {
	const fullname = [data.firstname, data.lastname].filter(Boolean).join(" ");
	return (
		<div className="space-y-4">
			{fullname && <Field label="name" value={fullname} />}
			<Field label="email" value={data.email} />
			<Field label="phone" value={data.phone} />
			<Field label="address" value={data.address} />
			<div className="grid grid-cols-2 gap-4">
				<Field label="city" value={data.city} />
				<Field label="state" value={data.state} />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<Field label="zip" value={data.zip} />
				<Field label="country" value={data.country} />
			</div>
			<Field label="notes" value={data.notes} />
		</div>
	);
}

function SshFields({ data }: { data: SshData }) {
	return (
		<div className="space-y-4">
			<Field label="private key" value={data.privatekey} masked mono />
			<Field label="public key" value={data.publickey} mono />
			<Field label="passphrase" value={data.passphrase} masked mono />
			<Field label="notes" value={data.notes} />
		</div>
	);
}

function ApiFields({ data }: { data: ApiData }) {
	return (
		<div className="space-y-4">
			<Field label="api key" value={data.key} masked mono />
			<Field label="api secret" value={data.secret} masked mono />
			<Field label="endpoint" value={data.endpoint} url />
			<Field label="notes" value={data.notes} />
		</div>
	);
}

function OtpFields({ data }: { data: OtpData }) {
	return (
		<div className="space-y-4">
			<Field label="secret" value={data.secret} masked mono />
			<div className="grid grid-cols-2 gap-4">
				<Field label="issuer" value={data.issuer} />
				<Field label="account" value={data.account} />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<Field label="digits" value={data.digits?.toString()} />
				<Field label="period" value={data.period ? `${data.period}s` : undefined} />
			</div>
		</div>
	);
}

function PasskeyFields({ data }: { data: PasskeyData }) {
	return (
		<div className="space-y-4">
			<Field label="credential id" value={data.credentialid} mono />
			<Field label="public key" value={data.publickey} mono />
			<Field label="relying party" value={data.rpid} />
			<Field label="origin" value={data.origin} url />
			<Field label="notes" value={data.notes} />
		</div>
	);
}

export function ItemDisplay({ item, onEdit, onFavorite, onClose, compact }: Props) {
	const typeconfig: Record<ItemType, { color: string; label: string }> = {
		login: { color: "bg-blue-500/20 text-blue-400", label: "login" },
		note: { color: "bg-amber-500/20 text-amber-400", label: "note" },
		card: { color: "bg-emerald-500/20 text-emerald-400", label: "card" },
		identity: { color: "bg-violet-500/20 text-violet-400", label: "identity" },
		ssh: { color: "bg-slate-500/20 text-slate-400", label: "ssh key" },
		api: { color: "bg-rose-500/20 text-rose-400", label: "api key" },
		otp: { color: "bg-cyan-500/20 text-cyan-400", label: "otp" },
		passkey: { color: "bg-fuchsia-500/20 text-fuchsia-400", label: "passkey" },
	};

	const config = typeconfig[item.type];

	function renderFields() {
		switch (item.type) {
			case "login":
				return <LoginFields data={item.data as LoginData} />;
			case "note":
				return <NoteFields data={item.data as NoteData} />;
			case "card":
				return <CardFields data={item.data as CardData} />;
			case "identity":
				return <IdentityFields data={item.data as IdentityData} />;
			case "ssh":
				return <SshFields data={item.data as SshData} />;
			case "api":
				return <ApiFields data={item.data as ApiData} />;
			case "otp":
				return <OtpFields data={item.data as OtpData} />;
			case "passkey":
				return <PasskeyFields data={item.data as PasskeyData} />;
			default:
				return null;
		}
	}

	return (
		<div className={compact ? "" : "bg-[#161616] border border-white/10 rounded-xl overflow-hidden"}>
			<div className={`${compact ? "" : "px-6 py-5"} border-b border-white/10`}>
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-3 min-w-0">
						<span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
							{config.label}
						</span>
						<h2 className="text-lg font-semibold text-white truncate">{item.title}</h2>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						{onFavorite && (
							<button
								type="button"
								onClick={onFavorite}
								className={`p-2 rounded-lg transition-colors ${
									item.favorite
										? "text-amber-400 hover:bg-amber-400/10"
										: "text-white/40 hover:text-white hover:bg-white/10"
								}`}
								aria-label={item.favorite ? "remove from favorites" : "add to favorites"}
							>
								<svg
									aria-hidden="true"
									className="w-5 h-5"
									viewBox="0 0 24 24"
									fill={item.favorite ? "currentColor" : "none"}
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d={iconpaths.star} />
								</svg>
							</button>
						)}
						{onEdit && (
							<button
								type="button"
								onClick={onEdit}
								className="px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
							>
								edit
							</button>
						)}
						{onClose && (
							<button
								type="button"
								onClick={onClose}
								className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
								aria-label="close"
							>
								<Svg path={iconpaths.close} className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>
				{item.tags.length > 0 && (
					<div className="flex gap-1.5 mt-3 flex-wrap">
						{item.tags.map((tag) => (
							<span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">
								{tag}
							</span>
						))}
					</div>
				)}
			</div>
			<div className={compact ? "pt-4" : "px-6 py-5"}>
				{renderFields()}
			</div>
		</div>
	);
}

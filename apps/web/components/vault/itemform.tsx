"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { ItemDataMap } from "@/lib/types";

interface VaultItem {
	id: string;
	type: ItemType;
	title: string;
	data: ItemDataMap[ItemType];
	tags: string[];
	favorite: boolean;
}

interface Props {
	item?: VaultItem | null;
	defaulttype?: ItemType;
	onSave: (data: { type: ItemType; title: string; data: Record<string, unknown>; tags: string[] }) => void;
	onDelete?: () => void;
	onCancel: () => void;
}

interface FieldConfig {
	name: string;
	label: string;
	type: "text" | "password" | "textarea" | "url" | "email" | "number";
	required?: boolean;
	half?: boolean;
}

const fieldconfigs: Record<ItemType, FieldConfig[]> = {
	login: [
		{ name: "username", label: "username", type: "text" },
		{ name: "password", label: "password", type: "password", required: true },
		{ name: "url", label: "website url", type: "url" },
		{ name: "totp", label: "totp secret", type: "password" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	note: [{ name: "content", label: "content", type: "textarea", required: true }],
	card: [
		{ name: "holder", label: "cardholder name", type: "text", required: true },
		{ name: "number", label: "card number", type: "password", required: true },
		{ name: "expiry", label: "expiry (mm/yy)", type: "text", required: true, half: true },
		{ name: "cvv", label: "cvv", type: "password", required: true, half: true },
		{ name: "pin", label: "pin", type: "password" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	identity: [
		{ name: "firstname", label: "first name", type: "text", half: true },
		{ name: "lastname", label: "last name", type: "text", half: true },
		{ name: "email", label: "email", type: "email" },
		{ name: "phone", label: "phone", type: "text" },
		{ name: "address", label: "address", type: "text" },
		{ name: "city", label: "city", type: "text", half: true },
		{ name: "state", label: "state", type: "text", half: true },
		{ name: "zip", label: "zip code", type: "text", half: true },
		{ name: "country", label: "country", type: "text", half: true },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	ssh: [
		{ name: "privatekey", label: "private key", type: "textarea", required: true },
		{ name: "publickey", label: "public key", type: "textarea" },
		{ name: "passphrase", label: "passphrase", type: "password" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	api: [
		{ name: "key", label: "api key", type: "password", required: true },
		{ name: "secret", label: "api secret", type: "password" },
		{ name: "endpoint", label: "endpoint url", type: "url" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	otp: [
		{ name: "secret", label: "secret", type: "password", required: true },
		{ name: "issuer", label: "issuer", type: "text", half: true },
		{ name: "account", label: "account", type: "text", half: true },
		{ name: "digits", label: "digits", type: "number", half: true },
		{ name: "period", label: "period (seconds)", type: "number", half: true },
	],
	passkey: [
		{ name: "credentialid", label: "credential id", type: "text", required: true },
		{ name: "publickey", label: "public key", type: "textarea", required: true },
		{ name: "rpid", label: "relying party id", type: "text", required: true },
		{ name: "origin", label: "origin", type: "url", required: true },
		{ name: "notes", label: "notes", type: "textarea" },
	],
};

const iconpaths: Record<ItemType, string> = {
	login: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
	note: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
	card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
	identity: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
	ssh: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
	api: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
	otp: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
	passkey: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
};

const typelabels: Record<ItemType, string> = {
	login: "login",
	note: "note",
	card: "card",
	identity: "identity",
	ssh: "ssh key",
	api: "api key",
	otp: "otp",
	passkey: "passkey",
};

const alltypes: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

const chars = {
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	numbers: "0123456789",
	symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatepassword(length: number = 24): string {
	const pool = chars.uppercase + chars.lowercase + chars.numbers + chars.symbols;
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	let result = "";
	for (let i = 0; i < length; i++) {
		result += pool[bytes[i] % pool.length];
	}
	return result;
}

function Svg({ path, className }: { path: string; className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={path} />
		</svg>
	);
}

interface PasswordFieldProps {
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	showGenerator?: boolean;
}

function PasswordField({ value, onChange, required, showGenerator }: PasswordFieldProps) {
	const [show, setShow] = useState(false);

	const eyepath = "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z";
	const eyeoffpath = "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22";
	const refreshpath = "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15";

	return (
		<div className="relative">
			<input
				type={show ? "text" : "password"}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				required={required}
				className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-24 text-sm text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/50 focus:ring-1 focus:ring-[#d4b08c]/30 transition-all"
			/>
			<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
				{showGenerator && (
					<button
						type="button"
						onClick={() => onChange(generatepassword())}
						className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
						title="generate password"
					>
						<Svg path={refreshpath} className="w-4 h-4" />
					</button>
				)}
				<button
					type="button"
					onClick={() => setShow(!show)}
					className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
					aria-label={show ? "hide" : "show"}
				>
					<Svg path={show ? eyeoffpath : eyepath} className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}

interface TagInputProps {
	tags: string[];
	onChange: (tags: string[]) => void;
}

function TagInput({ tags, onChange }: TagInputProps) {
	const [input, setInput] = useState("");
	const closepath = "M6 18L18 6M6 6l12 12";

	function addtag(value: string) {
		const tag = value.trim().toLowerCase();
		if (tag && !tags.includes(tag)) {
			onChange([...tags, tag]);
		}
		setInput("");
	}

	function removetag(tag: string) {
		onChange(tags.filter((t) => t !== tag));
	}

	function handlekeydown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addtag(input);
		} else if (e.key === "Backspace" && !input && tags.length > 0) {
			removetag(tags[tags.length - 1]);
		}
	}

	return (
		<div className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 min-h-[48px] focus-within:border-[#d4b08c]/50 focus-within:ring-1 focus-within:ring-[#d4b08c]/30 transition-all">
			<div className="flex flex-wrap gap-2 items-center">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded text-sm text-white"
					>
						{tag}
						<button
							type="button"
							onClick={() => removetag(tag)}
							className="text-white/40 hover:text-white transition-colors"
							aria-label={`remove ${tag}`}
						>
							<Svg path={closepath} className="w-3 h-3" />
						</button>
					</span>
				))}
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handlekeydown}
					onBlur={() => input && addtag(input)}
					placeholder={tags.length === 0 ? "add tags..." : ""}
					className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-white placeholder:text-white/30 py-1"
				/>
			</div>
		</div>
	);
}

export function ItemForm({ item, defaulttype, onSave, onDelete, onCancel }: Props) {
	const [type, setType] = useState<ItemType>(item?.type || defaulttype || "login");
	const [title, setTitle] = useState(item?.title || "");
	const [data, setData] = useState<Record<string, unknown>>(item?.data || {});
	const [tags, setTags] = useState<string[]>(item?.tags || []);
	const titleRef = useRef<HTMLInputElement>(null);
	const generatorfields = ["password", "passphrase", "totp"];

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!item) setData({});
	}, [type, item]);

	function handlesubmit(e: React.FormEvent) {
		e.preventDefault();
		onSave({ type, title, data, tags });
	}

	const fields = fieldconfigs[type];

	function renderfields() {
		const result: React.ReactNode[] = [];
		let i = 0;
		while (i < fields.length) {
			const field = fields[i];
			const nextfield = fields[i + 1];
			if (field.half && nextfield?.half) {
				result.push(
					<div key={`${field.name}-${nextfield.name}`} className="grid grid-cols-2 gap-4">
						{renderfield(field)}
						{renderfield(nextfield)}
					</div>
				);
				i += 2;
			} else {
				result.push(<div key={field.name}>{renderfield(field)}</div>);
				i += 1;
			}
		}
		return result;
	}

	function renderfield(field: FieldConfig) {
		const inputclass =
			"w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/50 focus:ring-1 focus:ring-[#d4b08c]/30 transition-all";

		return (
			<div>
				<label className="block text-xs text-white/40 uppercase tracking-wider mb-2">{field.label}</label>
				{field.type === "textarea" ? (
					<textarea
						value={(data[field.name] as string) || ""}
						onChange={(e) => setData({ ...data, [field.name]: e.target.value })}
						required={field.required}
						rows={3}
						className={`${inputclass} resize-none font-mono`}
					/>
				) : field.type === "password" ? (
					<PasswordField
						value={(data[field.name] as string) || ""}
						onChange={(v) => setData({ ...data, [field.name]: v })}
						required={field.required}
						showGenerator={generatorfields.includes(field.name)}
					/>
				) : (
					<input
						type={field.type}
						value={(data[field.name] as string | number) || ""}
						onChange={(e) =>
							setData({
								...data,
								[field.name]: field.type === "number" ? Number(e.target.value) : e.target.value,
							})
						}
						required={field.required}
						className={`${inputclass} ${field.type === "email" || field.type === "url" ? "font-mono" : ""}`}
					/>
				)}
			</div>
		);
	}

	return (
		<form onSubmit={handlesubmit} className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto scrollbar-hidden p-6 space-y-5">
				{!item && (
					<div>
						<label className="block text-xs text-white/40 uppercase tracking-wider mb-2">type</label>
						<div className="flex flex-wrap gap-1.5 p-1.5 bg-white/5 rounded-lg">
							{alltypes.map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setType(t)}
									className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										type === t
											? "bg-[#d4b08c] text-black"
											: "text-white/60 hover:text-white hover:bg-white/10"
									}`}
								>
									<Svg path={iconpaths[t]} className="w-4 h-4" />
									<span className="hidden sm:inline">{typelabels[t]}</span>
								</button>
							))}
						</div>
					</div>
				)}

				<div>
					<label className="block text-xs text-white/40 uppercase tracking-wider mb-2">title</label>
					<input
						ref={titleRef}
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder={typelabels[type]}
						required
						className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/50 focus:ring-1 focus:ring-[#d4b08c]/30 transition-all"
					/>
				</div>

				{renderfields()}

				<div>
					<label className="block text-xs text-white/40 uppercase tracking-wider mb-2">tags</label>
					<TagInput tags={tags} onChange={setTags} />
				</div>
			</div>

			<div className="p-6 pt-0 flex flex-col sm:flex-row gap-3 border-t border-white/10">
				{item && onDelete && (
					<button
						type="button"
						onClick={onDelete}
						className="sm:mr-auto px-4 py-2.5 text-red-500 font-medium rounded-lg hover:bg-red-500/10 transition-colors text-sm"
					>
						delete
					</button>
				)}
				<button
					type="button"
					onClick={onCancel}
					className="flex-1 sm:flex-initial px-5 py-2.5 text-white/60 font-medium rounded-lg border border-white/10 hover:bg-white/5 hover:text-white transition-colors text-sm"
				>
					cancel
				</button>
				<button
					type="submit"
					className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#d4b08c] text-black font-medium rounded-lg hover:bg-[#d4b08c]/90 transition-colors text-sm"
				>
					save
				</button>
			</div>
		</form>
	);
}

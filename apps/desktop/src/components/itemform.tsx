import { useState, useEffect } from "react";
import type { RemoteItem } from "../hooks/sync";

type ItemType = "login" | "note" | "card" | "identity" | "ssh" | "api" | "otp" | "passkey";

interface Props {
	item?: RemoteItem;
	onSave: (data: {
		type: ItemType;
		title: string;
		data: string;
		tags: string[];
		favorite: boolean;
	}) => void;
	onCancel: () => void;
}

const schemas: Record<ItemType, { key: string; label: string; type: string; sensitive?: boolean }[]> = {
	login: [
		{ key: "username", label: "username", type: "text" },
		{ key: "password", label: "password", type: "password", sensitive: true },
		{ key: "url", label: "url", type: "url" },
		{ key: "notes", label: "notes", type: "textarea" },
	],
	note: [
		{ key: "content", label: "content", type: "textarea" },
	],
	card: [
		{ key: "cardholder", label: "cardholder name", type: "text" },
		{ key: "number", label: "card number", type: "text", sensitive: true },
		{ key: "expiry", label: "expiry date", type: "text" },
		{ key: "cvv", label: "cvv", type: "password", sensitive: true },
		{ key: "pin", label: "pin", type: "password", sensitive: true },
	],
	identity: [
		{ key: "firstname", label: "first name", type: "text" },
		{ key: "lastname", label: "last name", type: "text" },
		{ key: "email", label: "email", type: "email" },
		{ key: "phone", label: "phone", type: "tel" },
		{ key: "address", label: "address", type: "textarea" },
	],
	ssh: [
		{ key: "host", label: "host", type: "text" },
		{ key: "port", label: "port", type: "text" },
		{ key: "username", label: "username", type: "text" },
		{ key: "privatekey", label: "private key", type: "textarea", sensitive: true },
		{ key: "passphrase", label: "passphrase", type: "password", sensitive: true },
	],
	api: [
		{ key: "service", label: "service", type: "text" },
		{ key: "apikey", label: "api key", type: "password", sensitive: true },
		{ key: "secret", label: "secret", type: "password", sensitive: true },
		{ key: "endpoint", label: "endpoint", type: "url" },
	],
	otp: [
		{ key: "issuer", label: "issuer", type: "text" },
		{ key: "account", label: "account", type: "text" },
		{ key: "secret", label: "secret key", type: "password", sensitive: true },
		{ key: "digits", label: "digits", type: "text" },
		{ key: "period", label: "period", type: "text" },
	],
	passkey: [
		{ key: "rpid", label: "relying party id", type: "text" },
		{ key: "rpname", label: "relying party name", type: "text" },
		{ key: "userid", label: "user id", type: "text" },
		{ key: "username", label: "username", type: "text" },
		{ key: "credentialid", label: "credential id", type: "text", sensitive: true },
	],
};

const typelabels: Record<ItemType, string> = {
	login: "login",
	note: "secure note",
	card: "payment card",
	identity: "identity",
	ssh: "ssh key",
	api: "api credential",
	otp: "one-time password",
	passkey: "passkey",
};

function parsedata(data: string): Record<string, string> {
	try {
		return JSON.parse(data);
	} catch {
		return {};
	}
}

export function Itemform({ item, onSave, onCancel }: Props) {
	const isEdit = !!item;
	const [itemtype, setItemtype] = useState<ItemType>(isEdit ? item.type as ItemType : "login");
	const [title, setTitle] = useState(isEdit ? item.title : "");
	const [fields, setFields] = useState<Record<string, string>>({});
	const [tags, setTags] = useState(isEdit ? item.tags.map((t) => t.name).join(", ") : "");
	const [favorite, setFavorite] = useState(isEdit ? item.favorite : false);
	const [revealed, setRevealed] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (isEdit) {
			setFields(parsedata(item.data));
		} else {
			setFields({});
		}
	}, [isEdit, item]);

	function handlefieldchange(key: string, value: string) {
		setFields((prev) => ({ ...prev, [key]: value }));
	}

	function togglereveal(key: string) {
		setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function handlesubmit(e: React.FormEvent) {
		e.preventDefault();
		const taglist = tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);
		onSave({
			type: itemtype,
			title,
			data: JSON.stringify(fields),
			tags: taglist,
			favorite,
		});
	}

	const schema = schemas[itemtype];

	return (
		<div className="itemform">
			<div className="itemform-header">
				<h2>{isEdit ? "edit item" : "new item"}</h2>
				<button type="button" className="close-btn" onClick={onCancel}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<form onSubmit={handlesubmit}>
				<div className="form-row">
					<label>type</label>
					<select
						value={itemtype}
						onChange={(e) => setItemtype(e.target.value as ItemType)}
						disabled={isEdit}
					>
						{Object.entries(typelabels).map(([key, label]) => (
							<option key={key} value={key}>{label}</option>
						))}
					</select>
				</div>

				<div className="form-row">
					<label>title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. github, gmail..."
						required
					/>
				</div>

				<div className="form-divider" />

				{schema.map((field) => (
					<div className="form-row" key={field.key}>
						<label>{field.label}</label>
						{field.type === "textarea" ? (
							<textarea
								value={fields[field.key] || ""}
								onChange={(e) => handlefieldchange(field.key, e.target.value)}
								rows={4}
							/>
						) : (
							<div className="input-wrapper">
								<input
									type={field.sensitive && !revealed[field.key] ? "password" : field.type === "password" ? "text" : field.type}
									value={fields[field.key] || ""}
									onChange={(e) => handlefieldchange(field.key, e.target.value)}
								/>
								{field.sensitive && (
									<button
										type="button"
										className="reveal-btn"
										onClick={() => togglereveal(field.key)}
									>
										{revealed[field.key] ? (
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
												<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
												<line x1="1" y1="1" x2="23" y2="23" />
											</svg>
										) : (
											<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
												<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
												<circle cx="12" cy="12" r="3" />
											</svg>
										)}
									</button>
								)}
							</div>
						)}
					</div>
				))}

				<div className="form-divider" />

				<div className="form-row">
					<label>tags</label>
					<input
						type="text"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						placeholder="comma separated"
					/>
				</div>

				<div className="form-row inline">
					<label>favorite</label>
					<button
						type="button"
						className={`favorite-toggle ${favorite ? "active" : ""}`}
						onClick={() => setFavorite(!favorite)}
					>
						{favorite ? "★" : "☆"}
					</button>
				</div>

				<div className="form-actions">
					<button type="button" className="btn-secondary" onClick={onCancel}>
						cancel
					</button>
					<button type="submit" className="btn-primary" disabled={!title.trim()}>
						{isEdit ? "save" : "create"}
					</button>
				</div>
			</form>

			<style>{`
				.itemform {
					padding: 1.5rem;
					height: 100%;
					overflow-y: auto;
				}
				.itemform-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 1.5rem;
				}
				.itemform-header h2 {
					font-size: 1.125rem;
					font-weight: 600;
				}
				.close-btn {
					width: 32px;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: none;
					color: var(--fg-muted);
					cursor: pointer;
					border-radius: var(--radius-sm);
					transition: var(--transition);
				}
				.close-btn:hover {
					color: var(--fg);
					background: var(--bg-subtle);
				}
				.close-btn svg {
					width: 1rem;
					height: 1rem;
				}
				.form-row {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
					margin-bottom: 1rem;
				}
				.form-row.inline {
					flex-direction: row;
					align-items: center;
				}
				.form-row.inline label {
					flex: 1;
				}
				.form-row label {
					font-size: 0.8125rem;
					font-weight: 500;
					color: var(--fg-muted);
				}
				.form-row input,
				.form-row select,
				.form-row textarea {
					padding: 0.75rem 1rem;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg);
					font-size: 0.875rem;
					font-family: inherit;
					transition: var(--transition);
				}
				.form-row input:focus,
				.form-row select:focus,
				.form-row textarea:focus {
					outline: none;
					border-color: var(--accent);
				}
				.form-row select {
					cursor: pointer;
				}
				.form-row textarea {
					resize: vertical;
					min-height: 80px;
				}
				.input-wrapper {
					position: relative;
					display: flex;
					align-items: center;
				}
				.input-wrapper input {
					width: 100%;
					padding-right: 2.5rem;
				}
				.reveal-btn {
					position: absolute;
					right: 0.5rem;
					width: 28px;
					height: 28px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: none;
					color: var(--fg-subtle);
					cursor: pointer;
					border-radius: 4px;
					transition: var(--transition);
				}
				.reveal-btn:hover {
					color: var(--accent);
				}
				.reveal-btn svg {
					width: 14px;
					height: 14px;
				}
				.form-divider {
					height: 1px;
					background: var(--border);
					margin: 1.25rem 0;
				}
				.favorite-toggle {
					width: 36px;
					height: 36px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg-muted);
					cursor: pointer;
					transition: var(--transition);
					font-size: 1rem;
				}
				.favorite-toggle:hover {
					border-color: var(--accent);
					color: var(--accent);
				}
				.favorite-toggle.active {
					background: rgba(212, 176, 140, 0.1);
					border-color: var(--accent);
					color: var(--accent);
				}
				.form-actions {
					display: flex;
					gap: 0.75rem;
					margin-top: 1.5rem;
					padding-top: 1rem;
					border-top: 1px solid var(--border);
				}
				.btn-primary,
				.btn-secondary {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					padding: 0.75rem 1rem;
					border-radius: var(--radius-sm);
					font-weight: 500;
					font-size: 0.875rem;
					cursor: pointer;
					transition: var(--transition);
					border: none;
				}
				.btn-primary {
					background: var(--accent);
					color: var(--bg);
				}
				.btn-primary:hover {
					background: var(--accent-hover);
				}
				.btn-primary:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
				.btn-secondary {
					background: var(--bg-elevated);
					color: var(--fg);
					border: 1px solid var(--border);
				}
				.btn-secondary:hover {
					background: var(--bg-subtle);
				}
			`}</style>
		</div>
	);
}

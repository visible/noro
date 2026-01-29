"use client";

import { useState, useEffect, useRef } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { VaultItem } from "./store";
import { fieldConfigs } from "./fields";
import { typeIcons, typeIconsLarge, typeLabels, typeColors } from "./icons";
import { PasswordField } from "./password";
import { TagInput } from "./tags";

interface Props {
	item?: VaultItem | null;
	defaulttype?: ItemType;
	onSave: (data: { type: ItemType; title: string; data: Record<string, unknown>; tags: string[] }) => void;
	onDelete?: () => void;
	onRestore?: () => void;
	onClose: () => void;
	isTrash?: boolean;
	saving?: boolean;
}

const types: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export function ItemModal({ item, defaulttype, onSave, onDelete, onRestore, onClose, isTrash, saving }: Props) {
	const [type, setType] = useState<ItemType>(item?.type || defaulttype || "login");
	const [title, setTitle] = useState(item?.title || "");
	const [data, setData] = useState<Record<string, unknown>>(item?.data || {});
	const [tags, setTags] = useState<string[]>(item?.tags || []);
	const [isVisible, setIsVisible] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);
	const generatorFields = ["password", "passphrase", "totp"];

	useEffect(() => {
		requestAnimationFrame(() => setIsVisible(true));
		titleRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!item) setData({});
	}, [type, item]);

	function handleClose() {
		setIsVisible(false);
		setTimeout(onClose, 200);
	}

	function handleBackdrop(e: React.MouseEvent) {
		if (e.target === e.currentTarget) handleClose();
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Escape") handleClose();
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		onSave({ type, title, data, tags });
	}

	const fields = fieldConfigs[type];
	const readOnly = isTrash && item;

	function renderFields() {
		const result: React.ReactNode[] = [];
		let i = 0;
		while (i < fields.length) {
			const field = fields[i];
			const nextField = fields[i + 1];
			if (field.half && nextField?.half) {
				result.push(
					<div key={`${field.name}-${nextField.name}`} className="grid grid-cols-2 gap-4">
						{renderField(field)}
						{renderField(nextField)}
					</div>
				);
				i += 2;
			} else {
				result.push(<div key={field.name}>{renderField(field)}</div>);
				i += 1;
			}
		}
		return result;
	}

	function renderField(field: (typeof fields)[0]) {
		const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d4b08c]/40 focus:border-[#d4b08c] transition-all read-only:bg-white/[0.02] read-only:text-white/50";

		return (
			<div>
				<label className="block text-sm font-medium text-white/50 mb-2">{field.label}</label>
				{field.type === "textarea" ? (
					<textarea
						value={(data[field.name] as string) || ""}
						onChange={(e) => setData({ ...data, [field.name]: e.target.value })}
						required={field.required}
						readOnly={!!readOnly}
						rows={3}
						className={`${inputClass} resize-none font-mono`}
					/>
				) : field.type === "password" ? (
					<PasswordField
						value={(data[field.name] as string) || ""}
						onChange={(v) => setData({ ...data, [field.name]: v })}
						required={field.required}
						readOnly={!!readOnly}
						showGenerator={generatorFields.includes(field.name)}
					/>
				) : (
					<input
						type={field.type}
						value={(data[field.name] as string | number) || ""}
						onChange={(e) => setData({ ...data, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value })}
						required={field.required}
						readOnly={!!readOnly}
						className={`${inputClass} font-mono`}
					/>
				)}
			</div>
		);
	}

	return (
		<div
			role="dialog"
			aria-modal="true"
			onKeyDown={handleKeyDown}
			className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-200 ${isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"}`}
			onClick={handleBackdrop}
		>
			<div
				className={`bg-[#161616] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl transition-all duration-200 ease-out ${isVisible ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"}`}
			>
				<div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
					<div className="flex items-center gap-4">
						<div className={`w-11 h-11 rounded-xl flex items-center justify-center ${typeColors[type]}`}>
							{typeIconsLarge[type]}
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">
								{isTrash ? "view item" : item ? "edit item" : "new item"}
							</h2>
							<p className="text-sm text-white/50">{typeLabels[type]}</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleClose}
						className="w-10 h-10 -mr-2 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
						aria-label="close"
					>
						<svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
					<div className="p-6 space-y-5">
						{!item && (
							<div>
								<label className="block text-sm font-medium text-white/50 mb-2">type</label>
								<div className="flex flex-wrap gap-1.5 p-1.5 bg-white/5 rounded-xl">
									{types.map((t) => (
										<button
											key={t}
											type="button"
											onClick={() => setType(t)}
											className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
												type === t
													? "bg-white/10 text-white shadow-sm"
													: "text-white/50 hover:text-white hover:bg-white/5"
											}`}
										>
											{typeIcons[t]}
											<span className="hidden sm:inline">{t}</span>
										</button>
									))}
								</div>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-white/50 mb-2">title</label>
							<input
								ref={titleRef}
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={typeLabels[type]}
								required
								readOnly={!!readOnly}
								className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d4b08c]/40 focus:border-[#d4b08c] transition-all read-only:bg-white/[0.02] read-only:text-white/50"
							/>
						</div>

						{renderFields()}

						<div>
							<label className="block text-sm font-medium text-white/50 mb-2">tags</label>
							<TagInput tags={tags} onChange={setTags} readOnly={!!readOnly} />
						</div>
					</div>
				</form>

				<div className="px-6 py-4 pb-safe bg-white/[0.02] border-t border-white/10 flex flex-col-reverse sm:flex-row gap-3 rounded-b-3xl sm:rounded-b-2xl">
					{isTrash && item ? (
						<>
							<button
								type="button"
								onClick={handleClose}
								disabled={saving}
								className="flex-1 px-4 py-3 text-white/50 font-medium rounded-xl border border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-50"
							>
								close
							</button>
							{onRestore && (
								<button
									type="button"
									onClick={onRestore}
									disabled={saving}
									className="flex-1 px-4 py-3 bg-[#d4b08c] text-[#0a0a0a] font-medium rounded-xl hover:bg-[#c9a57f] active:bg-[#be9a74] transition-colors disabled:opacity-50"
								>
									{saving ? "restoring..." : "restore"}
								</button>
							)}
							{onDelete && (
								<button
									type="button"
									onClick={onDelete}
									disabled={saving}
									className="px-4 py-3 text-red-400 font-medium rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 transition-colors disabled:opacity-50"
								>
									{saving ? "deleting..." : "delete forever"}
								</button>
							)}
						</>
					) : (
						<>
							{item && onDelete && (
								<button
									type="button"
									onClick={onDelete}
									disabled={saving}
									className="sm:mr-auto px-4 py-3 text-red-400 font-medium rounded-xl hover:bg-red-500/10 active:bg-red-500/20 transition-colors disabled:opacity-50"
								>
									{saving ? "deleting..." : "delete"}
								</button>
							)}
							<button
								type="button"
								onClick={handleClose}
								disabled={saving}
								className="flex-1 sm:flex-initial px-5 py-3 text-white/50 font-medium rounded-xl border border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-50"
							>
								cancel
							</button>
							<button
								type="submit"
								onClick={handleSubmit}
								disabled={saving}
								className="flex-1 sm:flex-initial px-6 py-3 bg-[#d4b08c] text-[#0a0a0a] font-medium rounded-xl hover:bg-[#c9a57f] active:bg-[#be9a74] transition-colors disabled:opacity-50"
							>
								{saving ? "saving..." : "save"}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

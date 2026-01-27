"use client";

import { useState, useEffect } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { VaultItem } from "./store";
import { fieldConfigs } from "./fields";
import { typeIcons, typeLabels } from "./icons";
import { PasswordField } from "./password";
import { TagInput } from "@/components/tags";

interface Props {
	item?: VaultItem | null;
	defaulttype?: ItemType;
	onSave: (data: { type: ItemType; title: string; data: Record<string, unknown>; tags: string[] }) => void;
	onDelete?: () => void;
	onRestore?: () => void;
	onClose: () => void;
	isTrash?: boolean;
}

const types: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export function ItemModal({ item, defaulttype, onSave, onDelete, onRestore, onClose, isTrash }: Props) {
	const [type, setType] = useState<ItemType>(item?.type || defaulttype || "login");
	const [title, setTitle] = useState(item?.title || "");
	const [data, setData] = useState<Record<string, unknown>>(item?.data || {});
	const [tags, setTags] = useState<string[]>(item?.tags || []);
	const generatorFields = ["password", "passphrase", "totp"];

	useEffect(() => {
		if (!item) setData({});
	}, [type, item]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		onSave({ type, title, data, tags });
	}

	const fields = fieldConfigs[type];
	const readOnly = isTrash && item;

	return (
		<div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 sm:p-4">
			<div className="bg-stone-900 rounded-t-xl sm:rounded-xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-stone-900 p-4 sm:p-6 border-b border-white/10 flex items-center justify-between z-10">
					<h2 className="text-lg sm:text-xl font-semibold">{isTrash ? "view item" : item ? "edit item" : "new item"}</h2>
					<button onClick={onClose} className="p-2 -mr-2 text-white/40 hover:text-white" aria-label="close">
						<svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
					{!item && (
						<div>
							<label className="block text-sm text-white/60 mb-2">type</label>
							<div className="grid grid-cols-4 gap-1.5 sm:gap-2">
								{types.map((t) => (
									<button
										key={t}
										type="button"
										onClick={() => setType(t)}
										className={`p-2 sm:p-3 rounded-lg flex flex-col items-center gap-1 transition-colors min-h-[52px] sm:min-h-[60px] ${
											type === t ? "bg-[#FF6B00] text-black" : "bg-white/5 hover:bg-white/10 active:bg-white/10"
										}`}
									>
										{typeIcons[t]}
										<span className="text-[10px] sm:text-xs">{t}</span>
									</button>
								))}
							</div>
						</div>
					)}
					<div>
						<label className="block text-sm text-white/60 mb-2">title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={typeLabels[type]}
							required
							readOnly={!!readOnly}
							className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B00] transition-colors read-only:opacity-60 text-base"
						/>
					</div>
					{fields.map((field) => (
						<div key={field.name}>
							<label className="block text-sm text-white/60 mb-2">{field.label}</label>
							{field.type === "textarea" ? (
								<textarea
									value={(data[field.name] as string) || ""}
									onChange={(e) => setData({ ...data, [field.name]: e.target.value })}
									required={field.required}
									readOnly={!!readOnly}
									rows={3}
									className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B00] transition-colors resize-none font-mono text-sm read-only:opacity-60"
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
									className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B00] transition-colors font-mono text-sm read-only:opacity-60"
								/>
							)}
						</div>
					))}
					<div>
						<label className="block text-sm text-white/60 mb-2">tags</label>
						<TagInput tags={tags} onChange={setTags} readOnly={!!readOnly} />
					</div>
					<div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 pb-safe">
						{isTrash && item ? (
							<>
								<button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors min-h-[48px]">
									close
								</button>
								{onRestore && (
									<button type="button" onClick={onRestore} className="flex-1 px-4 py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 active:bg-[#FF6B00]/80 transition-colors min-h-[48px]">
										restore
									</button>
								)}
								{onDelete && (
									<button type="button" onClick={onDelete} className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 active:bg-red-500/30 transition-colors min-h-[48px]">
										delete forever
									</button>
								)}
							</>
						) : (
							<>
								<button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors min-h-[48px]">
									cancel
								</button>
								<button type="submit" className="flex-1 px-4 py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 active:bg-[#FF6B00]/80 transition-colors min-h-[48px]">
									save
								</button>
								{item && onDelete && (
									<button type="button" onClick={onDelete} className="sm:flex-initial px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 active:bg-red-500/30 transition-colors min-h-[48px]">
										delete
									</button>
								)}
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

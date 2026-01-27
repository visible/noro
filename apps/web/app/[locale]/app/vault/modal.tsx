"use client";

import { useState, useEffect } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { VaultItem } from "./store";
import { fieldConfigs } from "./fields";
import { typeIcons, typeLabels } from "./icons";

interface Props {
	item?: VaultItem | null;
	onSave: (data: { type: ItemType; title: string; data: Record<string, unknown>; tags: string[] }) => void;
	onDelete?: () => void;
	onRestore?: () => void;
	onClose: () => void;
	isTrash?: boolean;
}

const types: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export function ItemModal({ item, onSave, onDelete, onRestore, onClose, isTrash }: Props) {
	const [type, setType] = useState<ItemType>(item?.type || "login");
	const [title, setTitle] = useState(item?.title || "");
	const [data, setData] = useState<Record<string, unknown>>(item?.data || {});
	const [tags, setTags] = useState(item?.tags.join(", ") || "");
	const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (!item) setData({});
	}, [type, item]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
		onSave({ type, title, data, tags: tagList });
	}

	const fields = fieldConfigs[type];
	const readOnly = isTrash && item;

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
			<div className="bg-stone-900 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
				<div className="p-6 border-b border-white/10 flex items-center justify-between">
					<h2 className="text-xl font-semibold">{isTrash ? "view item" : item ? "edit item" : "new item"}</h2>
					<button onClick={onClose} className="text-white/40 hover:text-white">
						<svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{!item && (
						<div>
							<label className="block text-sm text-white/60 mb-2">type</label>
							<div className="grid grid-cols-4 gap-2">
								{types.map((t) => (
									<button
										key={t}
										type="button"
										onClick={() => setType(t)}
										className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
											type === t ? "bg-[#FF6B00] text-black" : "bg-white/5 hover:bg-white/10"
										}`}
									>
										{typeIcons[t]}
										<span className="text-xs">{t}</span>
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
							className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B00] transition-colors read-only:opacity-60"
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
								<div className="relative">
									<input
										type={showPasswords[field.name] ? "text" : "password"}
										value={(data[field.name] as string) || ""}
										onChange={(e) => setData({ ...data, [field.name]: e.target.value })}
										required={field.required}
										readOnly={!!readOnly}
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-[#FF6B00] transition-colors font-mono text-sm read-only:opacity-60"
									/>
									<button
										type="button"
										onClick={() => setShowPasswords({ ...showPasswords, [field.name]: !showPasswords[field.name] })}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
									>
										{showPasswords[field.name] ? "hide" : "show"}
									</button>
								</div>
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
					{!readOnly && (
						<div>
							<label className="block text-sm text-white/60 mb-2">tags (comma separated)</label>
							<input
								type="text"
								value={tags}
								onChange={(e) => setTags(e.target.value)}
								placeholder="work, personal"
								className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF6B00] transition-colors"
							/>
						</div>
					)}
					<div className="flex gap-3 pt-4">
						{isTrash && item ? (
							<>
								{onDelete && (
									<button type="button" onClick={onDelete} className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors">
										delete forever
									</button>
								)}
								{onRestore && (
									<button type="button" onClick={onRestore} className="flex-1 px-4 py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
										restore
									</button>
								)}
								<button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
									close
								</button>
							</>
						) : (
							<>
								{item && onDelete && (
									<button type="button" onClick={onDelete} className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors">
										delete
									</button>
								)}
								<button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
									cancel
								</button>
								<button type="submit" className="flex-1 px-4 py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
									save
								</button>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

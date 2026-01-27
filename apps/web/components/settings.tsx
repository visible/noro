"use client";

interface RowProps {
	label: string;
	description?: string;
	children: React.ReactNode;
}

export function Row({ label, description, children }: RowProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-4 border-b border-white/5 last:border-0">
			<div className="flex-1">
				<p className="font-medium text-white">{label}</p>
				{description && <p className="text-sm text-white/50 mt-0.5">{description}</p>}
			</div>
			<div className="shrink-0">{children}</div>
		</div>
	);
}

interface ToggleProps {
	label: string;
	description?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}

export function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
	return (
		<Row label={label} description={description}>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				onClick={() => onChange(!checked)}
				className={`relative w-12 h-6 rounded-full transition-colors ${
					checked ? "bg-[#FF6B00]" : "bg-white/10"
				} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
						checked ? "translate-x-6" : ""
					}`}
				/>
			</button>
		</Row>
	);
}

interface SelectProps {
	label: string;
	description?: string;
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
}

export function Select({ label, description, value, options, onChange }: SelectProps) {
	return (
		<Row label={label} description={description}>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full sm:w-auto px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-colors"
			>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value} className="bg-stone-950 text-white">
						{opt.label}
					</option>
				))}
			</select>
		</Row>
	);
}

interface ButtonRowProps {
	label: string;
	description?: string;
	onClick: () => void;
	variant?: "default" | "danger";
	loading?: boolean;
}

export function ButtonRow({ label, description, onClick, variant = "default", loading }: ButtonRowProps) {
	const styles = {
		default: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
		danger: "bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400",
	};

	return (
		<button
			onClick={onClick}
			disabled={loading}
			className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${styles[variant]} disabled:opacity-50`}
		>
			<p className="font-medium">{loading ? "loading..." : label}</p>
			{description && (
				<p className={`text-sm mt-0.5 ${variant === "danger" ? "text-red-400/70" : "text-white/50"}`}>
					{description}
				</p>
			)}
		</button>
	);
}

interface SectionProps {
	title: string;
	description?: string;
	variant?: "default" | "danger";
	children: React.ReactNode;
}

export function Section({ title, description, variant = "default", children }: SectionProps) {
	return (
		<section className="mb-8">
			<div className="mb-4">
				<h2 className={`text-base font-semibold ${variant === "danger" ? "text-red-400" : "text-white"}`}>
					{title}
				</h2>
				{description && <p className="text-sm text-white/50 mt-1">{description}</p>}
			</div>
			{children}
		</section>
	);
}

interface CardProps {
	children: React.ReactNode;
	variant?: "default" | "danger";
}

export function Card({ children, variant = "default" }: CardProps) {
	const styles = {
		default: "bg-white/5 border border-white/10",
		danger: "bg-red-500/10 border border-red-500/20",
	};
	return <div className={`rounded-xl px-5 ${styles[variant]}`}>{children}</div>;
}

interface InputProps {
	label: string;
	description?: string;
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "email" | "password";
	placeholder?: string;
	disabled?: boolean;
}

export function Input({ label, description, value, onChange, type = "text", placeholder, disabled }: InputProps) {
	return (
		<Row label={label} description={description}>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className="w-full sm:w-48 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-colors disabled:opacity-50"
			/>
		</Row>
	);
}

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
			<div className="absolute inset-0 bg-black/70" onClick={onClose} />
			<div className="relative bg-stone-950 border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[85vh] overflow-y-auto shadow-xl">
				<h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
				{children}
			</div>
		</div>
	);
}

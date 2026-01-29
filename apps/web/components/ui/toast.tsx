"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

type Variant = "success" | "error" | "info";

interface Toast {
	id: string;
	title: string;
	description?: string;
	variant: Variant;
}

interface ToastContextValue {
	toasts: Toast[];
	toast: (options: Omit<Toast, "id">) => void;
	dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
	toasts: [],
	toast: () => {},
	dismiss: () => {},
});

export function useToast() {
	const context = useContext(ToastContext);
	return { toast: context.toast, dismiss: context.dismiss };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const toast = useCallback((options: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { ...options, id }]);
	}, []);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ toasts, toast, dismiss }}>
			{children}
		</ToastContext.Provider>
	);
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
	const [exiting, setExiting] = useState(false);
	const timerRef = useRef<NodeJS.Timeout>(null);

	useEffect(() => {
		timerRef.current = setTimeout(() => {
			setExiting(true);
		}, 5000);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	useEffect(() => {
		if (exiting) {
			const timer = setTimeout(onDismiss, 200);
			return () => clearTimeout(timer);
		}
	}, [exiting, onDismiss]);

	function handleDismiss() {
		setExiting(true);
	}

	const icons: Record<Variant, React.ReactNode> = {
		success: (
			<svg aria-hidden="true" className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
				<path d="M20 6L9 17l-5-5" />
			</svg>
		),
		error: (
			<svg aria-hidden="true" className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
				<path d="M18 6L6 18M6 6l12 12" />
			</svg>
		),
		info: (
			<svg aria-hidden="true" className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4M12 8h.01" />
			</svg>
		),
	};

	const bgColors: Record<Variant, string> = {
		success: "bg-emerald-500/10",
		error: "bg-red-500/10",
		info: "bg-blue-500/10",
	};

	return (
		<div
			role="alert"
			aria-live="polite"
			className={`flex items-start gap-3 w-80 p-4 bg-[#161616] border border-white/10 rounded-xl shadow-lg transition-all duration-200 ${
				exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
			}`}
		>
			<div className={`flex-shrink-0 w-8 h-8 rounded-lg ${bgColors[toast.variant]} flex items-center justify-center`}>
				{icons[toast.variant]}
			</div>
			<div className="flex-1 min-w-0 pt-0.5">
				<p className="text-sm font-medium text-white">{toast.title}</p>
				{toast.description && (
					<p className="text-sm text-white/50 mt-0.5">{toast.description}</p>
				)}
			</div>
			<button
				onClick={handleDismiss}
				className="flex-shrink-0 p-1 -mr-1 -mt-1 hover:bg-white/5 rounded-lg transition-colors"
				aria-label="dismiss"
			>
				<svg aria-hidden="true" className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
					<path d="M18 6L6 18M6 6l12 12" />
				</svg>
			</button>
		</div>
	);
}

export function Toaster() {
	const { toasts, dismiss } = useContext(ToastContext);

	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-4 right-4 z-50 flex flex-col gap-3" aria-label="notifications">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
			))}
		</div>
	);
}

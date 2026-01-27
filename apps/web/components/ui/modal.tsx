"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	closeOnBackdrop?: boolean;
}

export function Modal({ open, onClose, children, closeOnBackdrop = true }: ModalProps) {
	const overlayref = useRef<HTMLDivElement>(null);
	const contentref = useRef<HTMLDivElement>(null);
	const previousfocus = useRef<HTMLElement | null>(null);

	const handlekeydown = useCallback((e: globalThis.KeyboardEvent) => {
		if (e.key === "Escape") {
			e.preventDefault();
			onClose();
		}
		if (e.key === "Tab" && contentref.current) {
			const focusable = contentref.current.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last?.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first?.focus();
			}
		}
	}, [onClose]);

	useEffect(() => {
		if (open) {
			previousfocus.current = document.activeElement as HTMLElement;
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handlekeydown);
			const firstfocusable = contentref.current?.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			firstfocusable?.focus();
		} else {
			document.body.style.overflow = "";
			previousfocus.current?.focus();
		}
		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handlekeydown);
		};
	}, [open, handlekeydown]);

	function handlebackdrop(e: React.MouseEvent) {
		if (closeOnBackdrop && e.target === overlayref.current) onClose();
	}

	if (!open) return null;

	return createPortal(
		<div
			ref={overlayref}
			onClick={handlebackdrop}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
		>
			<div
				ref={contentref}
				role="dialog"
				aria-modal="true"
				className="relative bg-stone-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
			>
				{children}
			</div>
		</div>,
		document.body
	);
}

interface ModalHeaderProps {
	children: ReactNode;
	onClose?: () => void;
}

export function ModalHeader({ children, onClose }: ModalHeaderProps) {
	return (
		<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
			<h2 className="text-lg font-semibold text-white">{children}</h2>
			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className="text-white/40 hover:text-white transition-colors p-1 -mr-1"
				>
					<svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	);
}

interface ModalContentProps {
	children: ReactNode;
}

export function ModalContent({ children }: ModalContentProps) {
	return <div className="px-6 py-4">{children}</div>;
}

interface ModalFooterProps {
	children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
	return (
		<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
			{children}
		</div>
	);
}

interface ModalCloseProps {
	onClose: () => void;
}

export function ModalClose({ onClose }: ModalCloseProps) {
	return (
		<button
			type="button"
			onClick={onClose}
			className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1"
		>
			<svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	);
}

interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "danger";
	loading?: boolean;
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "confirm",
	cancelLabel = "cancel",
	variant = "default",
	loading = false,
}: ConfirmDialogProps) {
	const styles = {
		default: "bg-[#FF6B00] text-black hover:opacity-80",
		danger: "bg-red-500 text-white hover:bg-red-600",
	};

	return (
		<Modal open={open} onClose={onClose}>
			<ModalHeader onClose={onClose}>{title}</ModalHeader>
			<ModalContent>
				<p className="text-white/60">{message}</p>
			</ModalContent>
			<ModalFooter>
				<button
					type="button"
					onClick={onClose}
					disabled={loading}
					className="px-4 py-2 text-sm bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors disabled:opacity-50"
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					onClick={onConfirm}
					disabled={loading}
					className={`px-4 py-2 text-sm rounded-lg transition-all disabled:opacity-50 ${styles[variant]}`}
				>
					{loading ? "loading..." : confirmLabel}
				</button>
			</ModalFooter>
		</Modal>
	);
}

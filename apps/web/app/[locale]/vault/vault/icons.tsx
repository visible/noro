import type { ItemType } from "@/lib/generated/prisma/enums";

const paths: Record<ItemType, string> = {
	login: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
	note: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
	card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
	identity: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
	ssh: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
	api: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
	otp: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
	passkey: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
};

function TypeIcon({ type, size = "md" }: { type: ItemType; size?: "sm" | "md" | "lg" }) {
	const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
	return (
		<svg
			aria-hidden="true"
			className={sizes[size]}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[type]} />
		</svg>
	);
}

export const typeIcons: Record<ItemType, React.ReactNode> = {
	login: <TypeIcon type="login" />,
	note: <TypeIcon type="note" />,
	card: <TypeIcon type="card" />,
	identity: <TypeIcon type="identity" />,
	ssh: <TypeIcon type="ssh" />,
	api: <TypeIcon type="api" />,
	otp: <TypeIcon type="otp" />,
	passkey: <TypeIcon type="passkey" />,
};

export const typeIconsSmall: Record<ItemType, React.ReactNode> = {
	login: <TypeIcon type="login" size="sm" />,
	note: <TypeIcon type="note" size="sm" />,
	card: <TypeIcon type="card" size="sm" />,
	identity: <TypeIcon type="identity" size="sm" />,
	ssh: <TypeIcon type="ssh" size="sm" />,
	api: <TypeIcon type="api" size="sm" />,
	otp: <TypeIcon type="otp" size="sm" />,
	passkey: <TypeIcon type="passkey" size="sm" />,
};

export const typeIconsLarge: Record<ItemType, React.ReactNode> = {
	login: <TypeIcon type="login" size="lg" />,
	note: <TypeIcon type="note" size="lg" />,
	card: <TypeIcon type="card" size="lg" />,
	identity: <TypeIcon type="identity" size="lg" />,
	ssh: <TypeIcon type="ssh" size="lg" />,
	api: <TypeIcon type="api" size="lg" />,
	otp: <TypeIcon type="otp" size="lg" />,
	passkey: <TypeIcon type="passkey" size="lg" />,
};

export const typeLabels: Record<ItemType, string> = {
	login: "logins",
	note: "notes",
	card: "cards",
	identity: "identities",
	ssh: "ssh keys",
	api: "api keys",
	otp: "otp codes",
	passkey: "passkeys",
};

export const typeColors: Record<ItemType, string> = {
	login: "bg-blue-100 text-blue-600",
	note: "bg-amber-100 text-amber-600",
	card: "bg-emerald-100 text-emerald-600",
	identity: "bg-violet-100 text-violet-600",
	ssh: "bg-slate-100 text-slate-600",
	api: "bg-rose-100 text-rose-600",
	otp: "bg-cyan-100 text-cyan-600",
	passkey: "bg-fuchsia-100 text-fuchsia-600",
};

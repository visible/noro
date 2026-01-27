import { forwardRef } from "react";

type Status = "success" | "warning" | "error" | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	status?: Status;
}

const styles: Record<Status, string> = {
	success: "bg-green-100 text-green-700 border-green-200",
	warning: "bg-amber-100 text-amber-700 border-amber-200",
	error: "bg-red-100 text-red-700 border-red-200",
	info: "bg-blue-100 text-blue-700 border-blue-200",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
	({ className = "", status = "info", ...props }, ref) => (
		<span
			ref={ref}
			className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${styles[status]} ${className}`}
			{...props}
		/>
	)
);
Badge.displayName = "Badge";

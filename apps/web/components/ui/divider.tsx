import { forwardRef } from "react";

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
	orientation?: "horizontal" | "vertical";
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
	({ className = "", orientation = "horizontal", ...props }, ref) => (
		<hr
			ref={ref}
			className={`border-gray-200 ${
				orientation === "vertical"
					? "h-full w-px border-l"
					: "w-full border-t"
			} ${className}`}
			{...props}
		/>
	)
);
Divider.displayName = "Divider";

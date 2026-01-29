import { forwardRef } from "react";

type Variant = "default" | "bordered" | "elevated";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: Variant;
}

const variants: Record<Variant, string> = {
	default: "bg-white border border-gray-200",
	bordered: "bg-white border-2 border-gray-200",
	elevated: "bg-white border border-gray-200 shadow-lg",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
	({ className = "", variant = "default", ...props }, ref) => (
		<div
			ref={ref}
			className={`rounded-xl ${variants[variant]} ${className}`}
			{...props}
		/>
	)
);
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className = "", ...props }, ref) => (
		<div
			ref={ref}
			className={`flex flex-col gap-1.5 p-6 ${className}`}
			{...props}
		/>
	)
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
	({ className = "", ...props }, ref) => (
		<h3
			ref={ref}
			className={`text-lg font-semibold text-gray-900 ${className}`}
			{...props}
		/>
	)
);
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
	({ className = "", ...props }, ref) => (
		<p
			ref={ref}
			className={`text-sm text-gray-500 ${className}`}
			{...props}
		/>
	)
);
CardDescription.displayName = "CardDescription";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
	({ className = "", ...props }, ref) => (
		<div
			ref={ref}
			className={`px-6 pb-6 ${className}`}
			{...props}
		/>
	)
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
	({ className = "", ...props }, ref) => (
		<div
			ref={ref}
			className={`flex items-center px-6 pb-6 pt-0 ${className}`}
			{...props}
		/>
	)
);
CardFooter.displayName = "CardFooter";

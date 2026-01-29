import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface PageLoaderProps {
	className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
	return (
		<div
			className={cn(
				"flex h-full min-h-[400px] w-full items-center justify-center",
				className
			)}
		>
			<Spinner size="lg" className="text-muted-foreground" />
		</div>
	);
}

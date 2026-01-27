import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-muted",
				className
			)}
		/>
	);
}

interface SkeletonTextProps {
	lines?: number;
	className?: string;
}

export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={i}
					className={cn(
						"h-4",
						i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
					)}
				/>
			))}
		</div>
	);
}

interface SkeletonAvatarProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

const avatarSizes = {
	sm: "h-8 w-8",
	md: "h-10 w-10",
	lg: "h-12 w-12",
};

export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
	return (
		<Skeleton
			className={cn(
				"rounded-full",
				avatarSizes[size],
				className
			)}
		/>
	);
}

interface SkeletonCardProps {
	className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
	return (
		<div
			className={cn(
				"rounded-lg border border-border p-4 space-y-3",
				className
			)}
		>
			<Skeleton className="h-5 w-1/3" />
			<SkeletonText lines={2} />
			<div className="flex gap-2 pt-2">
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-8 w-20" />
			</div>
		</div>
	);
}

interface SkeletonTableProps {
	rows?: number;
	columns?: number;
	className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
	return (
		<div className={cn("w-full space-y-3", className)}>
			<div className="flex gap-4 border-b border-border pb-3">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={i} className="h-4 flex-1" />
				))}
			</div>
			{Array.from({ length: rows }).map((_, row) => (
				<div key={row} className="flex gap-4 py-2">
					{Array.from({ length: columns }).map((_, col) => (
						<Skeleton key={col} className="h-4 flex-1" />
					))}
				</div>
			))}
		</div>
	);
}

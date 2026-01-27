import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes, type ReactNode } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(({ className = "", ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table ref={ref} className={`w-full text-sm ${className}`} {...props} />
  </div>
));
Table.displayName = "Table";

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className = "", ...props }, ref) => (
  <thead ref={ref} className={`bg-white/5 ${className}`} {...props} />
));
TableHeader.displayName = "TableHeader";

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className = "", ...props }, ref) => (
  <tbody ref={ref} className={`divide-y divide-white/5 ${className}`} {...props} />
));
TableBody.displayName = "TableBody";

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({ className = "", ...props }, ref) => (
  <tr ref={ref} className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${className}`} {...props} />
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(({ className = "", ...props }, ref) => (
  <th ref={ref} className={`h-11 px-4 text-left align-middle text-xs font-medium text-white/40 tracking-wider uppercase ${className}`} {...props} />
));
TableHead.displayName = "TableHead";

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(({ className = "", ...props }, ref) => (
  <td ref={ref} className={`px-4 py-3 align-middle text-white/80 ${className}`} {...props} />
));
TableCell.displayName = "TableCell";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && <div className="mb-4 text-white/20">{icon}</div>}
      <h3 className="text-sm font-medium text-white/60 mb-1">{title}</h3>
      {description && <p className="text-xs text-white/30 text-center max-w-sm mb-4">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

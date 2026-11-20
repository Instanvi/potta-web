'use client';
import { TableSkeleton } from '@potta/components/ui/loaders';

/** Loading placeholder for tables (components/table.tsx progressComponent). */
const CustomLoader = ({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) => (
  <TableSkeleton rows={rows} columns={columns} />
);

export default CustomLoader;

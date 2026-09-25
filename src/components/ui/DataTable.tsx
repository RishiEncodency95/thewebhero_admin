import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  // Opt-in client-side pagination — slices the already-fetched `data` array.
  // Omit for existing callers to keep today's "render everything" behavior.
  pageSize?: number;
}

// `T extends object` (not `Record<string, unknown>`) deliberately — a plain
// interface like `{ _id: string; name: string }` does not structurally
// satisfy a `Record<string, unknown>` generic constraint (TS requires an
// explicit index signature for that), even though every property is
// unknown-compatible. Property access below goes through an internal cast
// instead, so callers keep their real, precise types.
function asRecord(item: object): Record<string, unknown> {
  return item as Record<string, unknown>;
}

function rowKey(item: object, index: number): string {
  const record = asRecord(item);
  const id = record._id ?? record.id;
  return typeof id === 'string' ? id : String(index);
}

function cellValue(item: object, key: string): React.ReactNode {
  const value = asRecord(item)[key];
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  return String(value);
}

export function DataTable<T extends object>({
  data,
  columns,
  emptyMessage = "No results found.",
  onRowClick,
  pageSize,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the underlying data set changes (e.g. a filter
  // or type switch) so the user doesn't land on a now out-of-range page.
  // Adjusting state during render (not in an effect) per React's guidance on
  // resetting state when a prop changes — avoids an extra render pass.
  const [prevData, setPrevData] = useState(data);
  if (data !== prevData) {
    setPrevData(data);
    setPage(1);
  }

  const totalPages = pageSize ? Math.max(1, Math.ceil(data.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const pageData = pageSize ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize) : data;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
            {columns.map((col) => (
              <TableHead key={col.key} className="h-11 text-[11px] font-semibold uppercase tracking-wider text-slate-500 first:pl-5 last:pr-5">
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Inbox className="h-6 w-6" />
                  <span className="text-[13px]">{emptyMessage}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((item, i) => (
              <TableRow
                key={rowKey(item, i)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`border-slate-100 ${onRowClick ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/60"}`}
              >
                {columns.map((col) => (
                  <TableCell key={`${rowKey(item, i)}-${col.key}`} className="py-3 text-[13px] text-slate-700 first:pl-5 last:pr-5">
                    {col.render ? col.render(item) : cellValue(item, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pageSize && data.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-[12px] text-slate-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-lg" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button size="sm" variant="outline" className="rounded-lg" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type Table as TableInstance,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  /** Stable id getter so React keys + selection survive sort/filter. */
  getRowId: (row: T) => string;
  /** Click handler for a whole row (e.g. open drawer). */
  onRowClick?: (row: T) => void;
  /** Initial sort. */
  initialSorting?: SortingState;
  /** Initial page size. Set to 0 to disable pagination. */
  pageSize?: number;
  /** Placeholder shown when filters return nothing. */
  emptyMessage?: string;
  /** Optional global search across all columns marked with enableGlobalFilter. */
  searchable?: boolean;
  /** Toolbar extras rendered to the right of the search input. */
  toolbarRight?: React.ReactNode;
};

export function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  initialSorting = [],
  pageSize = 25,
  emptyMessage = "No rows match your filters.",
  searchable = true,
  toolbarRight,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: pageSize > 0 ? getPaginationRowModel() : undefined,
    initialState: pageSize > 0 ? { pagination: { pageSize } } : undefined,
    globalFilterFn: "includesString",
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const showPagination = pageSize > 0 && totalRows > pageSize;

  return (
    <div className="space-y-3">
      {(searchable || toolbarRight) ? (
        <div className="flex items-center gap-2">
          {searchable ? (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search…"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-9 w-full rounded-full border border-hairline bg-surface-raised pl-9 pr-4 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
              />
            </div>
          ) : null}
          {toolbarRight ? <div className="ml-auto flex items-center gap-2">{toolbarRight}</div> : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-hairline bg-surface-raised shadow-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-hairline bg-surface-subtle/60">
                {hg.headers.map((header) => {
                  const sortDir = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const canFilter = header.column.getCanFilter();
                  const meta = header.column.columnDef.meta as { className?: string; align?: "left" | "right" | "center" } | undefined;
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted align-bottom",
                        meta?.align === "right" && "text-right",
                        meta?.align === "center" && "text-center",
                        meta?.className,
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div className={cn("flex flex-col gap-1", meta?.align === "right" && "items-end")}>
                          {canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="group inline-flex items-center gap-1 text-ink-muted hover:text-ink transition-colors"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {sortDir === "asc" ? (
                                <ChevronUp className="size-3" />
                              ) : sortDir === "desc" ? (
                                <ChevronDown className="size-3" />
                              ) : (
                                <ChevronsUpDown className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          ) : (
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                          )}
                          {canFilter ? (
                            <ColumnFilter column={header.column} />
                          ) : null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getAllLeafColumns().length} className="px-5 py-10 text-center text-[13px] text-ink-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <DataRow key={row.id} row={row} onClick={onRowClick} />
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between gap-3 border-t border-hairline px-5 py-3 text-[12px] text-ink-muted">
          <span>
            {totalRows} {totalRows === 1 ? "row" : "rows"}
          </span>
          {showPagination ? <Pagination table={table} /> : null}
        </div>
      </div>
    </div>
  );
}

function DataRow<T>({ row, onClick }: { row: Row<T>; onClick?: (row: T) => void }) {
  const clickable = !!onClick;
  return (
    <tr
      onClick={clickable ? () => onClick!(row.original) : undefined}
      className={cn(
        "border-b border-hairline last:border-0 transition-colors",
        clickable && "cursor-pointer hover:bg-surface-subtle/60",
      )}
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta as { className?: string; align?: "left" | "right" | "center" } | undefined;
        return (
          <td
            key={cell.id}
            className={cn(
              "px-5 py-3.5 align-middle",
              meta?.align === "right" && "text-right",
              meta?.align === "center" && "text-center",
              meta?.className,
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}

function Pagination<T>({ table }: { table: TableInstance<T> }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="grid size-7 place-items-center rounded-md border border-hairline text-ink-muted disabled:opacity-40 hover:bg-surface-subtle disabled:hover:bg-transparent"
      >
        <ChevronLeft className="size-3.5" />
      </button>
      <span className="tabular-nums">
        Page {pageIndex + 1} of {pageCount || 1}
      </span>
      <button
        type="button"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="grid size-7 place-items-center rounded-md border border-hairline text-ink-muted disabled:opacity-40 hover:bg-surface-subtle disabled:hover:bg-transparent"
      >
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Per-column filter UI ────────────────────────────────────────────────────
// Columns opt-in by setting meta.filter: 'text' | 'select'. Select pulls
// distinct values from the live data so admins get an Excel-style dropdown
// without having to enumerate options manually.

type ColumnMetaFilter = "text" | "select";

type ColumnLike = {
  id: string;
  getFilterValue: () => unknown;
  setFilterValue: (v: unknown) => void;
  getFacetedUniqueValues: () => Map<unknown, number>;
  columnDef: { meta?: { filter?: ColumnMetaFilter; filterPlaceholder?: string } };
};

function ColumnFilter({ column }: { column: ColumnLike }) {
  const filterKind = column.columnDef.meta?.filter;
  if (!filterKind) return null;
  if (filterKind === "text") return <TextFilter column={column} />;
  if (filterKind === "select") return <SelectFilter column={column} />;
  return null;
}

function TextFilter({ column }: { column: ColumnLike }) {
  const value = (column.getFilterValue() as string) ?? "";
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder={column.columnDef.meta?.filterPlaceholder ?? "filter…"}
      onClick={(e) => e.stopPropagation()}
      className="h-6 w-full max-w-[140px] rounded border border-hairline bg-surface px-1.5 text-[11px] font-normal normal-case tracking-normal text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-accent"
    />
  );
}

function SelectFilter({ column }: { column: ColumnLike }) {
  const value = (column.getFilterValue() as string) ?? "";
  const options = useMemo(() => {
    const set = column.getFacetedUniqueValues();
    return [...set.keys()]
      .filter((v) => v !== null && v !== undefined && v !== "")
      .map((v) => String(v))
      .sort();
  }, [column]);

  return (
    <select
      value={value}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      onClick={(e) => e.stopPropagation()}
      className="h-6 w-full max-w-[140px] rounded border border-hairline bg-surface px-1 text-[11px] font-normal normal-case tracking-normal text-ink focus:outline-none focus:border-accent"
    >
      <option value="">all</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

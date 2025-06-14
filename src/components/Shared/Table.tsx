import React, { useEffect, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@mantine/core";

export interface ColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
  icon?: React.ReactNode;
}

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className="h-4 w-4 rounded border-gray-300 text-[#E85913] focus:ring-[#E85913] disabled:cursor-not-allowed"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  fetchMore?: () => void;
  hasMore?: boolean;
  rowKey: (row: T) => string | number;
  scrollHeight?: string | number;
  showSelection?: boolean;
  showIndex?: boolean;
  selectedRows?: T[];
  onSelectedRowsChange?: (rows: T[]) => void;
  infiniteScroll?: boolean;
  tableTitle?: string;
  rowHeight?: number;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
}

export function Table<T>({
  data,
  columns,
  fetchMore,
  hasMore = false,
  rowKey,
  scrollHeight = "500px",
  showSelection = false,
  showIndex = false,
  selectedRows: externalSelectedRows,
  onSelectedRowsChange,
  infiniteScroll = false,
  tableTitle,
  rowHeight = 50,
  isFetchingNextPage,
  isLoading,
}: TableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<T[]>([]);
  const selectedRows = externalSelectedRows ?? internalSelected;
  const setSelectedRows =
    onSelectedRowsChange ?? ((rows: T[]) => setInternalSelected(rows));

  const selectionColumn: ColumnDef<T> = {
    id: "select",
    header: ({ table }) => {
      const allRows = table.getRowModel().rows;
      const isAllSelected = allRows.every((row) =>
        selectedRows.includes(row.original)
      );
      const isNoneSelected = allRows.every(
        (row) => !selectedRows.includes(row.original)
      );

      return (
        <IndeterminateCheckbox
          checked={!isNoneSelected && isAllSelected}
          indeterminate={!isNoneSelected && !isAllSelected}
          onChange={(e) =>
            setSelectedRows(e.target.checked ? allRows.map((r) => r.original) : [])
          }
        />
      );
    },
    cell: ({ row }) => {
      const original = row.original;
      const isSelected = selectedRows.includes(original);

      return (
        <IndeterminateCheckbox
          checked={isSelected}
          onChange={(e) => {
            setSelectedRows(
              e.target.checked
                ? [...selectedRows, original]
                : selectedRows.filter((d) => d !== original)
            );
          }}
        />
      );
    },
    enableSorting: false,
    size: 40,
  };

  const indexColumn: ColumnDef<T> = {
    id: "index",
    header: "#",
    cell: (info) => <p className="pl-3">{info.row.index + 1}</p>,
    enableSorting: false,
    size: 40,
    meta: {
      cellClassName: "text-[#9C9C9C]",
      headerClassName: "text-[#9C9C9C] pl-3 text-center",
    },
  };

  let finalColumns = [...columns];
  if (showIndex) finalColumns = [indexColumn, ...finalColumns];
  if (showSelection) finalColumns = [selectionColumn, ...finalColumns];

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
  });

//   const scrollableId = "scrollable-forecast-table";

  const tableElement = (
    <div
    //   id={scrollableId}
    //   style={{ height: scrollHeight, overflowY: infiniteScroll ? "auto" : undefined }}
      className="rounded border border-[#E0E0E0] shadow bg-white"
    >
      <table className="w-full">
        <thead className="bg-[#F9F9F9] text-left text-[#5B5B5B] text-xs">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                return (
                  <th
                    key={header.id}
                    className={`border-b border-[#E0E0E0] ${meta?.headerClassName ?? ""}`}
                    style={meta?.headerStyle}
                  >
                    <div className="flex items-center gap-1 pl-3 py-3">
                      {meta?.icon && <span>{meta.icon}</span>}
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        {isLoading && (
           <tr>
           <td colSpan={table.getHeaderGroups()?.[0]?.headers?.length} className="py-4 text-center">
             <Loader size="sm" />
           </td>
         </tr>
        )}
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={rowKey(row.original)}
              className="border-b border-b-[#EAECF0] hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                return (
                  <td
                    key={cell.id}
                    className={`pl-3 py-3 ${meta?.cellClassName ?? ""}`}
                    style={{ width: cell.column.getSize(), ...meta?.cellStyle }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {tableTitle && <h2 className="text-sm font-semibold text-[#202020] mb-2">{tableTitle}</h2>}

      {infiniteScroll ? (
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore ?? (() => {})}
          hasMore={hasMore}
        //   height={400}
        //   scrollableTarget={scrollableId}
          loader={
            isFetchingNextPage ?
            <div className="text-center py-4">
              <Loader size="sm" />
            </div> : null
          }
          endMessage={
            !isFetchingNextPage && !isLoading && !hasMore ? (
            <div className="text-center text-gray-500 py-4">
              No more data to load.
            </div>) : null
          }
        >
          {tableElement}
        </InfiniteScroll>
      ) : (
        tableElement
      )}
    </div>
  );
}
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[];
  items: T[];
  loading: boolean;
  editPathFor: (item: T) => string;
  onDelete: (item: T) => void;
}

export default function DataTable<T extends { id: number }>({ columns, items, loading, editPathFor, onDelete }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <i className="ri-loader-4-line w-6 h-6 flex items-center justify-center animate-spin text-primary-500 text-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="py-16 text-center text-sm text-foreground-500">Hech qanday yozuv topilmadi.</div>;
  }

  return (
    <div className="overflow-x-auto border border-background-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-background-100 border-b border-background-200">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-semibold text-foreground-700 whitespace-nowrap">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-background-200 last:border-0 hover:bg-background-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-foreground-800 align-top">
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    to={editPathFor(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-foreground-500 hover:bg-background-200 hover:text-primary-600 cursor-pointer"
                    title="Tahrirlash"
                  >
                    <i className="ri-pencil-line" />
                  </Link>
                  <button
                    onClick={() => onDelete(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-foreground-500 hover:bg-accent-50 hover:text-accent-600 cursor-pointer"
                    title="O'chirish"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

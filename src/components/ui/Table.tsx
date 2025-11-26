import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}
export function Table<T extends {
  id: string;
}>({
  data,
  columns,
  emptyMessage = 'داده‌ای یافت نشد'
}: TableProps<T>) {
  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-500">{emptyMessage}</div>;
  }
  return <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map(column => <th key={column.key} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                {column.header}
              </th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(item => <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {columns.map(column => <td key={column.key} className={`px-4 py-4 text-sm text-gray-900 ${column.className || ''}`}>
                  {column.render(item)}
                </td>)}
            </tr>)}
        </tbody>
      </table>
    </div>;
}

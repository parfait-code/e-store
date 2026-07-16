// components/admin/TableSkeleton.tsx
export function TableRowsSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-100 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                className="h-4 animate-pulse rounded bg-gray-200"
                style={{ width: c === 0 ? "70%" : "50%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

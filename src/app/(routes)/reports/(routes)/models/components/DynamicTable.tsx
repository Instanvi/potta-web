import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Column = {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
};

type RowData = {
  [key: string]: any;
  children?: RowData[];
};

type DynamicTableProps = {
  columns: Column[];
  data: RowData[];
  highlightRow?: (row: any) => boolean;
  sectionHeaderKey?: string; // e.g. 'isHeader'
};

const INDENT_SIZE = 24;

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  highlightRow,
  sectionHeaderKey,
}) => {
  // Track expanded state for each row by index path (e.g., '0', '0-1', etc.)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Helper to toggle expanded state
  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to determine if a row is the last visible row (for sticky total)
  const getLastHighlightRowKey = (
    rows: RowData[],
    parentKey = ''
  ): string | null => {
    let lastKey: string | null = null;
    const traverse = (rows: RowData[], parentKey = '') => {
      rows.forEach((row, idx) => {
        const key = parentKey ? `${parentKey}-${idx}` : `${idx}`;
        if (highlightRow && highlightRow(row)) {
          lastKey = key;
        }
        if (Array.isArray(row.children) && row.children.length > 0) {
          traverse(row.children as RowData[], key);
        }
      });
    };
    traverse(rows, parentKey);
    return lastKey;
  };
  const lastHighlightKey = getLastHighlightRowKey(data);

  // Recursive row renderer
  const renderRows = (
    rows: RowData[],
    level = 0,
    parentKey = ''
  ): React.ReactNode => {
    return rows.map((row, idx) => {
      const key = parentKey ? `${parentKey}-${idx}` : `${idx}`;
      const hasChildren =
        Array.isArray(row.children) && row.children.length > 0;
      const isExpanded = expanded[key];
      if (sectionHeaderKey && row[sectionHeaderKey]) {
        return (
          <tr key={key}>
            <td
              colSpan={columns.length}
              className="px-6 py-3 bg-gray-50 font-medium text-gray-700 border-b"
              style={{ fontStyle: 'italic' }}
            >
              {row.label}
            </td>
          </tr>
        );
      }
      const isStickyTotal =
        highlightRow && highlightRow(row) && key === lastHighlightKey;
      return (
        <React.Fragment key={key}>
          <tr
            className={`${
              highlightRow && highlightRow(row)
                ? 'bg-green-50 font-medium'
                : level % 2 === 0
                ? 'bg-white'
                : 'bg-gray-50'
            } ${
              isStickyTotal
                ? 'sticky bottom-0 z-20 border-t-2 border-green-400 bg-green-50'
                : ''
            }`}
          >
            {columns.map((col, colIdx) => (
              <td
                key={col.key}
                className={`px-6 py-3 border-b ${
                  colIdx !== columns.length - 1 ? 'border-r' : ''
                } ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                } whitespace-nowrap${
                  col.key === 'label' ? ` pl-${level * 6}` : ''
                }`}
                style={
                  col.key === 'label'
                    ? { paddingLeft: INDENT_SIZE * level + 8 }
                    : {}
                }
              >
                {col.key === 'label' ? (
                  <span className="flex items-center">
                    {hasChildren ? (
                      <button
                        type="button"
                        className="mr-2 focus:outline-none flex items-center  p-1 transition-colors"
                        onClick={() => toggleExpand(key)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    ) : level > 0 ? (
                      <span className="inline-block w-4" />
                    ) : null}
                    <span>
                      {row[col.key] !== undefined ? row[col.key] : ''}
                    </span>
                  </span>
                ) : row[col.key] !== undefined ? (
                  row[col.key]
                ) : (
                  ''
                )}
              </td>
            ))}
          </tr>
          {hasChildren &&
            isExpanded &&
            renderRows(row.children, level + 1, key)}
        </React.Fragment>
      );
    });
  };

  return (
    <table className="w-full border border-gray-300 bg-white shadow-sm">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((col, i) => (
            <th
              key={col.key}
              className={`px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider border-b ${
                col.align === 'right' ? 'text-right' : 'text-left'
              } ${i !== columns.length - 1 ? 'border-r' : ''}`}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{renderRows(data)}</tbody>
    </table>
  );
};

export default DynamicTable;

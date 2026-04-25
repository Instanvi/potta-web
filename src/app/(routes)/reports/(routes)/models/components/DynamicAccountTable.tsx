import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface DynamicAccountTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
  cell?: (row: any) => React.ReactNode;
}

export interface DynamicAccountTableRow {
  [key: string]: any;
  children?: DynamicAccountTableRow[];
  highlight?: boolean;
}

interface DynamicAccountTableProps {
  columns: DynamicAccountTableColumn[];
  data: DynamicAccountTableRow[];
  minHeight?: string;
  maxHeight?: string;
}

const INDENT_SIZE = 24;

const DynamicAccountTable: React.FC<DynamicAccountTableProps> = ({
  columns,
  data,
  minHeight = '350px',
  maxHeight = 'calc(92vh - 80px)',
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (rowKey: string) => {
    setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
  };

  // Recursive function to render rows
  const renderRows = (
    rows: DynamicAccountTableRow[],
    level = 0,
    parentKey = '',
    isLastLevel = false
  ) => {
    return rows.map((row, idx) => {
      const key = parentKey ? `${parentKey}-${idx}` : `${idx}`;
      const hasChildren = row.children && row.children.length > 0;
      const isExpanded = expandedRows[key] || false;
      const isLastRow = isLastLevel && idx === rows.length - 1;
      const rowClass =
        row.highlight && isLastRow
          ? 'sticky bottom-0 z-20 bg-green-50 font-medium border-t-2 border-green-400'
          : row.highlight
          ? 'bg-green-50 font-medium border-t-2 border-green-400'
          : level % 2 === 0
          ? 'bg-white'
          : 'bg-gray-50';
      return (
        <React.Fragment key={key}>
          <tr
            className={`h-14 px-3 transition-colors duration-200 ${rowClass} ${
              row.highlight && isLastRow
                ? 'text-md border-t border-green-400'
                : ''
            }`}
            onClick={hasChildren ? () => toggleRowExpansion(key) : undefined}
            style={
              row.highlight && isLastRow
                ? { cursor: 'default' }
                : hasChildren
                ? { cursor: 'pointer' }
                : {}
            }
          >
            {columns.map((col, colIdx) => (
              <td
                key={col.key}
                className={`py-2 px-4 truncate ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                } font-medium ${colIdx === 0 ? 'flex items-center' : ''}`}
                style={
                  colIdx === 0
                    ? { paddingLeft: `${level * INDENT_SIZE}px` }
                    : {}
                }
              >
                {colIdx === 0 ? (
                  <>
                    {hasChildren ? (
                      <span className="mr-2 flex items-center">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                      </span>
                    ) : (
                      <span className="inline-block w-6 mr-2" />
                    )}
                    <span className="truncate">
                      {col.cell ? col.cell(row) : row[col.key]}
                    </span>
                  </>
                ) : col.cell ? (
                  col.cell(row)
                ) : (
                  row[col.key]
                )}
              </td>
            ))}
          </tr>
          {hasChildren &&
            isExpanded &&
            renderRows(row.children!, level + 1, key)}
        </React.Fragment>
      );
    });
  };

  // Find if the last row is a highlight (e.g., Net Profit)
  const isLastRowHighlight = data.length > 0 && data[data.length - 1].highlight;

  return (
    <div className="w-full border border-gray-300 bg-white">
      <div
        className="overflow-y-auto"
        style={{ minHeight, maxHeight, position: 'relative' }}
      >
        <table className="w-full table-fixed">
          <colgroup>
            {columns.map((col, i) => (
              <col key={col.key} style={{ width: col.width || undefined }} />
            ))}
          </colgroup>
          <thead className="bg-green-50 h-16 border border-gray-200 sticky top-0 z-10">
            <tr className="text-md border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2 px-4 text-gray-800 font-medium ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {renderRows(data, 0, '', isLastRowHighlight)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicAccountTable;

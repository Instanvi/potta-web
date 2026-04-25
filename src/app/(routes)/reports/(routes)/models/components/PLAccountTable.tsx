import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PLRow {
  label: string;
  value?: number;
  percent?: number;
  highlight?: boolean;
  children?: PLRow[];
}

interface PLAccountTableProps {
  data: PLRow[];
}

const INDENT_SIZE = 24;

const PLAccountTable: React.FC<PLAccountTableProps> = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Toggle row expansion
  const toggleRowExpansion = (rowKey: string) => {
    setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
  };

  // Recursive function to render rows
  const renderRows = (rows: PLRow[], level = 0, parentKey = '') => {
    return rows.map((row, idx) => {
      const key = parentKey ? `${parentKey}-${idx}` : `${idx}`;
      const hasChildren = row.children && row.children.length > 0;
      const isExpanded = expandedRows[key] || false;
      return (
        <React.Fragment key={key}>
          <tr
            className={`h-14 transition-colors duration-200 ${
              row.highlight
                ? 'bg-green-50 font-medium border-t-2 border-green-400'
                : level % 2 === 0
                ? 'bg-white'
                : 'bg-gray-50'
            }`}
          >
            <td
              className="py-2 px-4 flex items-center truncate"
              style={{ paddingLeft: `${level * INDENT_SIZE}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className="mr-2 focus:outline-none flex items-center hover:bg-gray-100 rounded-full p-1 transition-colors"
                  onClick={() => toggleRowExpansion(key)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              ) : (
                <span className="inline-block w-6 mr-2" />
              )}
              <span className="truncate font-medium text-gray-800">
                {row.label}
              </span>
            </td>
            <td className="py-2 px-4 truncate text-right font-medium">
              {row.value !== undefined
                ? `${row.value.toLocaleString()} FCFA`
                : ''}
            </td>
            <td className="py-2 px-4 truncate text-right font-medium">
              {row.percent !== undefined ? `${row.percent.toFixed(1)}%` : ''}
            </td>
          </tr>
          {hasChildren &&
            isExpanded &&
            renderRows(row.children!, level + 1, key)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="w-full border border-gray-300 bg-white">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: '38%' }} />
          <col style={{ width: '32%' }} />
          <col style={{ width: '30%' }} />
        </colgroup>
        <thead className="bg-green-50 h-16 border border-gray-200">
          <tr className="text-lg border-gray-200">
            <th className="text-left font-medium py-2 px-4 text-gray-800">
              Description
            </th>
            <th className="text-right py-2 px-4 text-gray-800">
              Amount (FCFA)
            </th>
            <th className="text-right py-2 px-4 text-gray-800">% of Revenue</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">{renderRows(data)}</tbody>
      </table>
    </div>
  );
};

export default PLAccountTable;

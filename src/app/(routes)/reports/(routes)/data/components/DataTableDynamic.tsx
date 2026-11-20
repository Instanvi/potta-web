import React from 'react';
import MyTable from '@potta/components/table';

interface DataTableDynamicProps {
  data: any[];
  minHeight?: string;
  maxHeight?: string;
}

const DataTableDynamic: React.FC<DataTableDynamicProps> = ({
  data,
  minHeight,
  maxHeight,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">No data available</div>
    );
  }

  // Infer columns from the keys of the first row
  const keys = Object.keys(data[0]);
  const columns = keys.map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    selector: (row: any) => row[key],
    sortable: true,
  }));

  return (
    <MyTable
      columns={columns}
      data={data}
      minHeight={minHeight || '300px'}
      maxHeight={maxHeight || '400px'}
      pagination={true}
      
    />
  );
};

export default DataTableDynamic;

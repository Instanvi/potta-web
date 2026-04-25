import React from 'react';

const ShiftBoxes = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Total Shifts</h3>
        <p className="text-3xl font-medium text-green-600">15</p>
        <div className="mt-2 text-sm text-gray-500">Active shift patterns</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Employees Assigned</h3>
        <p className="text-3xl font-medium text-green-600">42</p>
        <div className="mt-2 text-sm text-gray-500">Across all shifts</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Average Hours</h3>
        <p className="text-3xl font-medium text-green-600">8.5</p>
        <div className="mt-2 text-sm text-gray-500">Per shift</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Weekend Shifts</h3>
        <p className="text-3xl font-medium text-green-600">4</p>
        <div className="mt-2 text-sm text-gray-500">Saturday/Sunday</div>
      </div>
    </div>
  );
};

export default ShiftBoxes;
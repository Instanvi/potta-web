'use client';
import React, { useState, useEffect } from 'react';
import RootLayout from '../layout';
import DateNavigation from '../payroll/timesheet/components/DateNavigation';
import Boxes from './components/Boxes';
import DashboardContent from './components/DashboardContent';
import { ContextData } from '@potta/components/providers/DataProvider';
const Payment = () => {
  // State for date navigation
  const [cycleTab, setCycleTab] = useState('Daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const context = React.useContext(ContextData);
  // Handle date range changes based on cycle tab
  useEffect(() => {
    const today = new Date(selectedDate);
    setDateRange({ start: today, end: today });
  }, [cycleTab, selectedDate]);

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
        } pr-5 mt-10`}
      >
        {/* Time cycle tabs and date navigation */}
        <DateNavigation
          cycleTab={cycleTab}
          setCycleTab={setCycleTab}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <Boxes />
        <DashboardContent />
      </div>
    </RootLayout>
  );
};
export default Payment;

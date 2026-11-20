'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import Slider from '@potta/components/slideover';
import { toast } from 'react-hot-toast';
import { useCreatePTOPolicy } from '../hooks/useCreatePTOPolicy';
import CustomDatePicker from '@potta/components/customDatePicker';
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
import moment from 'moment';
import {
  useGetPTOPolicy,
  useAccrueLeave,
  useRequestLeave,
  useResetPTOCycle,
} from '../hooks/usePTOActions';

interface PTODetailSliderProps {
  ptoId: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PTODetailSlider: React.FC<PTODetailSliderProps> = ({
  ptoId,
  open,
  setOpen,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [accrualAmount, setAccrualAmount] = useState('');
  const [leaveRequest, setLeaveRequest] = useState({
    days: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const { mutate: getPTOPolicy, data: ptoData, isLoading } = useGetPTOPolicy();
  const { mutate: accrueLeave, isLoading: isAccruing } = useAccrueLeave();
  const { mutate: requestLeave, isLoading: isRequesting } = useRequestLeave();
  const { mutate: resetCycle, isLoading: isResetting } = useResetPTOCycle();

  // Fetch PTO details when slider opens
  useEffect(() => {
    if (open && ptoId) {
      console.log('Fetching PTO details for ID:', ptoId);
      getPTOPolicy(ptoId);
    }
  }, [open, ptoId, getPTOPolicy]);

  // Debug logs
  useEffect(() => {
    console.log('PTODetailSlider - open:', open);
    console.log('PTODetailSlider - ptoId:', ptoId);
    console.log('PTODetailSlider - ptoData:', ptoData);
  }, [open, ptoId, ptoData]);

  const pto = ptoData?.data;

  const handleInputChange = (field: string) => (e: any) => {
    if (field === 'accrualAmount') {
      setAccrualAmount(e.target.value);
    } else {
      setLeaveRequest((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    }
  };

  const handleAccrueLeave = () => {
    if (!accrualAmount || !ptoId) {
      toast.error('Please enter an accrual amount');
      return;
    }

    const amount = parseFloat(accrualAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    accrueLeave(
      { id: ptoId, amount },
      {
        onSuccess: () => {
          toast.success('Leave accrued successfully');
          setAccrualAmount('');
          // Refresh PTO data
          getPTOPolicy(ptoId);
        },
        onError: (error) => {
          console.error('Error accruing leave:', error);
          toast.error('Failed to accrue leave');
        },
      }
    );
  };

  const handleRequestLeave = () => {
    if (
      !leaveRequest.days ||
      !leaveRequest.startDate ||
      !leaveRequest.endDate
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const days = parseFloat(leaveRequest.days);
    if (isNaN(days) || days <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    if (!ptoId) {
      toast.error('PTO ID not found');
      return;
    }

    requestLeave(
      {
        id: ptoId,
        days,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
      },
      {
        onSuccess: () => {
          toast.success('Leave request submitted successfully');
          setLeaveRequest({
            days: '',
            startDate: '',
            endDate: '',
            reason: '',
          });
          // Refresh PTO data
          getPTOPolicy(ptoId);
        },
        onError: (error) => {
          console.error('Error requesting leave:', error);
          toast.error('Failed to submit leave request');
        },
      }
    );
  };

  const handleResetCycle = () => {
    if (!ptoId) {
      toast.error('PTO ID not found');
      return;
    }

    resetCycle(
      { id: ptoId },
      {
        onSuccess: () => {
          toast.success('PTO cycle reset successfully');
          // Refresh PTO data
          getPTOPolicy(ptoId);
        },
        onError: (error) => {
          console.error('Error resetting cycle:', error);
          toast.error('Failed to reset PTO cycle');
        },
      }
    );
  };

  // Helper functions for date handling
  const getStartDate = () => {
    return leaveRequest.startDate
      ? new CalendarDate(
          new Date(leaveRequest.startDate).getFullYear(),
          new Date(leaveRequest.startDate).getMonth() + 1,
          new Date(leaveRequest.startDate).getDate()
        )
      : null;
  };

  const getEndDate = () => {
    return leaveRequest.endDate
      ? new CalendarDate(
          new Date(leaveRequest.endDate).getFullYear(),
          new Date(leaveRequest.endDate).getMonth() + 1,
          new Date(leaveRequest.endDate).getDate()
        )
      : null;
  };

  const handleStartDateChange = (date: CalendarDate | null) => {
    setLeaveRequest((prev) => ({
      ...prev,
      startDate: date ? date.toString() : '',
    }));
  };

  const handleEndDateChange = (date: CalendarDate | null) => {
    setLeaveRequest((prev) => ({
      ...prev,
      endDate: date ? date.toString() : '',
    }));
  };

  // Helper functions for display
  const getPTOTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      VACATION: 'Paid Time Off',
      SICK: 'Sick Time Off',
      MATERNITY: 'Maternity Leave',
      PATERNITY: 'Paternity Leave',
      CUSTOM: 'Custom Leave',
    };
    return typeMap[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VACATION':
        return <i className="ri-sun-line text-orange-500"></i>;
      case 'SICK':
        return <i className="ri-heart-pulse-line text-red-500"></i>;
      case 'MATERNITY':
        return <i className="ri-women-line text-pink-500"></i>;
      case 'PATERNITY':
        return <i className="ri-user-heart-line text-blue-500"></i>;
      case 'CUSTOM':
        return <i className="ri-calendar-event-line text-purple-500"></i>;
      default:
        return <i className="ri-calendar-line text-gray-500"></i>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      SUSPENDED: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Suspended',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.INACTIVE;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatCycleType = (cycle: string) => {
    const cycleMap = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      YEARLY: 'Yearly',
    };
    return cycleMap[cycle as keyof typeof cycleMap] || cycle;
  };

  const getUsagePercentage = () => {
    if (!pto) return 0;
    const total = parseFloat(pto.total_entitled_days);
    const used = parseFloat(pto.days_used);
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <Slider
      edit={false}
      title={pto ? `PTO: ${getPTOTypeName(pto.type)}` : 'PTO Details'}
      open={open}
      setOpen={setOpen}
      closeButton={false}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading PTO details...</p>
          </div>
        </div>
      ) : pto ? (
        <div className="p-6 space-y-6 w-full max-w-5xl">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                {getTypeIcon(pto.type)}
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  {getPTOTypeName(pto.type)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatCycleType(pto.cycle_type)} • {pto.accrual_rate} days
                  per cycle
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(pto.status)}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PTO Information */}
            <div className="bg-white border border-gray-200  p-5">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <i className="ri-information-line mr-2 text-blue-600"></i>
                PTO Information
              </h4>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Type
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {getPTOTypeName(pto.type)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Cycle Type
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatCycleType(pto.cycle_type)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Accrual Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 mt-1">
                    {pto.accrual_rate} days/cycle
                  </dd>
                </div>
              </dl>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white border border-gray-200  p-5">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <i className="ri-bar-chart-line mr-2 text-green-600"></i>
                Usage Statistics
              </h4>
              <div className="space-y-4">
                <div className="text-center py-3">
                  <div className="text-3xl font-medium text-gray-900 mb-1">
                    {pto.days_remaining}
                  </div>
                  <p className="text-xs text-gray-500">Days Remaining</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Usage</span>
                    <span>{getUsagePercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(getUsagePercentage(), 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{pto.days_used} used</span>
                    <span>{pto.total_entitled_days} total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="bg-white border border-gray-200  p-5">
              <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                <i className="ri-calendar-line mr-2 text-orange-600"></i>
                Date Information
              </h4>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Start Date
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {moment(pto.start_date).format('MMM DD, YYYY')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    End Date
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {moment(pto.end_date).format('MMM DD, YYYY')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Duration
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {moment(pto.end_date).diff(moment(pto.start_date), 'days')}{' '}
                    days
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Actions Section */}
          <div className="bg-white border border-gray-200  p-5">
            <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
              <i className="ri-settings-3-line mr-2 text-purple-600"></i>
              Administrative Actions
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Accrue Leave */}
              <div className="space-y-3 md:col-span-2">
                <h5 className="text-sm font-medium text-gray-900">
                  Accrue Leave
                </h5>
                <div className="flex space-x-2">
                  <Input
                    name="accrualAmount"
                    type="number"
                    placeholder="Enter number of days to accrue"
                    value={accrualAmount}
                    onchange={handleInputChange('accrualAmount')}
                    className="flex-1"
                  />
                  <Button
                    text={isAccruing ? 'Processing...' : 'Accrue Leave'}
                    type="button"
                    onClick={handleAccrueLeave}
                    disabled={isAccruing || !accrualAmount}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Add additional days to the current PTO balance
                </p>
              </div>

              {/* Reset Cycle */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-900">
                  Reset Cycle
                </h5>
                <Button
                  text={isResetting ? 'Processing...' : 'Reset Cycle'}
                  type="button"
                  onClick={handleResetCycle}
                  disabled={isResetting}
                />
                <p className="text-xs text-gray-500">
                  Reset PTO tracking for a new cycle
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h5 className="text-sm font-medium text-gray-900 mb-3">
                Quick Stats
              </h5>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {moment(pto.createdAt).format('MMM DD, YYYY')}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {moment(pto.updatedAt).format('MMM DD, YYYY')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No PTO data found</p>
        </div>
      )}
    </Slider>
  );
};

export default PTODetailSlider;

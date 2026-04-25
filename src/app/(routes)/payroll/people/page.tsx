'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import RootLayout from '../../layout';
import Button from '@potta/components/button';
import CustomLoader from '@potta/components/loader';
import DynamicFilter from '@potta/components/dynamic-filter';
import Slider from '@potta/components/slideover';
import dynamic from 'next/dynamic';
import EmployeeTable, { Employee } from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import ConfirmationModal from './components/ConfirmationModal';
import { useEmployeeAPI } from './hooks/useEmployeeAPI';
import { DEFAULT_PAGE_SIZE, STORAGE_KEYS } from './constants';
import { ContextData } from '@potta/components/providers/DataProvider';

const EmployeeDetailsPage = dynamic(() => import('./[id]/page'), {
  ssr: false,
});

const People = () => {
  const context = React.useContext(ContextData);
  const [showModal, setShowModal] = useState(false);
  const [modalAnimation, setModalAnimation] = useState('animate-slide-in-top');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [employeeToDeleteName, setEmployeeToDeleteName] = useState<string>('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const {
    employees: allEmployees,
    isFetching,
    currentPage,
    totalPages,
    pageSize,
    fetchEmployees,
    deleteEmployee,
    handlePageChange,
    updateFilters,
    filters,
  } = useEmployeeAPI();

  // Client-side filtering for department and location
  const filteredEmployees = React.useMemo(() => {
    let filtered = allEmployees;

    // Filter by department (if available in employee data)
    if (departmentFilter !== 'all') {
      // Note: This assumes department info is available in employee data
      // You may need to adjust based on actual data structure
      filtered = filtered.filter((employee) =>
        employee.employment_type
          ?.toLowerCase()
          .includes(departmentFilter.toLowerCase())
      );
    }

    // Filter by location (if available in employee data)
    if (locationFilter !== 'all') {
      // Note: This assumes location info is available in employee data
      // You may need to adjust based on actual data structure
      filtered = filtered.filter((employee) => {
        const city = employee.address?.city?.toLowerCase() || '';
        const country = employee.address?.country?.toLowerCase() || '';
        return (
          city.includes(locationFilter.toLowerCase()) ||
          country.includes(locationFilter.toLowerCase())
        );
      });
    }

    return filtered;
  }, [allEmployees, departmentFilter, locationFilter]);

  const employees = filteredEmployees;

  // Update filters when they change
  useEffect(() => {
    updateFilters({
      searchTerm,
      statusFilter,
      employmentTypeFilter,
      departmentFilter,
      locationFilter,
    });
  }, [
    updateFilters,
    searchTerm,
    statusFilter,
    employmentTypeFilter,
    departmentFilter,
    locationFilter,
  ]);

  // Filter options
  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const employmentTypeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Temporary', value: 'temporary' },
    { label: 'Intern', value: 'intern' },
  ];

  const departmentOptions = [
    { label: 'All Departments', value: 'all' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Sales', value: 'sales' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'HR', value: 'hr' },
    { label: 'Finance', value: 'finance' },
    { label: 'Operations', value: 'operations' },
    { label: 'Customer Support', value: 'customer-support' },
  ];

  const locationOptions = [
    { label: 'All Locations', value: 'all' },
    { label: 'Remote', value: 'remote' },
    { label: 'Office', value: 'office' },
    { label: 'Hybrid', value: 'hybrid' },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      icon: <i className="ri-user-line text-gray-500"></i>,
      options: statusOptions,
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      key: 'employmentType',
      label: 'Employment Type',
      icon: <i className="ri-briefcase-line text-gray-500"></i>,
      options: employmentTypeOptions,
      value: employmentTypeFilter,
      onChange: setEmploymentTypeFilter,
    },
  ];

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setEmploymentTypeFilter('all');
    setDepartmentFilter('all');
    setLocationFilter('all');
  };

  // Handle employee actions
  const handleViewEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    setDetailsOpen(true);
  };

  const handleEditEmployee = (id: string) => {
    // Set the person ID for editing and open modal
    console.log('🔵 Edit button clicked for employee:', id);
    localStorage.setItem('potta_personId', id);
    console.log(
      '🔵 PersonId set in localStorage:',
      localStorage.getItem('potta_personId')
    );
    setIsEditMode(true);
    handleOpenModal();
  };

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployeeId(employee.uuid);
    setDetailsOpen(true);
  };

  // Modal handlers
  const handleOpenModal = () => {
    setModalAnimation('animate-slide-in-top');
    setShowModal(true);
  };

  const handleNewEmployee = () => {
    // Clear any saved data for new employee
    localStorage.removeItem('potta_personId');
    setIsEditMode(false);
    handleOpenModal();
  };

  const handleCloseModal = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    setModalAnimation('animate-slide-out-top');
    setTimeout(() => {
      setShowModal(false);
      setIsEditMode(false); // Reset edit mode on close
      // Clear localStorage on close
      const storageKeys = [
        STORAGE_KEYS.PERSON_ID,
        STORAGE_KEYS.ACTIVE_STEP,
        STORAGE_KEYS.BASE_INFO,
        STORAGE_KEYS.ADDRESS,
        STORAGE_KEYS.BANK_ACCOUNT,
        STORAGE_KEYS.COMPENSATION,
        STORAGE_KEYS.SCHEDULE,
        STORAGE_KEYS.BENEFIT,
        STORAGE_KEYS.TAX_INFO,
      ];
      storageKeys.forEach((key) => localStorage.removeItem(key));
    }, 300);
  };

  const handleCancelClose = () => {
    setShowConfirmModal(false);
  };

  // Delete confirmation handlers
  const handleDeleteEmployee = (id: string) => {
    const employee = employees.find((emp) => emp.uuid === id);
    const employeeName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : 'this employee';

    setEmployeeToDelete(id);
    setEmployeeToDeleteName(employeeName);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      await deleteEmployee(employeeToDelete);
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      setEmployeeToDeleteName('');
      // No need to manually refresh - React Query will handle it automatically
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
    setEmployeeToDeleteName('');
  };

  const closeModalWithoutConfirmation = () => {
    setModalAnimation('animate-slide-out-top');
    setTimeout(() => {
      setShowModal(false);
      setIsEditMode(false); // Reset edit mode on close
      // Clear localStorage on close
      const storageKeys = [
        STORAGE_KEYS.PERSON_ID,
        STORAGE_KEYS.ACTIVE_STEP,
        STORAGE_KEYS.BASE_INFO,
        STORAGE_KEYS.ADDRESS,
        STORAGE_KEYS.BANK_ACCOUNT,
        STORAGE_KEYS.COMPENSATION,
        STORAGE_KEYS.SCHEDULE,
        STORAGE_KEYS.BENEFIT,
        STORAGE_KEYS.TAX_INFO,
      ];
      storageKeys.forEach((key) => localStorage.removeItem(key));
    }, 300);
  };

  const handleModalComplete = () => {
    setIsEditMode(false); // Reset edit mode
    closeModalWithoutConfirmation();
    // No need to manually refresh - React Query will handle it automatically
  };

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'w-full p-5 pl-12' : 'w-full p-5'
        }`}
      >
        <div className="mb-6">
          <DynamicFilter
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
            searchPlaceholder="Search employees..."
            filters={filterConfigs}
            className="mb-4"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-600">
                Showing {employees.length} employee
                {employees.length !== 1 ? 's' : ''}
              </div>
              {(searchTerm ||
                statusFilter !== 'all' ||
                employmentTypeFilter !== 'all' ||
                departmentFilter !== 'all' ||
                locationFilter !== 'all') && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
                >
                  <i className="ri-refresh-line"></i>
                  Clear All Filters
                </button>
              )}
            </div>
            <Button
              text="New Employee"
              type="button"
              icon={<i className="ri-file-add-line"></i>}
              className="whitespace-nowrap"
              onClick={handleNewEmployee}
            />
          </div>
        </div>

        {isFetching ? (
          <CustomLoader />
        ) : (
          <EmployeeTable
            employees={employees}
            onViewEmployee={handleViewEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onRowClick={handleRowClick}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        showModal={showModal}
        modalAnimation={modalAnimation}
        onClose={handleCloseModal}
        onComplete={handleModalComplete}
      />

      {/* Employee Details Slideover */}
      <Slider
        edit={false}
        title="Employee Details"
        open={detailsOpen}
        setOpen={setDetailsOpen}
        noPanelScroll={true}
      >
        {selectedEmployeeId && (
          <EmployeeDetailsPage
            key={selectedEmployeeId}
            employeeId={selectedEmployeeId}
          />
        )}
      </Slider>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        message="Are you sure you want to close? Any unsaved changes will be lost."
        confirmText="Close Anyway"
        cancelText="Keep Editing"
        type="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employeeToDeleteName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Modal animations */}
      <style jsx global>{`
        @keyframes slideInTop {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slideOutTop {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-100%);
          }
        }

        .animate-slide-in-top {
          animation: slideInTop 0.3s ease-out forwards;
        }

        .animate-slide-out-top {
          animation: slideOutTop 0.3s ease-in forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </RootLayout>
  );
};

export default People;

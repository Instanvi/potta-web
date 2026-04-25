import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { peopleApi } from '../utils/api';
import { FilterParams, PersonPayload } from '../utils/types';
import { Employee } from '../components/EmployeeTable';

export const useEmployeeAPI = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: 'all',
    employmentTypeFilter: 'all',
    departmentFilter: 'all',
    locationFilter: 'all',
  });

  // React Query for fetching employees
  const {
    data: employeesData,
    isLoading: isFetching,
    error,
    refetch: fetchEmployees,
  } = useQuery({
    queryKey: ['employees', currentPage, pageSize, filters],
    queryFn: async () => {
      const filterParams: FilterParams = {
        page: currentPage,
        pageSize: pageSize,
        sortBy: 'firstName',
        sortDirection: 'asc',
      };

      // Add search term
      if (filters.searchTerm) {
        filterParams.searchTerm = filters.searchTerm;
      }

      // Add status filter
      if (filters.statusFilter && filters.statusFilter !== 'all') {
        filterParams.isActive = filters.statusFilter === 'active';
      }

      // Add employment type filter
      if (
        filters.employmentTypeFilter &&
        filters.employmentTypeFilter !== 'all'
      ) {
        filterParams.employmentType = filters.employmentTypeFilter;
      }

      const response = await peopleApi.filterPersons(filterParams);

      if (response && response.data) {
        return {
          employees: response.data,
          meta: response.meta || {
            totalPages: 1,
            currentPage: currentPage,
            totalItems: response.data.length,
          },
        };
      } else {
        throw new Error('Failed to parse employee data');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const employees = employeesData?.employees || [];
  const totalPages = employeesData?.meta?.totalPages || 1;

  // React Query mutation for creating employee
  const createPersonMutation = useMutation({
    mutationFn: async (payload: PersonPayload) => {
      console.log('Sending payload to create person:', payload);
      const result = await peopleApi.createPerson(payload);
      console.log('Person created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      toast.success('Employee created successfully!');
      // Invalidate and refetch employees query
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      return data.uuid;
    },
    onError: (error: any) => {
      console.error('Error creating person:', error);
      toast.error('Failed to create employee. Please try again.');
    },
  });

  // React Query mutation for updating employee
  const updatePersonMutation = useMutation({
    mutationFn: async ({
      personId,
      payload,
    }: {
      personId: string;
      payload: PersonPayload;
    }) => {
      console.log('Sending payload to update person:', payload);
      await peopleApi.updatePerson(personId, payload);
    },
    onSuccess: () => {
      toast.success('Employee updated successfully!');
      // Invalidate and refetch employees query
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      console.error('Error updating person:', error);
      toast.error('Failed to update employee. Please try again.');
    },
  });

  // React Query mutation for deleting employee
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      await peopleApi.deletePerson(id);
    },
    onSuccess: () => {
      toast.success('Employee deleted successfully');
      // Invalidate and refetch employees query
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    },
  });

  // Wrapper functions to maintain the same API
  const createPerson = useCallback(
    async (payload: PersonPayload) => {
      const result = await createPersonMutation.mutateAsync(payload);
      return result?.uuid;
    },
    [createPersonMutation]
  );

  const updatePerson = useCallback(
    async (personId: string, payload: PersonPayload) => {
      await updatePersonMutation.mutateAsync({ personId, payload });
      return true;
    },
    [updatePersonMutation]
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      await deleteEmployeeMutation.mutateAsync(id);
    },
    [deleteEmployeeMutation]
  );

  const getPersonData = useCallback(async (personId: string) => {
    if (!personId) return null;

    try {
      const data = await peopleApi.getPerson(personId);
      console.log('Fetched person data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching person data:', error);
      toast.error('Failed to load employee data');
      return null;
    }
  }, []);

  const getBankAccounts = useCallback(async (personId: string) => {
    try {
      console.log('Fetching bank accounts for person:', personId);
      const bankAccountsResponse = await peopleApi.getBankAccounts(personId);
      console.log('Fetched bank accounts:', bankAccountsResponse);
      return bankAccountsResponse.data || bankAccountsResponse;
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      throw error;
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  return {
    employees,
    isFetching,
    currentPage,
    totalPages,
    pageSize,
    fetchEmployees,
    deleteEmployee,
    createPerson,
    updatePerson,
    getPersonData,
    getBankAccounts,
    handlePageChange,
    setPageSize,
    updateFilters,
    filters,
  };
};

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { employeeApi, employeeKeys, type EmployeeListParams } from '../utils/api';

const useGetEmployees = (params: EmployeeListParams) =>
  useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeApi.list(params),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export default useGetEmployees;

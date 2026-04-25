import { useQuery } from '@tanstack/react-query';
import { getBill } from '../../utils/api';

export default function useGetBill(id: string) {
  return useQuery({
    queryKey: ['bill', id],
    queryFn: () => getBill(id),
    enabled: !!id,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '../utils/api';

export function useDisposeAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      disposal_date,
      sale_price,
    }: {
      id: string;
      disposal_date: string;
      sale_price: number;
    }) => assetApi.dispose(id, disposal_date, sale_price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

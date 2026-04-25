import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../_utils/api';

const useImportProductsCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['import-products-csv'],
    mutationFn: (params: { file?: File; s3Key?: string }) =>
      productApi.importCsv(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] });
    },
  });
};

export default useImportProductsCsv;

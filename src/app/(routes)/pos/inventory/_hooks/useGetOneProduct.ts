import { useQuery } from '@tanstack/react-query';
import { productApi } from '../_utils/api';
import { Product } from '../_utils/types';

const useGetOneProduct = (product_id:string ) => {
  return useQuery({
    queryKey: ['get-one-product', product_id],
      queryFn: async () => {
          const response = await productApi.getOne(product_id);
          return response as unknown as Product;
        }
  });
};

export default useGetOneProduct;

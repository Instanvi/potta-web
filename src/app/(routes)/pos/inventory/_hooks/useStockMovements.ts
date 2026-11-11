import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  stockMovementsApi,
  type CreateAdjustmentPayload,
  type CreateReturnPayload,
  type MovementListParams,
} from '../_utils/stockMovementsApi';

export const useProductReturns = (params: MovementListParams) =>
  useQuery({
    queryKey: ['product-returns', params],
    queryFn: () => stockMovementsApi.listReturns(params),
  });

export const useProductAdjustments = (params: MovementListParams) =>
  useQuery({
    queryKey: ['product-adjustments', params],
    queryFn: () => stockMovementsApi.listAdjustments(params),
  });

/** Every movement can change stock levels, so the product list is refreshed too. */
const useMovementMutation = <TArg, TResult>(listKey: string, fn: (arg: TArg) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [listKey] });
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] });
    },
  });
};

export const useCreateReturn = () =>
  useMovementMutation('product-returns', (p: CreateReturnPayload) => stockMovementsApi.createReturn(p));
export const useProcessReturn = () =>
  useMovementMutation('product-returns', (id: string) => stockMovementsApi.processReturn(id));
export const useRejectReturn = () =>
  useMovementMutation('product-returns', (id: string) => stockMovementsApi.rejectReturn(id));

export const useCreateAdjustment = () =>
  useMovementMutation('product-adjustments', (p: CreateAdjustmentPayload) => stockMovementsApi.createAdjustment(p));
export const useApplyAdjustment = () =>
  useMovementMutation('product-adjustments', (id: string) => stockMovementsApi.applyAdjustment(id));
export const useRejectAdjustment = () =>
  useMovementMutation('product-adjustments', (id: string) => stockMovementsApi.rejectAdjustment(id));

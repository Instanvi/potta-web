import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customerApi } from '../../../customers/utils/api';
import { vendorApi } from '../../../vendors/utils/api';
import {
  DateRangeParams,
  SubLedgerKind,
  ledgerApi,
  ledgerKeys,
} from '../utils/api';
import { GeneralLedgerPage, SubLedgerEntry } from '../utils/types';

export interface GeneralLedgerParams extends DateRangeParams {
  page: number;
  limit: number;
}

export const useGeneralLedger = (params: GeneralLedgerParams) =>
  useQuery({
    queryKey: ledgerKeys.general(params),
    queryFn: () =>
      ledgerApi.general({
        ...params,
        sortBy: 'transactionDate:DESC',
      } as GeneralLedgerParams) as Promise<GeneralLedgerPage>,
    placeholderData: keepPreviousData,
  });

export const useAgingReport = (type: SubLedgerKind, asOfDate: string) =>
  useQuery({
    queryKey: ledgerKeys.aging(type, asOfDate),
    queryFn: () => ledgerApi.agingReport(type, asOfDate),
  });

/** The aging report returns the customer/vendor id; the sub-ledger id lives on that record. */
export const useSubLedgerIdForReference = (
  type: SubLedgerKind,
  referenceId: string | null
) =>
  useQuery({
    queryKey: [...ledgerKeys.all, 'sub-ledger-ref', type, referenceId] as const,
    queryFn: async () => {
      const record: any =
        type === 'AR'
          ? await customerApi.getOne(referenceId!)
          : await vendorApi.getOne(referenceId!);
      return (record?.subLedgerId as string | undefined) ?? null;
    },
    enabled: !!referenceId,
  });

export const useSubLedgerTransactions = (
  subLedgerId: string | null | undefined,
  params: DateRangeParams = {}
) =>
  useQuery({
    queryKey: [...ledgerKeys.all, 'sub-ledgers', subLedgerId, 'transactions', params] as const,
    queryFn: () =>
      ledgerApi.subLedgerTransactions(subLedgerId!, params) as Promise<SubLedgerEntry[]>,
    enabled: !!subLedgerId,
  });

export const useSubLedgerBalance = (subLedgerId: string | null | undefined) =>
  useQuery({
    queryKey: [...ledgerKeys.all, 'sub-ledgers', subLedgerId, 'balance'] as const,
    queryFn: () =>
      ledgerApi.subLedgerBalance(subLedgerId!) as Promise<{
        currentBalance: number;
        lastTransactionDate: string | null;
      }>,
    enabled: !!subLedgerId,
  });

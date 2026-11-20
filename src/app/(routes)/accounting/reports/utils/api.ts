/**
 * Reports reuse the shared ledger client (/ledgers/balance-sheet, /ledgers/income-statement).
 * Response shapes mirror potta-backend GeneralLedgerService.
 */
export { ledgerApi as reportsApi, ledgerKeys as reportKeys } from '../../ledger/utils/api';

export interface BalanceSheetReport {
  assets: Record<string, number>;
  liabilities: Record<string, number>;
  equity: Record<string, number>;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

export interface IncomeStatementReport {
  incomes: Record<string, number>;
  expenses: Record<string, number>;
  netProfitLoss: number;
}

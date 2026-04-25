import { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import {
  hasPermission,
  getResourcePermissions,
  hasRole,
  getUserRoles,
  isAdmin,
} from '../utils/permissions';

export const usePermissions = () => {
  const context = useContext(ContextData);
  const userPermissions = context?.data?.userPermissions || [];

  return {
    // Permission checking
    can: (resourceName: string, action: string) =>
      hasPermission(userPermissions, resourceName, action),

    // Resource permissions
    getResourcePermissions: (resourceName: string) =>
      getResourcePermissions(userPermissions, resourceName),

    // Role checking
    hasRole: (roleName: string) => hasRole(userPermissions, roleName),
    getUserRoles: () => getUserRoles(userPermissions),
    isAdmin: () => isAdmin(userPermissions),

    // Raw permissions data
    userPermissions,

    // Common permission checks
    canCreateInvoice: () => hasPermission(userPermissions, 'Invoice', 'create'),
    canViewInvoice: () => hasPermission(userPermissions, 'Invoice', 'view'),
    canUpdateInvoice: () => hasPermission(userPermissions, 'Invoice', 'update'),
    canDeleteInvoice: () => hasPermission(userPermissions, 'Invoice', 'remove'),
    canApproveInvoice: () =>
      hasPermission(userPermissions, 'Invoice', 'approve'),

    canCreateCustomer: () =>
      hasPermission(userPermissions, 'Customer', 'create'),
    canViewCustomer: () => hasPermission(userPermissions, 'Customer', 'view'),
    canUpdateCustomer: () =>
      hasPermission(userPermissions, 'Customer', 'update'),
    canDeleteCustomer: () =>
      hasPermission(userPermissions, 'Customer', 'remove'),

    canCreateBill: () => hasPermission(userPermissions, 'Bill', 'create'),
    canViewBill: () => hasPermission(userPermissions, 'Bill', 'view'),
    canApproveBill: () => hasPermission(userPermissions, 'Bill', 'approve'),
    canRejectBill: () => hasPermission(userPermissions, 'Bill', 'reject'),

    canCreateVoucher: () =>
      hasPermission(userPermissions, 'Vouchers', 'create'),
    canViewVoucher: () => hasPermission(userPermissions, 'Vouchers', 'view'),
    canUpdateVoucher: () =>
      hasPermission(userPermissions, 'Vouchers', 'update'),
    canDeleteVoucher: () =>
      hasPermission(userPermissions, 'Vouchers', 'delete'),

    canViewAccounts: () => hasPermission(userPermissions, 'Accounts', 'view'),
    canCreateAccounts: () =>
      hasPermission(userPermissions, 'Accounts', 'create'),

    canViewTransactions: () =>
      hasPermission(userPermissions, 'Transactions', 'view'),
    canCreateTransactions: () =>
      hasPermission(userPermissions, 'Transactions', 'create'),

    canViewGeneralLedger: () =>
      hasPermission(userPermissions, 'GeneralLedger', 'view'),
    canViewBalanceSheet: () =>
      hasPermission(userPermissions, 'GeneralLedger', 'view-balance-sheet'),
    canViewIncomeStatement: () =>
      hasPermission(userPermissions, 'GeneralLedger', 'income-statement'),
  };
};

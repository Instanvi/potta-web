import axios from 'config/axios.config';
import { ExtendedApprovalRule } from '../types/approval-rule';


export const PoliciesApi = {
  create: async (data: ExtendedApprovalRule) => {
    const result = await axios.post(`/policies/create`, data);
    return result?.data;
  },
  getAll: async (filter: any) => {
    const data = {}
    const result = await axios.post('/policies/filter', data, {
      params: { ...filter },
    });
    return result?.data;
  },
  getOne: async (policies_id: string) => {
    const result = await axios.get(`/policies/details/${policies_id}`);
    return result?.data;
  },

  update: async (policies_id: string, data: unknown) => {
    const result = await axios.put(`/policies/${policies_id}`, data);
    return result?.data;
  },
  delete: async (policies_id: string) => {
    const result = await axios.delete(`/policies/${policies_id}`);
    return result?.data;
  },

  SearchAllEmployees: async (employeeName: string): Promise<unknown> => {
    const result = await axios.get(`/employees/search?name=${employeeName}`);
    return result?.data;
  },
  SearchAllCustomers: async (customerName: string): Promise<unknown> => {
    const result = await axios.get(`/customer/search?name=${customerName}`);
    console.log('result',result.data)
    return result?.data;
  },
  SearchAllVendors: async (vendorName: string): Promise<unknown> => {
    const result = await axios.get(`/vendor/search?name=${vendorName}`);
    return result?.data;
  },
  SearchAllItems: async (itemName: string): Promise<unknown> => {
    const result = await axios.get(`/vendor/search/product?name=${itemName}`);
    return result?.data;
  },
};


export enum ComparisonOperator {
  IS = 'is',
  EQUALS = 'equals',
  NOT_EQUALS = 'does not equal',
  LESS_THAN = 'less than',
  GREATER_THAN = 'greater than',
  LESS_THAN_OR_EQUAL = 'less than or equal',
  GREATER_THAN_OR_EQUAL = 'greater than or equal',
  CONTAINS = 'contains',
  IS_ONE_OF = 'is one of',
  IS_NOT_ONE_OF = 'is not one of',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends with',
}

export enum ConditionOperator {
  AND = 'and',
  OR = 'or',
  THEN = 'then',
}

export enum ActionType {
  REQUIRE_APPROVAL = 'require approval',
  NOTIFY = 'notify',
  APPROVE_BILL = 'approve bill',
  // SET_CONDITION = 'set condition',
}

export enum PaymentType {
  MobileMoney = 'mobile money',
  BANK_TRANSFER = 'bank transfer',
  CASH = 'cash',
  CARD = 'card',
  CHECK = 'check',
  OTHER = 'other',
}

export enum CriterionType {
  AMOUNT = 'amount',
  DEPARTMENT = 'department',
  LOCATION_BRANCH = 'location branch',
  MATCHED_TO_PURCHASE_ORDER = 'matched to purchase order',
  PAYMENT_TYPE = 'payment type',
  EXPENSE_CATEGORY = 'expense category',
  CUSTOMER = 'customer',
  INVENTORY_ITEM = 'inventory item',
  VENDOR = 'vendor',
}

export enum ExpenseRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}
export enum ExpenseRequestType {
  EXPENSE = 'expense',
  SPEND_REQUEST = 'spend request',
  BILL = 'bill',
  VENDOR = 'vendor',
}

export enum ApproverActionType {
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
}

export enum ApproverEntityType {
  USER = 'user',
  ROLE = 'role',
  DEPARTMENT = 'department',
  MANAGER_TYPE = 'manager_type',
}

export enum ApprovalMode {
  ALL = 'all',
  ANY = 'any',
}

export enum PolicyTransactionType {
  REIMBURSEMENT = 'reimbursement',
  BILLS = 'bills',
  SPEND_REQUESTS = 'spendRequests',
  VENDORS = 'vendors',
  CARDS = 'cards'
}

export enum PolicyType {
  OUT_OF_POCKET = 'out-of-pocket',
  MILEAGE = 'mileage',
  GENERAL_SPEND = 'general_spend',

}

export enum PolicyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}  
import React from 'react';
import { Badge } from '@potta/components/shadcn/badge';
import { Reimbursement } from '../utils/api-types';
import {
  REIMBURSEMENT_STATUS_COLORS,
  REIMBURSEMENT_TYPE_COLORS,
} from '../utils/api-types';
import moment from 'moment';
import { cn } from '@potta/lib/utils';
import { useGetEmployees } from '../hooks/useReimbursements';

interface ReimbursementDetailsProps {
  reimbursement: Reimbursement;
}

const ReimbursementDetails = ({ reimbursement }: ReimbursementDetailsProps) => {
  const { data: employees } = useGetEmployees({
    limit: 100,
    sortBy: ['firstName:ASC'],
  });

  if (!reimbursement) return null;

  // Helper to get employee name
  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.data?.find(
      (emp: any) => emp.uuid === employeeId
    );
    if (employee) {
      return `${employee.firstName} ${employee.lastName}`;
    }
    return `Employee ${employeeId.slice(0, 8)}...`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header with Status */}
      <div className="bg-white border border-gray-200  p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Reimbursement Details
          </h3>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              REIMBURSEMENT_STATUS_COLORS[reimbursement.status]
            )}
          >
            {reimbursement.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Employee</div>
            <div className="font-medium text-gray-900">
              {getEmployeeName(reimbursement.employeeId)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Type</div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                REIMBURSEMENT_TYPE_COLORS[reimbursement.type]
              )}
            >
              {reimbursement.type.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Expense Type</div>
            <div className="font-medium text-gray-900">
              {reimbursement.expenseType}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Amount</div>
            <div className="font-medium text-gray-900">
              XAF {reimbursement.amount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Created</div>
            <div className="font-medium text-gray-900">
              {moment(reimbursement.createdAt).format('MMM DD, YYYY HH:mm')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Updated</div>
            <div className="font-medium text-gray-900">
              {moment(reimbursement.updatedAt).format('MMM DD, YYYY HH:mm')}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200  p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Description
        </h4>
        <p className="text-gray-900">{reimbursement.description}</p>
      </div>

      {/* Approval and Payment Information */}
      {(reimbursement.approvalDate ||
        reimbursement.paymentDate ||
        reimbursement.paymentRef) && (
        <div className="bg-white border border-gray-200  p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Processing Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reimbursement.approvalDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Approval Date</div>
                <div className="font-medium text-gray-900">
                  {moment(reimbursement.approvalDate).format(
                    'MMM DD, YYYY HH:mm'
                  )}
                </div>
              </div>
            )}
            {reimbursement.paymentDate && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Payment Date</div>
                <div className="font-medium text-gray-900">
                  {moment(reimbursement.paymentDate).format(
                    'MMM DD, YYYY HH:mm'
                  )}
                </div>
              </div>
            )}
            {reimbursement.paymentRef && (
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Payment Reference
                </div>
                <div className="font-medium text-gray-900">
                  {reimbursement.paymentRef}
                </div>
              </div>
            )}
            {reimbursement.journalEntryId && (
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Journal Entry ID
                </div>
                <div className="font-medium text-gray-900 font-mono text-sm">
                  {reimbursement.journalEntryId}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UUID for reference */}
    </div>
  );
};

export default ReimbursementDetails;

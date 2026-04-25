import React from 'react';
import Slider from '@potta/components/slideover';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import moment from 'moment';

interface BudgetTransactionSliderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  transaction: any | null;
}

const labelClass = 'font-medium text-gray-600';
const valueClass = 'text-gray-900';
const sectionClass =
  'text-base font-medium text-green-700 border-b pb-1 mb-3 mt-6 first:mt-0';

const statusColors: Record<string, string> = {
  completed: 'text-green-600 font-medium',
  failed: 'text-red-600 font-medium',
  pending: 'text-yellow-600 font-medium',
};

const BudgetTransactionSlider: React.FC<BudgetTransactionSliderProps> = ({
  open,
  setOpen,
  transaction,
}) => {
  if (!transaction) {
    return (
      <Slider
        open={open}
        setOpen={setOpen}
        title="Transaction Details"
        edit={false}
      >
        <div className="flex items-center justify-center h-40">Loading...</div>
      </Slider>
    );
  }
  return (
    <Slider
      open={open}
      setOpen={setOpen}
      title="Transaction Details"
      edit={false}
    >
      <div className="w-full max-w-5xl">
        {/* General Info */}
        <div className={sectionClass}>General</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <div className={labelClass}>Transaction ID</div>
            <div className={valueClass}>{transaction.transactionId}</div>
          </div>
          <div>
            <div className={labelClass}>Reference</div>
            <div className={valueClass}>{transaction.referenceNumber}</div>
          </div>
          <div>
            <div className={labelClass}>Status</div>
            <div
              className={
                statusColors[(transaction.status || '').toLowerCase()] || ''
              }
              style={{ textTransform: 'capitalize' }}
            >
              {transaction.status}
            </div>
          </div>
          <div>
            <div className={labelClass}>Date</div>
            <div className={valueClass}>
              {moment(transaction.transactionDate).format('ll, LT')}
            </div>
          </div>
          <div>
            <div className={labelClass}>Amount</div>
            <div className={valueClass}>
              {transaction.amount} {transaction.currency}
            </div>
          </div>
          <div>
            <div className={labelClass}>Category</div>
            <div className={valueClass}>{transaction.category || '-'}</div>
          </div>
        </div>
        {/* Payment Info */}
        <div className={sectionClass}>Payment</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 items-center">
          <div className="flex items-center space-x-2">
            {transaction.paymentMethod === 'Mobile Money' && svgIcons.MOMO()}
            <span className={labelClass}>Method:</span>
            <span className={valueClass}>{transaction.paymentMethod}</span>
          </div>
          <div>
            <div className={labelClass}>Type</div>
            <div className={valueClass}>
              {transaction.transactionType
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </div>
          </div>
          <div>
            <div className={labelClass}>Expense Category</div>
            <div className={valueClass}>
              {transaction.expenseCategory || '-'}
            </div>
          </div>
          <div>
            <div className={labelClass}>Department</div>
            <div className={valueClass}>{transaction.department || '-'}</div>
          </div>
        </div>
        {/* Meta Info */}
        <div className={sectionClass}>Meta</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <div className={labelClass}>Memo</div>
            <div className={valueClass}>{transaction.memo || '-'}</div>
          </div>
          <div>
            <div className={labelClass}>Matched to PO</div>
            <div className={valueClass}>
              {transaction.matchedToPurchaseOrder ? 'Yes' : 'No'}
            </div>
          </div>
          <div>
            <div className={labelClass}>Tags</div>
            <div className={valueClass}>
              {transaction.tags && transaction.tags.length > 0
                ? transaction.tags.join(', ')
                : '-'}
            </div>
          </div>
          <div>
            <div className={labelClass}>Screenshots</div>
            <div className={valueClass}>
              {transaction.screenshots && transaction.screenshots.length > 0
                ? transaction.screenshots.map((url: string, i: number) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ))
                : '-'}
            </div>
          </div>
        </div>
      </div>
    </Slider>
  );
};

export default BudgetTransactionSlider;

import React from 'react';
import Slider from '@potta/components/slideover';
import useGetTransactionDetails from '../hooks/useGetTransactionDetails';
import { svgIcons } from '@potta/components/svg_icons/IconsSvg';
import moment from 'moment';

interface TransactionSliderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  uuid: string | null;
}

const statusColors: Record<string, string> = {
  completed: 'text-green-600 font-medium',
  failed: 'text-red-600 font-medium',
  pending: 'text-yellow-600 font-medium',
};
const labelClass = 'font-medium text-gray-600';
const valueClass = 'text-gray-900';
const sectionClass =
  'text-base font-medium text-green-700 border-b pb-1 mb-3 mt-6 first:mt-0';

const TransactionSlider: React.FC<TransactionSliderProps> = ({
  open,
  setOpen,
  uuid,
}) => {
  const { data, isLoading, isError } = useGetTransactionDetails(uuid);

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      title="Transaction Details"
      edit={false}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-40">Loading...</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load transaction details.</div>
      ) : data ? (
        <div className="w-full max-w-5xl">
          {/* General Info */}
          <div className={sectionClass}>General</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <div className={labelClass}>Transaction ID</div>
              <div className={valueClass}>{data.transactionId}</div>
            </div>
            <div>
              <div className={labelClass}>Reference</div>
              <div className={valueClass}>{data.referenceNumber}</div>
            </div>
            <div>
              <div className={labelClass}>Status</div>
              <div
                style={{
                  textTransform: 'capitalize',
                }}
                className={
                  statusColors[(data.status || '').toLowerCase()] || ''
                }
              >
                {data.status}
              </div>{' '}
            </div>
            <div>
              <div className={labelClass}>Date</div>
              <div className={valueClass}>
                {moment(data.transactionDate).format('ll, LT')}
              </div>
            </div>
            <div>
              <div className={labelClass}>Amount</div>
              <div className={valueClass}>
                {data.amount} {data.currency}
              </div>
            </div>
            <div>
              <div className={labelClass}>Category</div>
              <div className={valueClass}>{data.category || '-'}</div>
            </div>
            <div className="col-span-2">
              <div className={labelClass}>Description</div>
              <div className={valueClass}>{data.description}</div>
            </div>
          </div>

          {/* Payment Info */}
          <div className={sectionClass}>Payment</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 items-center">
            <div className="flex items-center space-x-2">
              {data.paymentMethod === 'Mobile Money' && svgIcons.MOMO()}
              <span className={labelClass}>Method:</span>
              <span className={valueClass}>{data.paymentMethod}</span>
            </div>
            <div>
              <div className={labelClass}>Type</div>
              <div className={valueClass}>
                {data.transactionType
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </div>
            </div>
            <div>
              <div className={labelClass}>Expense Category</div>
              <div className={valueClass}>{data.expenseCategory || '-'}</div>
            </div>
            <div>
              <div className={labelClass}>Department</div>
              <div className={valueClass}>{data.department || '-'}</div>
            </div>
          </div>

          {/* Meta Info */}
          <div className={sectionClass}>Meta</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <div className={labelClass}>Memo</div>
              <div className={valueClass}>{data.memo || '-'}</div>
            </div>
            <div>
              <div className={labelClass}>Matched to PO</div>
              <div className={valueClass}>
                {data.matchedToPurchaseOrder ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className={labelClass}>Tags</div>
              <div className={valueClass}>
                {data.tags && data.tags.length > 0 ? data.tags.join(', ') : '-'}
              </div>
            </div>
            <div>
              <div className={labelClass}>Screenshots</div>
              <div className={valueClass}>
                {data.screenshots && data.screenshots.length > 0
                  ? data.screenshots.map((url: string, i: number) => (
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
      ) : (
        <div>No details found.</div>
      )}
    </Slider>
  );
};

export default TransactionSlider;

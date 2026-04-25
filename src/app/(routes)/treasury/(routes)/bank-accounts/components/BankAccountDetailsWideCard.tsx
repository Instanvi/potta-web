import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import {
  Eye,
  EyeOff,
  EllipsisVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { Skeleton } from '@potta/components/shadcn/skeleton';
import { Button } from '@potta/components/shadcn/button';
import { accountsApi } from '@potta/app/(routes)/accounting/utils/api';

interface BankAccountDetailsWideCardProps {
  account: any;
  onDelete?: (id: string) => void;
  onReactivate?: (id: string) => void;
  loading?: boolean;
  deactivating?: boolean;
  reactivating?: boolean;
}

const typeLabels: Record<string, string> = {
  Bank_Account: 'Bank Account',
  Cash_on_Hand: 'Cash on Hand',
  Debit_Card: 'Debit Card',
  Credit_Card: 'Credit Card',
};

const mask = (val: string | undefined, visible = false) => {
  if (!val) return '-';
  if (visible) return val;
  return '*'.repeat(val.length > 4 ? val.length - 4 : 2) + val.slice(-4);
};

const statusBadge = (isActive: boolean) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <AlertCircle className="w-4 h-4 text-gray-400" />
      )}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

const BankAccountDetailsWideCard: React.FC<BankAccountDetailsWideCardProps> = ({
  account,
  onDelete,
  onReactivate,
  loading = false,
  deactivating = false,
  reactivating = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [ledgerAccountName, setLedgerAccountName] = useState<string | null>(
    null
  );
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      if (
        !account?.ledger_account_id ||
        typeof accountsApi.getOne !== 'function'
      )
        return;
      setLedgerLoading(true);
      try {
        const data = await accountsApi.getOne(account.ledger_account_id);
        if (data.code && data.name) {
          setLedgerAccountName(`${data.code} - ${data.name}`);
        } else {
          setLedgerAccountName('-');
        }
      } catch (e) {
        setLedgerAccountName('-');
      } finally {
        setLedgerLoading(false);
      }
    };
    if (account && !loading) fetchLedger();
  }, [account?.ledger_account_id, loading]);

  // Card skeleton loader
  if (loading || !account) {
    return (
      <Card className="bg-white shadow-sm transition-shadow duration-200 relative overflow-hidden w-full">
        <CardHeader className="pb-4 !p-4 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Skeleton className="h-6 w-40 mb-2" />
            </CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-row items-center gap-8 pt-2 pb-2 min-h-[60px]">
          <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 w-full items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col min-w-[120px]">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    account_name,
    account_type,
    currency,
    bank_name,
    account_number,
    sort_code,
    iban,
    ledger_account_id,
    card_number,
    card_type,
    expiration_date,
    cvv,
    bank_representative_name,
    representative_contact,
    is_active,
    current_balance,
    uuid,
  } = account;

  let mainLabel = '';
  let subLabel = '';
  if (account_type === 'Bank_Account') {
    mainLabel = bank_name || 'N/A';
    subLabel = account_number ? `•••• ${account_number.slice(-4)}` : '';
  } else if (account_type === 'Debit_Card' || account_type === 'Credit_Card') {
    mainLabel = card_type || 'Card';
    subLabel = card_number ? `•••• ${card_number.slice(-4)}` : '';
  } else if (account_type === 'Cash_on_Hand') {
    mainLabel = account_name || 'Cash on Hand';
    subLabel = '';
  } else {
    mainLabel = bank_name || account_name || 'N/A';
    subLabel = account_number ? `•••• ${account_number.slice(-4)}` : '';
  }

  return (
    <Card className="bg-white shadow-sm transition-shadow duration-200 relative overflow-hidden w-full">
      <CardHeader className="pb-4 !p-4 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {mainLabel}
            {subLabel && (
              <span className="ml-2 text-gray-400 text-base">{subLabel}</span>
            )}
          </CardTitle>
          <div className="mt-1 flex items-center gap-2">
            {statusBadge(is_active)}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setShowDetails((v) => !v)}
            title={showDetails ? 'Hide Details' : 'Show Details'}
            type="button"
          >
            {showDetails ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {is_active && onDelete && (
            <Button
              variant="outline"
              size="sm"
              disabled={deactivating}
              onClick={() => onDelete(uuid)}
              className="flex items-center gap-2"
            >
              {deactivating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Deactivate
                </>
              )}
            </Button>
          )}
          {!is_active && onReactivate && (
            <Button
              variant="outline"
              size="sm"
              disabled={reactivating}
              onClick={() => onReactivate(uuid)}
              className="flex items-center gap-2"
            >
              {reactivating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reactivating...
                </>
              ) : (
                <>Reactivate</>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-row items-center gap-8 pt-2 pb-2 min-h-[60px]">
        {/* Key details in a horizontal row */}
        <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 w-full items-center">
          <Detail label="Account Name" value={account_name} />
          <Detail label="Currency" value={currency} />
          <Detail
            label="Balance"
            value={
              <span className="text-xl font-medium text-blue-700">
                {current_balance}
              </span>
            }
          />
          {account_type === 'Bank_Account' && (
            <Detail
              label="Account Number"
              value={mask(account_number, showDetails)}
            />
          )}
          {account_type === 'Bank_Account' && (
            <Detail label="Sort Code" value={sort_code} />
          )}
          {account_type === 'Bank_Account' && (
            <Detail label="IBAN" value={mask(iban, showDetails)} />
          )}
          {(account_type === 'Debit_Card' ||
            account_type === 'Credit_Card') && (
            <Detail label="Card Type" value={card_type} />
          )}
          {(account_type === 'Debit_Card' ||
            account_type === 'Credit_Card') && (
            <Detail
              label="Card Number"
              value={mask(card_number, showDetails)}
            />
          )}
          {(account_type === 'Debit_Card' ||
            account_type === 'Credit_Card') && (
            <Detail label="Expiration" value={expiration_date} />
          )}
          {(account_type === 'Debit_Card' ||
            account_type === 'Credit_Card') && (
            <Detail label="CVV" value={mask(cvv, showDetails)} />
          )}
          {(account_type === 'Debit_Card' ||
            account_type === 'Credit_Card') && (
            <Detail label="Bank Rep Name" value={bank_representative_name} />
          )}
          {(account_type === 'Debit_Card' ||
            account_type === 'Credit_Card') && (
            <Detail label="Rep Contact" value={representative_contact} />
          )}
          <Detail
            label="Ledger Account"
            value={
              ledgerLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                ledgerAccountName
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

const Detail = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col min-w-[120px]">
    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
      {label}
    </span>
    <span className="text-base text-gray-800 font-medium whitespace-nowrap">
      {value || '-'}
    </span>
  </div>
);

export default BankAccountDetailsWideCard;

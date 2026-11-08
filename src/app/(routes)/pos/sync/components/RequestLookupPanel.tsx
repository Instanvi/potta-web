'use client';
import { FormEvent, useState } from 'react';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import { formatDateTime } from '../../../_shared/format';
import { ErrorState, LoadingState } from '../../../_shared/states';
import { useSyncRequest } from '../hooks';
import { Mono } from './shared';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'border-yellow-300 bg-yellow-50 text-yellow-700',
  SUCCEEDED: 'border-green-500 bg-green-50 text-green-700',
  FAILED: 'border-red-300 bg-red-50 text-red-600',
};

const RequestLookupPanel = () => {
  const [draft, setDraft] = useState('');
  const [requestId, setRequestId] = useState('');
  const { data, isLoading, isFetching, error, refetch } = useSyncRequest(requestId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = draft.trim();
    if (id === requestId) refetch();
    else setRequestId(id);
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={submit} className="flex items-end gap-2 mb-6">
        <Input
          type="text"
          name="requestId"
          label="Sync request id"
          placeholder="requestId returned by a /pos-sync/*/batch call"
          value={draft}
          onchange={(e) => setDraft(e.target.value)}
        />
        <Button
          text="Look up"
          type="submit"
          isLoading={isFetching}
          disabled={!draft.trim()}
        />
      </form>

      {!requestId ? (
        <p className="text-sm text-gray-500">
          Paste the request id the desktop app logged for a push to see its status and result.
        </p>
      ) : isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 border border-gray-200 p-4 text-sm">
            <span className="text-gray-500">Status</span>
            <span>
              <span
                className={`px-2 py-0.5 text-xs font-medium border ${
                  STATUS_STYLES[data.status] ?? STATUS_STYLES.PENDING
                }`}
              >
                {data.status}
              </span>
            </span>
            <span className="text-gray-500">Endpoint</span>
            <Mono>{data.endpoint}</Mono>
            <span className="text-gray-500">Idempotency key</span>
            <Mono>{data.idempotencyKey}</Mono>
            <span className="text-gray-500">Created</span>
            <span>{formatDateTime(data.createdAt)}</span>
            <span className="text-gray-500">Updated</span>
            <span>{formatDateTime(data.updatedAt)}</span>
          </div>
          {data.error && (
            <div>
              <p className="mb-1 text-sm font-medium text-red-700">Error</p>
              <pre className="max-h-72 overflow-auto bg-red-50 p-3 text-xs">
                {JSON.stringify(data.error, null, 2)}
              </pre>
            </div>
          )}
          {data.response && (
            <div>
              <p className="mb-1 text-sm font-medium">Response</p>
              <pre className="max-h-96 overflow-auto bg-gray-50 p-3 text-xs">
                {JSON.stringify(data.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default RequestLookupPanel;

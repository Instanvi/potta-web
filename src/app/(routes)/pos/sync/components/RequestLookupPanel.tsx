'use client';
import { FormEvent, useState } from 'react';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import { formatDateTime } from '../../../_shared/format';
import { ErrorState, LoadingState, Panel, StatusBadge } from '../../../_shared/states';
import { useSyncRequest } from '../hooks';
import { Mono } from './shared';

const STATUS_TONES = {
  PENDING: 'warning',
  SUCCEEDED: 'success',
  FAILED: 'danger',
} as const;

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
        <p className="text-sm text-muted-foreground">
          Paste the request id the desktop app logged for a push to see its status and result.
        </p>
      ) : isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : data ? (
        <div className="space-y-4">
          <Panel className="grid grid-cols-2 items-center gap-x-6 gap-y-2 p-4 text-sm">
            <span className="text-muted-foreground">Status</span>
            <span>
              <StatusBadge tone={STATUS_TONES[data.status] ?? 'warning'}>{data.status}</StatusBadge>
            </span>
            <span className="text-muted-foreground">Endpoint</span>
            <Mono>{data.endpoint}</Mono>
            <span className="text-muted-foreground">Idempotency key</span>
            <Mono>{data.idempotencyKey}</Mono>
            <span className="text-muted-foreground">Created</span>
            <span>{formatDateTime(data.createdAt)}</span>
            <span className="text-muted-foreground">Updated</span>
            <span>{formatDateTime(data.updatedAt)}</span>
          </Panel>
          {data.error && (
            <div>
              <p className="mb-1 text-sm font-medium text-destructive">Error</p>
              <pre className="max-h-72 overflow-auto bg-destructive/5 p-3 text-xs">
                {JSON.stringify(data.error, null, 2)}
              </pre>
            </div>
          )}
          {data.response && (
            <div>
              <p className="mb-1 text-sm font-medium">Response</p>
              <pre className="max-h-96 overflow-auto bg-background p-3 text-xs">
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

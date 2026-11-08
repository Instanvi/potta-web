'use client';
import { Fragment, useState } from 'react';
import Input from '@potta/components/input';
import { formatDateTime } from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState } from '../../../_shared/states';
import { useFeed } from '../hooks';
import { PosSyncKind } from '../utils/api';
import { CursorPager, KindFilter, Mono, useCursorPager } from './shared';

const LIMIT = 100;

const FeedPanel = () => {
  const [kinds, setKinds] = useState<PosSyncKind[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const pager = useCursorPager();
  const { data, isLoading, isFetching, error, refetch } = useFeed({
    cursor: pager.cursor,
    limit: LIMIT,
    kinds: kinds.length ? kinds : undefined,
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
  });
  const items = data?.items ?? [];

  const resetWith = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    pager.reset();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <KindFilter value={kinds} onChange={resetWith(setKinds)} />
        <div className="w-44">
          <Input
            type="date"
            name="from"
            label="From"
            value={from}
            onchange={(e) => resetWith(setFrom)(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Input
            type="date"
            name="to"
            label="To"
            value={to}
            onchange={(e) => resetWith(setTo)(e.target.value)}
          />
        </div>
        {data?.highWatermark && (
          <p className="pb-3 text-xs text-gray-500">
            High watermark: {formatDateTime(data.highWatermark)}
          </p>
        )}
      </div>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No changes"
          description="The feed lists catalog and document changes the desktop app will pull."
        />
      ) : (
        <>
          <div className="border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 text-left">
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">External id</th>
                  <th className="px-4 py-3 font-medium">Op</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <Fragment key={item.eventId}>
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatDateTime(item.updatedAt)}
                      </td>
                      <td className="px-4 py-2">{item.kind}</td>
                      <td className="px-4 py-2">
                        <Mono>{item.externalId}</Mono>
                      </td>
                      <td className="px-4 py-2">{item.op}</td>
                      <td className="px-4 py-2 text-right">
                        {item.payload && (
                          <button
                            type="button"
                            className="text-green-700 hover:underline"
                            onClick={() =>
                              setExpanded(expanded === item.eventId ? null : item.eventId)
                            }
                          >
                            {expanded === item.eventId ? 'Hide payload' : 'Payload'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === item.eventId && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 px-4 py-2">
                          <pre className="max-h-64 overflow-auto text-xs">
                            {JSON.stringify(item.payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <CursorPager
            page={pager.page}
            hasMore={!!data?.hasMore}
            isFetching={isFetching}
            onPrev={pager.prev}
            onNext={() => pager.next(data?.nextCursor)}
          />
        </>
      )}
    </div>
  );
};

export default FeedPanel;

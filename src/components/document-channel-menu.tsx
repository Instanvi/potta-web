'use client';

import { ChevronDown, Mail, MessageSquare } from 'lucide-react';
import Button from '@potta/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';

export type DocumentChannel = 'email' | 'sms';

export type DocumentChannelOption = {
  channel: DocumentChannel;
  label: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
};

type Props = {
  label?: string;
  options: DocumentChannelOption[];
  onSelect: (channel: DocumentChannel) => void;
  disabled?: boolean;
  className?: string;
};

/** List/card channel picker — always a list, even with one option. Corners rounded-[4px]. */
export function DocumentChannelMenu({
  label = 'Send',
  options,
  onSelect,
  disabled,
  className,
}: Props) {
  const items = options.length
    ? options
    : [
        {
          channel: 'email' as const,
          label: 'Email',
          disabled: true,
          disabledReason: 'No channels available',
        },
      ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          text={label}
          type="button"
          theme="lightBlue"
          icon={<ChevronDown className="size-3.5" />}
          disabled={disabled}
          className={className}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[200] min-w-[12rem] rounded-[4px] bg-white p-1">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.channel}
            disabled={item.disabled}
            className="cursor-pointer gap-2 rounded-[4px] py-2"
            onSelect={(event) => {
              event.preventDefault();
              if (item.disabled) return;
              onSelect(item.channel);
            }}
          >
            {item.channel === 'sms' ? (
              <MessageSquare className="size-4 shrink-0" />
            ) : (
              <Mail className="size-4 shrink-0" />
            )}
            <span className="flex min-w-0 flex-col">
              <span className="text-sm">{item.label}</span>
              {(item.disabledReason || item.description) && (
                <span className="truncate text-xs text-muted-foreground">
                  {item.disabled ? item.disabledReason : item.description}
                </span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function documentChannelOptions(params: {
  email?: string | null;
  phone?: string | null;
}): DocumentChannelOption[] {
  const email = (params.email || '').trim();
  const phone = (params.phone || '').trim();
  return [
    {
      channel: 'email',
      label: 'Email',
      description: email || undefined,
      disabled: !email,
      disabledReason: 'Add an email first',
    },
    {
      channel: 'sms',
      label: 'SMS',
      description: phone || undefined,
      disabled: !phone,
      disabledReason: 'Add a phone first',
    },
  ];
}

/** Pull email/phone from a document row or nested customer/vendor party. */
export function partyContactFromRecord(
  record?: Record<string, unknown> | null,
): { email?: string; phone?: string } {
  if (!record) return {};
  const nestedCandidates = [
    record.customer,
    record.vendor,
    record.salePerson,
    record.party,
  ];
  let nested: { email?: unknown; phone?: unknown } | undefined;
  for (const candidate of nestedCandidates) {
    if (candidate && typeof candidate === 'object') {
      nested = candidate as { email?: unknown; phone?: unknown };
      break;
    }
  }
  const email = String(nested?.email ?? record.email ?? '').trim();
  const phone = String(nested?.phone ?? record.phone ?? '').trim();
  return {
    email: email || undefined,
    phone: phone || undefined,
  };
}

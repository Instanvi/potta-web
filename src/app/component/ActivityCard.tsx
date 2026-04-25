import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@potta/components/card';
import { Button } from '@potta/components/shadcn/button';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import { Badge } from '@potta/components/shadcn/badge';
import { ArrowRight, Mail, Bell, AlertCircle, Info, Settings } from 'lucide-react';
import { ListItem } from './types';

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'message':
      return Mail;
    case 'system':
      return Settings;
    case 'reminder':
      return Bell;
    case 'alert':
      return AlertCircle;
    default:
      return Info;
  }
};

interface ActivityHeaderProps {
  title: string;
  unreadCount: number;
  Icon: any;
}

const ActivityHeader = ({ title, unreadCount, Icon }: ActivityHeaderProps) => (
  <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-stone-100 px-6 pb-4 pt-5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
        <Icon className="h-5 w-5 text-black" />
      </div>
      <div>
        <CardTitle className="text-lg font-medium text-black">
          {title}
        </CardTitle>
        <p className="text-base font-normal text-black">{unreadCount} unread</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {unreadCount > 0 && (
        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-base font-normal text-black">
          {unreadCount}
        </Badge>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="rounded-md px-3 text-base font-medium text-black hover:bg-stone-100"
      >
        View All
      </Button>
    </div>
  </CardHeader>
);

interface ActivityItemProps {
  item: ListItem;
  defaultType: string;
  parentTitle: string;
}

import { formatDistanceToNow } from 'date-fns';

const ActivityItem = ({ item, defaultType, parentTitle }: ActivityItemProps) => {
  const IconComponent = getTypeIcon(item.type || defaultType);
  const formattedTime = item.timestamp instanceof Date 
    ? formatDistanceToNow(item.timestamp, { addSuffix: true })
    : item.timestamp;
    
  return (
    <div
      className={`flex cursor-pointer items-start space-x-3 px-6 py-4 transition-colors hover:bg-stone-50 ${
        !item.read ? 'bg-green-50/40' : ''
      }`}
    >
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
        <IconComponent className="h-5 w-5 text-black" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <h4 className="text-base font-medium leading-snug text-black">
            {item.title}
          </h4>
          <div className="flex shrink-0 items-center gap-2">
            {item.priority === 'high' && (
              <div className="h-2 w-2 rounded-full bg-red-500" />
            )}
            <span className="text-base font-normal text-black">
              {formattedTime}
            </span>
          </div>
        </div>
        <p className="truncate-2-lines text-base leading-relaxed text-black">
          {item.description}
        </p>
      </div>
      {!item.read && (
        <div className={`w-2 h-2 ${parentTitle === "Inbox" ? 'bg-green-500' : 'bg-orange-500' } rounded-full mt-2 flex-shrink-0`}></div>
      )}
    </div>
  );
};

export const ActivityCard = ({
  title,
  unreadCount,
  items,
  icon: Icon,
  type,
  viewAllLink,
}: {
  title: string;
  unreadCount: number;
  items: ListItem[];
  icon: any;
  type: string;
  viewAllLink: string;
}) => (
  <Card className="flex h-full flex-col overflow-hidden border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(21,128,61,0.06)]">
    <ActivityHeader title={title} unreadCount={unreadCount} Icon={Icon} />
    <CardContent className="p-0 flex-grow flex flex-col">
      <ScrollArea className="flex-grow h-72">
        <div className="divide-y divide-stone-100">
          {items.map((item) => (
            <ActivityItem 
              key={item.id} 
              item={item} 
              defaultType={type} 
              parentTitle={title} 
            />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-stone-100 p-4">
        <Button
          variant="outline"
          size="default"
          className="group w-full rounded-md border-stone-200/90 text-base font-normal text-black hover:bg-stone-50"
        >
          {viewAllLink}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

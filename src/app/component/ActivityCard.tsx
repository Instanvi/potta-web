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
  <Card className="border border-slate-200 overflow-hidden flex flex-col bg-white h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-6 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <div>
          <CardTitle className="text-base font-semibold text-slate-800">
            {title}
          </CardTitle>
          <p className="text-xs text-slate-500">{unreadCount} unread</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-600 hover:bg-slate-100 text-xs px-3 rounded-md"
        >
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent className="p-0 flex-grow flex flex-col">
      <ScrollArea className="flex-grow h-72">
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const IconComponent = getTypeIcon(item.type || type);
            return (
              <div
                key={item.id}
                className={`flex items-start space-x-3 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  !item.read ? 'bg-slate-50/50' : ''
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-md mt-0.5">
                  <IconComponent className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4
                      className={`text-sm font-medium ${
                        !item.read ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.priority === 'high' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      <span className="text-xs text-slate-500">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed truncate-2-lines">
                    {item.description}
                  </p>
                </div>
                {!item.read && (
                  <div className={`w-2 h-2 ${title === "Inbox" ? 'bg-green-500' : 'bg-orange-500' } rounded-full mt-2 flex-shrink-0`}></div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 rounded-md group"
        >
          {viewAllLink}
          <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

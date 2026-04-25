import React from 'react';
import { ActivityCard } from './ActivityCard';
import { inboxItems } from './data';
import { Inbox as InboxIcon } from 'lucide-react';

export const InboxFeed = () => {
  const unreadCount = inboxItems.filter((item) => !item.read).length;
  return (
    <ActivityCard 
      title="Inbox" 
      unreadCount={unreadCount} 
      items={inboxItems} 
      icon={InboxIcon} 
      type="message" 
      viewAllLink="View All Messages"
    />
  );
};

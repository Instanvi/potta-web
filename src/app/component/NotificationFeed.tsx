import React from 'react';
import { ActivityCard } from './ActivityCard';
import { notificationItems } from './data';
import { Bell } from 'lucide-react';

export const NotificationFeed = () => {
  const unreadCount = notificationItems.filter((item) => !item.read).length;
  return (
    <ActivityCard 
      title="Notifications" 
      unreadCount={unreadCount} 
      items={notificationItems} 
      icon={Bell} 
      type="system" 
      viewAllLink="View All Notifications"
    />
  );
};

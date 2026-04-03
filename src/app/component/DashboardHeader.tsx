import React from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, BarChart3 } from 'lucide-react';
import { inboxItems, notificationItems } from './data';

export const DashboardHeader = () => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const unreadTotal = inboxItems.filter(i => !i.read).length + notificationItems.filter(n => !n.read).length;
  
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Control your business with precision and ease.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-slate-600">
              {currentTime?.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-slate-600">
              {currentTime?.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
            <BarChart3 className="h-4 w-4 text-green-600" />
            <span className="text-slate-600">{unreadTotal} pending tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

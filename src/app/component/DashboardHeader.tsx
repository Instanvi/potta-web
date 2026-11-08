import React from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Clock } from 'lucide-react';

export const DashboardHeader = () => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-base font-normal text-black">
            Control your business with precision and ease.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-base font-normal text-black">
          <div className="flex items-center gap-2.5 rounded-full border border-stone-200/80 bg-stone-50 px-3.5 py-2">
            <Calendar className="h-5 w-5 shrink-0 text-black" />
            <span className="text-black">
              {currentTime?.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-stone-200/80 bg-stone-50 px-3.5 py-2">
            <Clock className="h-5 w-5 shrink-0 text-black" />
            <span className="text-black">
              {currentTime?.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

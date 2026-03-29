'use client';
import React, { useContext } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@potta/components/card';
import {
  CreditCard,
  Banknote,
  Ticket,
  ShoppingCart,
  FileText,
  Shield,
  PieChart,
  Wallet,
  Bell,
  Inbox as InboxIcon,
  Mail,
  AlertCircle,
  ArrowRight,
  Smile,
  Calendar,
  Clock,
  BarChart3,
  User,
  FileCheck,
  Settings,
  Zap,
  Info,
  CheckCircle,
  MoreHorizontal,
  Star,
  Archive,
  Folder,
} from 'lucide-react';
import { Button } from '@potta/components/shadcn/button';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import { Badge } from '@potta/components/shadcn/badge';
import RootLayout from './(routes)/layout';
import { ContextData } from '@potta/components/providers/DataProvider';

interface GridItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

interface ListItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  read?: boolean;
  timestamp?: string;
  priority?: 'high' | 'medium' | 'low';
  type?: 'message' | 'system' | 'reminder' | 'alert';
}

const inboxItems: ListItem[] = [
  {
    id: 'msg1',
    title: 'Project Phoenix Update',
    description:
      'Alice shared the latest progress report with timeline updates and key milestones.',
    icon: User,
    read: false,
    timestamp: '2 min ago',
    priority: 'high',
    type: 'message',
  },
  {
    id: 'msg2',
    title: 'Design Team Meeting',
    description:
      'Reminder: Design review meeting scheduled for today at 2:00 PM in Conference Room B.',
    icon: Calendar,
    read: false,
    timestamp: '15 min ago',
    priority: 'medium',
    type: 'reminder',
  },
  {
    id: 'msg3',
    title: 'Invoice #INV-123 Received',
    description:
      "New invoice from Bob's Design Studio for $2,450.00 requires your approval.",
    icon: FileCheck,
    read: true,
    timestamp: '1 hour ago',
    priority: 'medium',
    type: 'message',
  },
  {
    id: 'msg4',
    title: 'Team Lunch Planning',
    description:
      'Sarah is organizing the team lunch for Friday. Please confirm your attendance.',
    icon: User,
    read: true,
    timestamp: '3 hours ago',
    priority: 'low',
    type: 'message',
  },
  {
    id: 'msg5',
    title: 'Quarterly Report Ready',
    description:
      'Q3 financial report has been generated and is ready for your review.',
    icon: FileText,
    read: true,
    timestamp: '1 day ago',
    priority: 'medium',
    type: 'system',
  },
];

const notificationItems: ListItem[] = [
  {
    id: 'not1',
    title: 'Server Maintenance Alert',
    description:
      'Scheduled maintenance tonight from 1:00 AM to 3:00 AM. Services may be temporarily unavailable.',
    icon: Settings,
    read: false,
    timestamp: '5 min ago',
    priority: 'high',
    type: 'alert',
  },
  {
    id: 'not2',
    title: 'New Device Login Detected',
    description:
      'A new device (iPhone 15) logged into your account from New York, NY.',
    icon: AlertCircle,
    read: false,
    timestamp: '30 min ago',
    priority: 'high',
    type: 'alert',
  },
  {
    id: 'not3',
    title: 'Password Expiration Warning',
    description:
      'Your password will expire in 3 days. Update it now to avoid account lockout.',
    icon: Info,
    read: false,
    timestamp: '2 hours ago',
    priority: 'medium',
    type: 'system',
  },
  {
    id: 'not4',
    title: 'Monthly Sales Report',
    description:
      'Your monthly sales report is now available in the Reports section.',
    icon: BarChart3,
    read: true,
    timestamp: '1 day ago',
    priority: 'low',
    type: 'system',
  },
  {
    id: 'not5',
    title: 'Task Assignment',
    description:
      'You were assigned: "Review PR #42 - Authentication System Updates"',
    icon: CheckCircle,
    read: true,
    timestamp: '2 days ago',
    priority: 'medium',
    type: 'system',
  },
];

const gridItems: GridItem[] = [
  {
    value: 'payments',
    label: 'Payments',
    icon: CreditCard,
  },
  {
    value: 'expenses',
    label: 'Expenses',
    icon: Banknote,
  },
  // {
  //   value: 'vouchers',
  //   label: 'Vouchers',
  //   icon: Ticket,
  // },
  {
    value: 'pos',
    label: 'POS',
    icon: ShoppingCart,
  },
  {
    value: 'invoice',
    label: 'Invoice',
    icon: FileText,
  },
  {
    value: 'taxation',
    label: 'Taxation',
    icon: Shield,
  },
  {
    value: 'reports',
    label: 'Reports',
    icon: PieChart,
  },
  {
    value: 'accounts',
    label: 'Accounts',
    icon: Wallet,
  },
  {
    value: 'files',
    label: 'File Manager',
    icon: Folder,
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: Settings,
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeIcon = (type: string) => {
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

const WelcomePage = () => {
  const unreadInboxCount = inboxItems.filter((item) => !item.read).length;
  const unreadNotificationCount = notificationItems.filter(
    (item) => !item.read
  ).length;
  const context = useContext(ContextData);
  return (
      <RootLayout>
        <div
          className={`${
            context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-0'
          } p-6 space-y-8 bg-white min-h-screen`}
        >
          {/* Improved Intro Text Section with Most Used Apps */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                  Welcome Back!
                </h1>
                <p className="text-sm text-slate-600 mb-3">
                  Here's what's happening in your workspace today.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {unreadInboxCount + unreadNotificationCount} new items
                  </span>
                </div>
              </div>

              {/* Most Used Apps - Inline */}
              <div className="flex-shrink-0">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Most Used
                  </div>
                  <div className="flex gap-2">
                    {[
                      { value: 'invoice', label: 'Invoice', icon: FileText },
                      {
                        value: 'payments',
                        label: 'Payments',
                        icon: CreditCard,
                      },
                      { value: 'expenses', label: 'Expenses', icon: Banknote },
                      { value: 'settings', label: 'Settings', icon: Settings },
                    ].map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <a
                          href={`/${item.value}`}
                          key={item.value}
                          className="group block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 rounded-md"
                        >
                          <div className="bg-white border border-slate-200 px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors duration-150 rounded-md">
                            <IconComponent className="w-4 h-4 text-slate-600 group-hover:text-green-600 transition-colors" />
                            <span className="text-xs font-medium text-slate-700 group-hover:text-green-600 transition-colors whitespace-nowrap">
                              {item.label}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Inbox and Notifications Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Professional Inbox Card */}
            <Card className="border border-slate-200 overflow-hidden flex flex-col bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                    <InboxIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800">
                      Inbox
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      {unreadInboxCount} unread
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadInboxCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 rounded-full"
                    >
                      {unreadInboxCount}
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
                    {inboxItems.map((item) => {
                      const IconComponent = getTypeIcon(item.type || 'message');
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
                                  !item.read
                                    ? 'text-slate-900'
                                    : 'text-slate-700'
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
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          {!item.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
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
                    className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 rounded-md"
                  >
                    View All Messages
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Notifications Card */}
            <Card className="border border-slate-200 overflow-hidden flex flex-col bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                    <Bell className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800">
                      Notifications
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      {unreadNotificationCount} unread
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadNotificationCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 rounded-full"
                    >
                      {unreadNotificationCount}
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
                    {notificationItems.map((item) => {
                      const IconComponent = getTypeIcon(item.type || 'system');
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
                                  !item.read
                                    ? 'text-slate-900'
                                    : 'text-slate-700'
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
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          {!item.read && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
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
                    className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 rounded-md"
                  >
                    View All Notifications
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Applications */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              All Applications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {gridItems.map((item) => {
                const IconComponent = item.icon;
                const linkHref = `/${item.value}`;
                return (
                  <a
                    href={linkHref}
                    key={item.value}
                    className="group block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 rounded-md"
                    tabIndex={0}
                  >
                    <div className="bg-white border border-slate-200 p-5 flex flex-col items-center text-center h-full cursor-pointer hover:bg-slate-50 transition-colors duration-150 rounded-md">
                      <IconComponent className="w-8 h-8 text-slate-700 mb-3 group-hover:text-green-600 transition-colors" />
                      <div className="text-sm font-medium text-slate-800 group-hover:text-green-600 transition-colors">
                        {item.label}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </RootLayout>
  );
};

export default WelcomePage;

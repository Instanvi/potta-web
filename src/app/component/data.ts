import {
  CreditCard,
  Banknote,
  ShoppingCart,
  FileText,
  Shield,
  PieChart,
  Wallet,
  Calendar,
  User,
  FileCheck,
  Settings,
  AlertCircle,
  Bell,
  Info,
  CheckCircle,
  BarChart3,
  Folder,
} from 'lucide-react';
import { GridItem, ListItem } from './types';

export const inboxItems: ListItem[] = [
  {
    id: 'msg1',
    title: 'Project Phoenix Update',
    description:
      'Alice shared the latest progress report with timeline updates and key milestones.',
    icon: User,
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    priority: 'medium',
    type: 'system',
  },
];

export const notificationItems: ListItem[] = [
  {
    id: 'not1',
    title: 'Server Maintenance Alert',
    description:
      'Scheduled maintenance tonight from 1:00 AM to 3:00 AM. Services may be temporarily unavailable.',
    icon: Settings,
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
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
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    type: 'system',
  },
];

export const gridItems: GridItem[] = [
  {
    value: 'payments',
    label: 'Payments',
    icon: CreditCard,
  },
  {
    value: 'accounting',
    label: 'Expenses',
    icon: Banknote,
  },
  {
    value: 'pos',
    label: 'POS',
    icon: ShoppingCart,
  },
  {
    value: 'account_receivables/invoice',
    label: 'Invoice',
    icon: FileText,
  },
  {
    value: 'payments/taxation',
    label: 'Taxation',
    icon: Shield,
  },
  {
    value: 'reports',
    label: 'Reports',
    icon: PieChart,
  },
  {
    value: 'treasury',
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

export const mostUsedApps = [
  { value: 'account_receivables/invoice', label: 'Invoice', icon: FileText },
  { value: 'payments', label: 'Payments', icon: CreditCard },
  { value: 'accounting', label: 'Expenses', icon: Banknote },
  { value: 'settings', label: 'Settings', icon: Settings },
];

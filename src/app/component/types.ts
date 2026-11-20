import { LucideIcon } from 'lucide-react';
import React from 'react';

export interface GridItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface ListItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  read?: boolean;
  timestamp?: string | Date;
  priority?: 'high' | 'medium' | 'low';
  type?: 'message' | 'system' | 'reminder' | 'alert';
}

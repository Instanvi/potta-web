'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Search,
  X,
  Clock,
  FileText,
  Users,
  Package,
  CreditCard,
  Building2,
  TrendingUp,
  Settings,
  Filter,
  MapPin,
  Network,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react';
import Input from '../input';
import Checkbox from '../checkbox';
import Select from '../select';
import SearchableSelect from '../searchableSelect';
import { DateRange } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Calendar } from '@potta/components/shadcn/calendar';
import { format } from 'date-fns';
import ReactFlow, {
  Node as ReactFlowNode,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Button from '../button';
import { FaSliders } from 'react-icons/fa6';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { ContextData } from '../providers/DataProvider';

// Mini Canvas Component for Organigram Preview
const MiniOrganigramCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 50 },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs font-medium text-gray-900">🏢 Main Org</div>
          </div>
        ),
      },
      style: {
        background: '#f3f4f6',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        width: 80,
        height: 40,
        fontSize: '10px',
      },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 50, y: 120 },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs font-medium text-gray-900">🌍 HQ</div>
          </div>
        ),
      },
      style: {
        background: '#dbeafe',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        width: 60,
        height: 35,
        fontSize: '10px',
      },
    },
    {
      id: '3',
      type: 'default',
      position: { x: 150, y: 120 },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs font-medium text-gray-900">🏢 Branch</div>
          </div>
        ),
      },
      style: {
        background: '#dbeafe',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        width: 60,
        height: 35,
        fontSize: '10px',
      },
    },
    {
      id: '4',
      type: 'default',
      position: { x: 20, y: 190 },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs font-medium text-green-700">💻 Eng</div>
            <div className="text-xs text-green-600">(You)</div>
          </div>
        ),
      },
      style: {
        background: '#dcfce7',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        width: 50,
        height: 40,
        fontSize: '9px',
      },
    },
    {
      id: '5',
      type: 'default',
      position: { x: 80, y: 190 },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs font-medium text-gray-900">📊 Sales</div>
          </div>
        ),
      },
      style: {
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        width: 50,
        height: 35,
        fontSize: '9px',
      },
    },
    {
      id: '6',
      type: 'default',
      position: { x: 140, y: 190 },
      data: {
        label: (
          <div className="text-center">
            <div className="text-xs font-medium text-gray-900">🎯 Mkt</div>
          </div>
        ),
      },
      style: {
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        width: 50,
        height: 35,
        fontSize: '9px',
      },
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      style: { stroke: '#22c55e', strokeWidth: 2 },
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      style: { stroke: '#22c55e', strokeWidth: 2 },
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      style: { stroke: '#3b82f6', strokeWidth: 1.5 },
    },
    {
      id: 'e2-5',
      source: '2',
      target: '5',
      style: { stroke: '#3b82f6', strokeWidth: 1.5 },
    },
    {
      id: 'e2-6',
      source: '2',
      target: '6',
      style: { stroke: '#3b82f6', strokeWidth: 1.5 },
    },
  ]);

  return (
    <div className="w-full h-48 border border-gray-200 overflow-hidden">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          className="bg-gradient-to-br from-gray-50 to-gray-100"
        >
          <Background
            color="#e5e7eb"
            gap={12}
            size={0.5}
            className="opacity-20"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

// Dummy data for search results
const dummySearchData = {
  recommendations: [
    {
      id: 1,
      type: 'report',
      title: 'Monthly Financial Summary',
      subtitle: 'Based on your recent activity',
      path: '/reports/dashboard',
      priority: 'high',
    },
    {
      id: 2,
      type: 'invoice',
      title: 'Outstanding Invoices Review',
      subtitle: '3 invoices need attention',
      path: '/account_receivables/invoice',
      priority: 'high',
    },
    {
      id: 3,
      type: 'budget',
      title: 'Q1 Budget Planning',
      subtitle: 'Recommended for your role',
      path: '/account_payables/budgets',
      priority: 'medium',
    },
    {
      id: 4,
      type: 'inventory',
      title: 'Low Stock Items',
      subtitle: '5 products need restocking',
      path: '/pos/inventory',
      priority: 'medium',
    },
    {
      id: 5,
      type: 'action',
      title: 'Process Pending Payments',
      subtitle: '2 payments awaiting approval',
      path: '/account_payables',
      priority: 'high',
    },
    {
      id: 6,
      type: 'report',
      title: 'Sales Performance Analysis',
      subtitle: 'Weekly insights available',
      path: '/reports/sales',
      priority: 'low',
    },
  ],
  recent: [
    {
      id: 7,
      type: 'invoice',
      title: 'Invoice #INV-2024-001',
      subtitle: 'John Doe - $1,250.00',
      path: '/account_receivables/invoice',
    },
    {
      id: 8,
      type: 'customer',
      title: 'Acme Corporation',
      subtitle: 'Customer - 5 orders',
      path: '/pos/customers',
    },
    {
      id: 9,
      type: 'product',
      title: 'MacBook Pro 16"',
      subtitle: 'Electronics - $2,499.00',
      path: '/pos/inventory',
    },
    {
      id: 10,
      type: 'employee',
      title: 'Sarah Johnson',
      subtitle: 'HR Manager - Active',
      path: '/payroll/people',
    },
    {
      id: 11,
      type: 'vendor',
      title: 'Tech Supplies Inc',
      subtitle: 'Vendor - 12 orders',
      path: '/pos/vendors',
    },
  ],
  suggestions: [
    {
      id: 12,
      type: 'report',
      title: 'Sales Report Q4 2024',
      subtitle: 'Financial Reports',
      path: '/reports',
    },
    {
      id: 13,
      type: 'budget',
      title: 'Marketing Budget 2024',
      subtitle: 'Budget Planning',
      path: '/account_payables/budgets',
    },
    {
      id: 14,
      type: 'payment',
      title: 'Outstanding Payments',
      subtitle: 'Account Payables',
      path: '/account_payables',
    },
    {
      id: 15,
      type: 'inventory',
      title: 'Low Stock Alert',
      subtitle: 'POS Inventory',
      path: '/pos/inventory',
    },
    {
      id: 16,
      type: 'payroll',
      title: 'December Payroll',
      subtitle: 'Payroll Management',
      path: '/payroll',
    },
  ],
  quickActions: [
    {
      id: 17,
      type: 'action',
      title: 'Create New Invoice',
      subtitle: 'Quick action',
      path: '/account_receivables/invoice/new',
      icon: FileText,
    },
    {
      id: 18,
      type: 'action',
      title: 'Add New Customer',
      subtitle: 'Quick action',
      path: '/pos/customers/new',
      icon: Users,
    },
    {
      id: 19,
      type: 'action',
      title: 'New Product',
      subtitle: 'Quick action',
      path: '/pos/inventory/new',
      icon: Package,
    },
    {
      id: 20,
      type: 'action',
      title: 'Process Payment',
      subtitle: 'Quick action',
      path: '/payments/new',
      icon: CreditCard,
    },
  ],
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'invoice':
      return FileText;
    case 'customer':
      return Users;
    case 'product':
      return Package;
    case 'employee':
      return Users;
    case 'vendor':
      return Building2;
    case 'report':
      return TrendingUp;
    case 'budget':
      return FileText;
    case 'payment':
      return CreditCard;
    case 'inventory':
      return Package;
    case 'payroll':
      return Users;
    case 'action':
      return Settings;
    default:
      return FileText;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'invoice':
      return 'text-green-600 bg-green-100';
    case 'customer':
      return 'text-emerald-600 bg-emerald-100';
    case 'product':
      return 'text-teal-600 bg-teal-100';
    case 'employee':
      return 'text-lime-600 bg-lime-100';
    case 'vendor':
      return 'text-green-700 bg-green-100';
    case 'report':
      return 'text-green-500 bg-green-100';
    case 'budget':
      return 'text-green-600 bg-green-50';
    case 'payment':
      return 'text-emerald-700 bg-emerald-100';
    case 'inventory':
      return 'text-teal-700 bg-teal-100';
    case 'payroll':
      return 'text-green-600 bg-green-100';
    case 'action':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

interface GlobalSearchProps {
  onClose?: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose }) => {
  const context = useContext(ContextData);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'recent'>(
    'recommendations'
  );
  const [activeFilterTab, setActiveFilterTab] = useState<
    'options' | 'option' | 'date' | 'organigram'
  >('options');
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    items: false,
    entities: false,
    itemTypes: false,
    transactionType: false,
  });
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [quickSelectValue, setQuickSelectValue] = useState('Last 7 days');
  const [departmentValue, setDepartmentValue] = useState('All Departments');
  const [locationValue, setLocationValue] = useState('All Locations');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedDateTag, setSelectedDateTag] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the global search hook
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    suggestions,
    isSuggestionsLoading,
    filters,
    updateFilter,
    selectedFilterTags,
    setSelectedFilterTags,
    performSearch,
    clearSearch,
    applyFilters,
    clearFilters,
    hasMorePages,
    loadMoreResults,
  } = useGlobalSearch({
    orgId: context?.data?.organizationId,
    locationContextId:
      context?.data?.fullUserData?.locationContextId?.id ||
      context?.data?.organizationId,
  });

  // Local state for UI interactions
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange
  );

  // Filter options data - extracted from business requirements
  const filterOptions = {
    entities: [
      'Customers',
      'Vendors (Suppliers)',
      'Employees',
      'Partners',
      'Leads/Prospects',
      'Other Contacts',
    ],
    itemTypes: [
      'Inventory Items',
      'Non-Inventory Items',
      'Service Items',
      'Assembly Items',
      'Kit/Package Items',
      'Discount Items',
      'Markup Items',
      'Gift Certificates',
      'Deferred Revenue Items',
      'Expense Items',
    ],
    transactionType: [
      'Sales Order',
      'Invoice',
      'Cash Sale',
      'Credit Memo',
      'Return Authorization (RMA)',
      'Customer Payment',
      'Estimate/Quote',
      'Purchase Order',
      'Vendor Bill',
      'Vendor Credit',
      'Vendor Payment (Bill Payment)',
      'Expense Report',
      'Vendor Return Authorization (VRA)',
      'Item Receipt',
      'Item Fulfillment',
      'Inventory Adjustment',
      'Inventory Transfer',
      'Work Order',
      'Journal Entry',
      'Deposit',
      'Withdrawal',
      'Transfer Funds',
      'Credit Card Charge',
      'Bank Reconciliation',
      'Payroll Run',
      'Intercompany Journal Entry',
      'Budget',
    ],
  };

  // System options - simplified dummy data
  const systemOptions = [
    'Account Payables',
    'Account Receivables',
    'POS',
    'Payroll',
    'Accounting',
    'Reports',
    'Treasury',
    'Settings',
  ];

  // Select options data
  const quickSelectOptions = [
    { value: 'Last 7 days', label: 'Last 7 days' },
    { value: 'Last 30 days', label: 'Last 30 days' },
    { value: 'Last 3 months', label: 'Last 3 months' },
    { value: 'Last 6 months', label: 'Last 6 months' },
    { value: 'Last year', label: 'Last year' },
    { value: 'This year', label: 'This year' },
    { value: 'Custom range', label: 'Custom range' },
  ];

  const departmentOptions = [
    { value: 'All Departments', label: 'All Departments' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'HR', label: 'HR' },
  ];

  const locationOptions = [
    { value: 'All Locations', label: 'All Locations' },
    { value: 'Headquarters', label: 'Headquarters' },
    { value: 'Branch Office', label: 'Branch Office' },
    { value: 'Remote', label: 'Remote' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const removeDateTag = () => {
    setSelectedDateTag(null);
    setDateRange(undefined);
  };

  // Date range formatting functions
  const formatDateRange = () => {
    if (!dateRange?.from) return '';
    if (!dateRange?.to) return format(dateRange.from, 'PPP');
    return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
  };

  const getDateButtonText = () => {
    if (dateRange?.from) {
      if (!dateRange.to) return format(dateRange.from, 'MMM d, yyyy');
      if (
        dateRange.from.getFullYear() === dateRange.to.getFullYear() &&
        dateRange.from.getMonth() === dateRange.to.getMonth()
      ) {
        return `${format(dateRange.from, 'MMM d')} - ${format(
          dateRange.to,
          'd, yyyy'
        )}`;
      }
      return `${format(dateRange.from, 'MMM d')} - ${format(
        dateRange.to,
        'MMM d, yyyy'
      )}`;
    }
    return 'Select Date Range';
  };

  // Get current location from pathname or context

  const getCurrentLocation = () => {
    // Get location from session data and capitalize it
    // Only use hierarchy.location.city (no fallback extraction)
    if (context?.data?.fullUserData?.hierarchy?.location?.city) {
      return context.data.fullUserData.hierarchy.location.city
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ');
    }

    // No fallback - return null if hierarchy data is not available
    return null;
  };

  // Transform API results to match component expectations
  const getFilteredData = () => {
    if (!searchResults?.results) {
      return {
        recommendations: [],
        recent: [],
        suggestions: [],
        quickActions: dummySearchData.quickActions,
      };
    }

    const results = searchResults.results.map((item: any) => ({
      ...item,
      // Map API response fields to component expected format
      type: item.entityType || item.type,
      title: item.name || item.title,
      subtitle: item.metadata?.customerId
        ? `Customer ID: ${item.metadata.customerId}`
        : item.metadata?.type
        ? `Type: ${item.metadata.type}`
        : item.subtitle || `${item.entityType || 'Item'}`,
      path: getPathForEntity(item),
      priority: item.priority || 'medium',
    }));

    return {
      // Show all results as recommendations by default
      recommendations: results,
      // Recent: invoices and customers
      recent: results.filter(
        (item: any) => item.type === 'invoice' || item.type === 'customer'
      ),
      // Suggestions: reports and budgets
      suggestions: results.filter(
        (item: any) => item.type === 'report' || item.type === 'budget'
      ),
      quickActions: dummySearchData.quickActions,
    };
  };

  // Helper function to generate paths for different entity types
  const getPathForEntity = (item: any) => {
    const entityType = item.entityType || item.type;
    switch (entityType) {
      case 'customer':
        return `/pos/customers`;
      case 'vendor':
        return `/pos/vendors`;
      case 'invoice':
        return `/account_receivables/invoice`;
      case 'product':
        return `/pos/inventory`;
      case 'employee':
        return `/payroll/people`;
      default:
        return '#';
    }
  };

  const filteredData = getFilteredData();

  // Get all filtered results for "recommendations" tab
  const allResults = [
    ...filteredData.recommendations,
    ...filteredData.recent,
    ...filteredData.suggestions,
    ...filteredData.quickActions,
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleResultClick = (item: any) => {
    // Set the selected item and append to search bar
    setSelectedItem(item);
    setSearchQuery(item.title);
    setIsOpen(false);
    onClose?.();
  };

  const handleOrganigramAction = (action: string) => {
    // Handle organigram-specific actions (navigation, etc.)
    if (action === 'view-full-chart') {
      window.location.href = '/organigram';
    } else if (action === 'my-team') {
      window.location.href = '/organigram?view=team';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      clearSearch();
      setSelectedItem(null);
      setSelectedFilterTags([]);
      setSelectedDateTag(null);
      setDateRange(undefined);
      onClose?.();
    }
  };

  // Filter handling functions
  const handleFilterTagSelect = (tag: string) => {
    if (!selectedFilterTags.includes(tag)) {
      setSelectedFilterTags([...selectedFilterTags, tag]);

      // Update the corresponding filter in the hook
      if (filterOptions.entities.includes(tag)) {
        updateFilter('entities', [...filters.entities, tag]);
      } else if (filterOptions.itemTypes.includes(tag)) {
        updateFilter('itemTypes', [...filters.itemTypes, tag]);
      } else if (filterOptions.transactionType.includes(tag)) {
        updateFilter('transactionType', [...filters.transactionType, tag]);
      }
    }
  };

  const removeFilterTag = (tag: string) => {
    setSelectedFilterTags(selectedFilterTags.filter((t) => t !== tag));

    // Update the corresponding filter in the hook
    if (filterOptions.entities.includes(tag)) {
      updateFilter(
        'entities',
        filters.entities.filter((t) => t !== tag)
      );
    } else if (filterOptions.itemTypes.includes(tag)) {
      updateFilter(
        'itemTypes',
        filters.itemTypes.filter((t) => t !== tag)
      );
    } else if (filterOptions.transactionType.includes(tag)) {
      updateFilter(
        'transactionType',
        filters.transactionType.filter((t) => t !== tag)
      );
    }
  };

  const handleDateTagSelect = (dateTag: string) => {
    setSelectedDateTag(dateTag);
    if (dateRange?.from && dateRange?.to) {
      updateFilter('dateRange', dateRange);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setSelectedFilterTags([]);
    setSelectedDateTag(null);
    setDateRange(undefined);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        // Don't close if date popover is open
        if (!isDatePopoverOpen) {
          setIsOpen(false);
          setShowFilters(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePopoverOpen]);

  const renderSearchResult = (item: any) => {
    const IconComponent = getTypeIcon(item.type);
    const colorClass = getTypeColor(item.type);
    const isSelected = selectedItem?.id === item.id;

    return (
      <div
        key={item.id}
        onClick={() => handleResultClick(item)}
        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-green-50 border-l-4 border-green-500'
            : 'hover:bg-gray-50'
        }`}
      >
        <div className={`p-2 ${colorClass}`}>
          <IconComponent size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-medium truncate ${
                isSelected ? 'text-green-900' : 'text-gray-900'
              }`}
            >
              {item.title}
            </p>
          </div>
          <p
            className={`text-xs truncate ${
              isSelected ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {item.subtitle}
          </p>
        </div>
        <div
          className={`text-xs capitalize ${
            isSelected ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          {item.type}
        </div>
        {isSelected && (
          <div className="text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const getCurrentResults = () => {
    switch (activeTab) {
      case 'recommendations':
        return filteredData.recommendations;
      case 'recent':
        return filteredData.recent;
      default:
        return allResults;
    }
  };

  // Get autocomplete suggestions
  const getAutocompleteSuggestions = () => {
    if (suggestions.length > 0) {
      return suggestions.map((suggestion) => ({
        id: suggestion,
        type: 'suggestion',
        title: suggestion,
        subtitle: 'Suggestion',
        path: '#',
      }));
    }
    return [];
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <div className="flex items-center w-full pl-12 pr-20 py-3 border whitespace-nowrap border-gray-300 rounded-full bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent">
          {/* Filter Tags and Location Badge */}
          <div
            className="flex items-center gap-1 mr-2 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Location Badge - styled like other badges */}
            {getCurrentLocation() && (
              <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex-shrink-0">
                <MapPin size={12} className="text-gray-600" />
                <span className="font-medium">{getCurrentLocation()}</span>
              </div>
            )}

            {/* Date Tag */}
            {selectedDateTag && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                <CalendarIcon size={12} className="text-blue-600" />
                <span>{selectedDateTag}</span>
                <button
                  onClick={removeDateTag}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} className="text-blue-600" />
                </button>
              </div>
            )}

            {/* Filter Tags */}
            {selectedFilterTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeFilterTag(tag)}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} className="text-green-600" />
                </button>
              </div>
            ))}
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowFilters(false)}
            placeholder={
              selectedFilterTags.length > 0 || selectedDateTag
                ? 'Search within selected filters...'
                : 'Search invoices, customers, products, employees...'
            }
            className="flex-1 bg-transparent text-sm placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Right side buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedItem(null);
                setSelectedFilterTags([]);
                setSelectedDateTag(null);
                setDateRange(undefined);
                setIsOpen(false);
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}

          {/* Filters Button */}
          <button
            onClick={() => {
              setShowFilters(!showFilters);
              setIsOpen(false); // Close search results when opening filters
            }}
            className={`p-2 rounded-full transition-colors ${
              showFilters
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaSliders className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveFilterTab('options')}
              className={`flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                activeFilterTab === 'options'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings size={16} />
              Options
            </button>
            <button
              onClick={() => setActiveFilterTab('option')}
              className={`flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                activeFilterTab === 'option'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={16} />
              Option
            </button>
            <button
              onClick={() => setActiveFilterTab('date')}
              className={`flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                activeFilterTab === 'date'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon size={16} />
              Date
            </button>
            <button
              onClick={() => setActiveFilterTab('organigram')}
              className={`flex-1 px-3 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                activeFilterTab === 'organigram'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Network size={16} />
              Organigram
            </button>
          </div>

          {/* Filter Content */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {activeFilterTab === 'options' && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                {/* System Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    System Options
                  </h4>
                  <div className="space-y-1">
                    {systemOptions.map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          // Navigate to the system option
                          const pathMap: { [key: string]: string } = {
                            'Account Payables': '/account_payables',
                            'Account Receivables': '/account_receivables',
                            POS: '/pos',
                            Payroll: '/payroll',
                            Accounting: '/accounting',
                            Reports: '/reports',
                            Treasury: '/treasury',
                            Settings: '/settings',
                          };
                          const path = pathMap[option];
                          if (path) {
                            window.location.href = path;
                            onClose?.();
                          }
                        }}
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {option}
                          </p>
                          <p className="text-xs text-gray-500">
                            Navigate to {option}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeFilterTab === 'option' && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                {/* Collapsible Sections */}
                <div className="space-y-3">
                  {/* Items Section */}

                  {/* Entities Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('entities')}
                      className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-900 hover:text-green-600"
                    >
                      {expandedSections.entities ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      Entities
                    </button>
                    <div
                      className={`mt-2 ml-6 space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedSections.entities
                          ? 'max-h-96 opacity-100 translate-y-0'
                          : 'max-h-0 opacity-0 -translate-y-2'
                      }`}
                    >
                      {filterOptions.entities.map((entity) => (
                        <Checkbox
                          key={entity}
                          id={entity}
                          label={entity}
                          checked={selectedFilterTags.includes(entity)}
                          onChange={(checked) => {
                            if (checked) {
                              handleFilterTagSelect(entity);
                            } else {
                              removeFilterTag(entity);
                            }
                          }}
                          className="hover:bg-gray-50 p-1 transition-colors duration-150"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Item Types Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('itemTypes')}
                      className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-900 hover:text-green-600"
                    >
                      {expandedSections.itemTypes ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      Items
                    </button>
                    <div
                      className={`mt-2 ml-6 space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedSections.itemTypes
                          ? 'max-h-96 opacity-100 translate-y-0'
                          : 'max-h-0 opacity-0 -translate-y-2'
                      }`}
                    >
                      {filterOptions.itemTypes.map((itemType) => (
                        <Checkbox
                          key={itemType}
                          id={itemType}
                          label={itemType}
                          checked={selectedFilterTags.includes(itemType)}
                          onChange={(checked) => {
                            if (checked) {
                              handleFilterTagSelect(itemType);
                            } else {
                              removeFilterTag(itemType);
                            }
                          }}
                          className="hover:bg-gray-50 p-1 transition-colors duration-150"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Transaction Type Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('transactionType')}
                      className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-900 hover:text-green-600"
                    >
                      {expandedSections.transactionType ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      Transaction Type
                    </button>
                    <div
                      className={`mt-2 ml-6 space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedSections.transactionType
                          ? 'max-h-96 opacity-100 translate-y-0'
                          : 'max-h-0 opacity-0 -translate-y-2'
                      }`}
                    >
                      {filterOptions.transactionType.map((type) => (
                        <Checkbox
                          key={type}
                          id={type}
                          label={type}
                          checked={selectedFilterTags.includes(type)}
                          onChange={(checked) => {
                            if (checked) {
                              handleFilterTagSelect(type);
                            } else {
                              removeFilterTag(type);
                            }
                          }}
                          className="hover:bg-gray-50 p-1 transition-colors duration-150"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFilterTab === 'date' && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Date Range
                </h4>
                <div className="space-y-3">
                  <div>
                    <Select
                      options={quickSelectOptions}
                      selectedValue={quickSelectValue}
                      onChange={setQuickSelectValue}
                      bg=""
                      label="Quick Select"
                      labelClass="text-xs font-medium text-gray-700 mb-2 block"
                      // SelectClass="text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                      Custom Date Range
                    </label>
                    <Popover
                      open={isDatePopoverOpen}
                      onOpenChange={setIsDatePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          className="w-full px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDatePopoverOpen(!isDatePopoverOpen);
                          }}
                        >
                          <span
                            className={
                              dateRange?.from
                                ? 'text-gray-900'
                                : 'text-gray-500'
                            }
                          >
                            {getDateButtonText()}
                          </span>
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-white border border-gray-200 shadow-lg z-[60]"
                        align="start"
                        onInteractOutside={(e) => {
                          // Prevent closing when clicking inside the popover
                          e.preventDefault();
                        }}
                      >
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                          <h3 className="font-medium text-center text-sm">
                            {dateRange?.from
                              ? formatDateRange()
                              : 'Select Date Range'}
                          </h3>
                          {dateRange?.from && !dateRange?.to && (
                            <p className="text-xs text-gray-500 text-center mt-1">
                              Select end date to complete range
                            </p>
                          )}
                        </div>
                        <div className="p-3">
                          <Calendar
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={(range) => {
                              setDateRange(range);
                              // Don't close immediately, let user see their selection
                            }}
                            numberOfMonths={2}
                            className="bg-white"
                          />
                          <div className="flex justify-between mt-4">
                            <button
                              className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                setDateRange(undefined);
                                setSelectedDateTag(null);
                                setIsDatePopoverOpen(false);
                              }}
                            >
                              Clear
                            </button>
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm transition-colors"
                              onClick={() => {
                                if (dateRange?.from) {
                                  handleDateTagSelect(getDateButtonText());
                                }
                                setIsDatePopoverOpen(false);
                              }}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {activeFilterTab === 'organigram' && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Organizational Structure
                </h4>

                {/* Current User Context */}
                <div className="bg-green-50 border border-green-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Your Position
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    <div className="font-medium">
                      {context?.data?.userRole || 'User Role'}
                    </div>
                    <div className="text-xs text-green-600">
                      {context?.data?.branchName || 'Department'} •{' '}
                      {context?.data?.organizationName || 'Organization'} • Core
                      Technology
                    </div>
                  </div>
                </div>

                {/* Entity Type Filter */}
                <div>
                  <Select
                    options={[
                      { value: 'all', label: 'All Entities' },
                      { value: 'department', label: 'Departments' },
                      { value: 'employee', label: 'Employees' },
                      { value: 'location', label: 'Locations' },
                      { value: 'business_unit', label: 'Business Units' },
                    ]}
                    selectedValue={departmentValue}
                    onChange={setDepartmentValue}
                    bg=""
                    label="Entity Type"
                    labelClass="text-xs font-medium text-gray-700 mb-2 block"
                  />
                </div>

                {/* Include Children Filter */}
                <div>
                  <Select
                    options={[
                      { value: 'true', label: 'Include Children' },
                      { value: 'false', label: 'Current Level Only' },
                    ]}
                    selectedValue={departmentValue}
                    onChange={setDepartmentValue}
                    bg=""
                    label="Hierarchy Level"
                    labelClass="text-xs font-medium text-gray-700 mb-2 block"
                  />
                </div>

                {/* Entity ID Filter */}
                <div>
                  <Select
                    options={[
                      { value: 'current', label: 'Current Position' },
                      { value: 'department', label: 'Current Department' },
                      { value: 'location', label: 'Current Location' },
                      {
                        value: 'business_unit',
                        label: 'Current Business Unit',
                      },
                    ]}
                    selectedValue={departmentValue}
                    onChange={setDepartmentValue}
                    bg=""
                    label="Entity ID"
                    labelClass="text-xs font-medium text-gray-700 mb-2 block"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center p-4 pt-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                handleClearFilters();
                setExpandedSections({
                  items: false,
                  entities: false,
                  itemTypes: false,
                  transactionType: false,
                });
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700  transition-colors"
              >
                Cancel
              </button>
              <Button
                type="button"
                text={' Apply Filters'}
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 text-xs bg-green-700 hover:bg-green-800 text-white  transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg z-50 max-h-96 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'recommendations'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommendations ({filteredData.recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                activeTab === 'recent'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Recent ({filteredData.recent.length})
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-300">
            {/* Autocomplete Suggestions - show when typing */}
            {searchQuery.length > 0 &&
              suggestions.length > 0 &&
              !isSearching && (
                <div className="bg-gray-50 border-b border-gray-200 p-2">
                  <h4 className="text-xs font-medium text-gray-500 px-2 mb-1">
                    Suggestions
                  </h4>
                  <div className="space-y-1">
                    {getAutocompleteSuggestions()
                      .slice(0, 3)
                      .map((suggestion) => (
                        <div
                          key={suggestion.id}
                          onClick={() => {
                            setSearchQuery(suggestion.title);
                            performSearch(suggestion.title);
                          }}
                          className="flex items-center gap-2 p-2 cursor-pointer hover:bg-white rounded transition-colors"
                        >
                          <Search size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {suggestion.title}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {isSearching ? (
              // Show loading state
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="h-8 w-8 mx-auto mb-2 text-gray-300 animate-spin" />
                <p className="text-sm">Searching...</p>
              </div>
            ) : searchQuery.length === 0 ? (
              // Show default content when no search query
              <div className="p-4">
                {activeTab === 'recommendations' && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Recommended for You
                    </h3>
                    <div className="space-y-1">
                      {filteredData.recommendations
                        .slice(0, 4)
                        .map(renderSearchResult)}
                    </div>
                  </div>
                )}

                {activeTab === 'recent' && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Clock size={16} />
                      Recent
                    </h3>
                    <div className="space-y-1">
                      {filteredData.recent.slice(0, 3).map(renderSearchResult)}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    {filteredData.quickActions.map(renderSearchResult)}
                  </div>
                </div>
              </div>
            ) : getCurrentResults().length > 0 ? (
              <div className="p-2">
                {getCurrentResults().map(renderSearchResult)}
                {/* Load More Button */}
                {hasMorePages && (
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={loadMoreResults}
                      className="w-full text-sm text-green-600 hover:text-green-700 py-2"
                    >
                      Load More Results
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try different keywords
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Press <kbd className="px-1 py-0.5 bg-gray-200">Esc</kbd> to
                close
              </span>
              <span>
                Use <kbd className="px-1 py-0.5 bg-gray-200">↑↓</kbd> to
                navigate
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

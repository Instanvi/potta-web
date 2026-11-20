import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface TreasurySidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  onSubmenuClick?: (submenuId: string) => void;
  initialOpenSubmenu?: string;
  type: 'ar' | 'ap'; // 'ar' for Account Receivables, 'ap' for Account Payables
}

const submenuVariants = {
  open: {
    transition: { staggerChildren: 0.05, delayChildren: 0 },
  },
  closed: {
    transition: { staggerChildren: 0.01, staggerDirection: -1 },
  },
};

const submenuItemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 },
};

const TreasurySidebar: React.FC<TreasurySidebarProps> = ({
  activeTab,
  setActiveTab,
  onSubmenuClick,
  initialOpenSubmenu,
  type,
}) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    if (initialOpenSubmenu) {
      setOpenSubmenu(initialOpenSubmenu);
    }
  }, [initialOpenSubmenu]);

  // Define categories based on type (AR or AP)
  const getCategories = () => {
    if (type === 'ar') {
      return [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        {
          id: 'customer_invoices',
          label: 'Customer Invoices',
          icon: FileText,
        },
        {
          id: 'paid_invoices',
          label: 'Paid Invoices',
          icon: CheckCircle,
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: Users,
        },
      ];
    } else {
      // AP (Account Payables) categories
      return [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        {
          id: 'purchases',
          label: 'Purchases',
          icon: FileText,
          submenus: [
            { id: 'vendor_invoices', label: 'Bills' },
            { id: 'credit_notes', label: 'Credit Notes' },
          ],
        },
        {
          id: 'expense_claims',
          label: 'Expense Claims',
          icon: AlertCircle,
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: CreditCard,
        },
        {
          id: 'vendors',
          label: 'Vendors',
          icon: Users,
        },
      ];
    }
  };

  const categories = getCategories();

  const handleMenuClick = (tab: any) => {
    setActiveTab(tab.id);
    if (tab.submenus) {
      setOpenSubmenu(tab.id === openSubmenu ? null : tab.id);
    } else {
      setOpenSubmenu(null);
    }
  };

  return (
    <aside className="w-[200px] bg-white border-r flex flex-col py-8 pt-3 flex-shrink-0 max-h-screen overflow-y-auto">
      {/* Header */}
      {/* <div className="px-3 mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {type === 'ar' ? 'Account Receivables' : 'Account Payables'}
        </h2>
        <p className="text-sm text-gray-500">
          {type === 'ar'
            ? 'Manage customer payments and collections'
            : 'Manage vendor payments and invoices'}
        </p>
      </div> */}

      <nav className="flex-1 flex flex-col gap-2">
        {categories.map((tab) => {
          const isActive = activeTab === tab.id;
          const hasSubmenu = !!tab.submenus;
          const IconComponent = tab.icon;

          return (
            <div key={tab.id} className="relative">
              <button
                onClick={() => handleMenuClick(tab)}
                className={`flex items-center px-3 py-2 text-left transition-colors duration-200 text-gray-600 hover:bg-green-50 hover:text-green-900
                  ${
                    isActive
                      ? 'bg-green-100 text-green-900 font-medium border-l-4 border-l-green-600'
                      : 'border-l-4 border-l-transparent'
                  }
                  rounded-none w-full`}
                style={{ borderRadius: 0 }}
              >
                {IconComponent && <IconComponent className="w-4 h-4 mr-3" />}
                <span>{tab.label}</span>
              </button>

              {/* Submenu */}
              {hasSubmenu && openSubmenu === tab.id && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={submenuVariants}
                  style={{ overflow: 'hidden' }}
                  className="ml-2 mt-1 flex flex-col gap-1"
                >
                  {tab.submenus.map((submenu: any) => (
                    <motion.button
                      key={submenu.id}
                      variants={submenuItemVariants}
                      className="text-left px-4 py-1 text-sm text-gray-700 hover:bg-green-50 hover:text-green-900 rounded-none w-full"
                      style={{ borderRadius: 0 }}
                      onClick={() =>
                        onSubmenuClick && onSubmenuClick(submenu.id)
                      }
                    >
                      {submenu.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {type === 'ar' ? 'AR Management' : 'AP Management'} • Treasury
        </div>
      </div>
    </aside>
  );
};

export default TreasurySidebar;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  reportCategories: any[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  onSubmenuClick?: (submenuId: string) => void;
  initialOpenSubmenu?: string;
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

const Sidebar: React.FC<SidebarProps> = ({
  reportCategories,
  activeTab,
  setActiveTab,
  onSubmenuClick,
  initialOpenSubmenu,
}) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    if (initialOpenSubmenu) {
      setOpenSubmenu(initialOpenSubmenu);
    }
  }, [initialOpenSubmenu]);

  const handleMenuClick = (tab: any) => {
    setActiveTab(tab.id);
    if (tab.submenus) {
      setOpenSubmenu(tab.id === openSubmenu ? null : tab.id);
    } else {
      setOpenSubmenu(null);
    }
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col py-8 pt-3 flex-shrink-0 max-h-screen overflow-y-auto">
      <nav className="flex-1 flex flex-col gap-2">
        {reportCategories.map((tab) => {
          const isActive = activeTab === tab.id;
          const hasSubmenu = !!tab.submenus;
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
                <span>{tab.label}</span>
              </button>
              {/* Submenu (not for 'All') */}
              {hasSubmenu && tab.id !== 'all' && openSubmenu === tab.id && (
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
    </aside>
  );
};

export default Sidebar;

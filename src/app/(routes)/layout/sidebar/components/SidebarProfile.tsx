import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Icon from '@potta/components/icon_fonts/icon';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProfileProps {
  context: any;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({ context }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as any;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
    setShowUserMenu(false);
  };

  const confirmSignOut = () => {
    signOut();
    setShowSignOutModal(false);
  };

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Menu Toggle Button */}
          <div className="w-full">
            <button
              onClick={() => {
                context?.setToggle(!context?.toggle);
              }}
              className={`p-2 hover:bg-white/10 rounded-md transition-colors w-full ${
                context?.toggle ? 'flex justify-center' : 'flex justify-start'
              }`}
            >
              <Icon icon="Menu-1" size={23} className="" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="relative w-full">
            <button
              ref={buttonRef}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center rounded-md transition-all duration-200 group w-full ${
                context?.toggle
                  ? 'justify-center px-2'
                  : 'justify-start  space-x-3'
              }`}
            >
              {/* {user?.branch?.organization?.logo ? (
                <img
                  src={user.branch.organization.logo}
                  alt={user.branch.organization.name || 'Org Logo'}
                  className="h-10 w-10 rounded-full object-cover border border-white bg-white"
                />
              ) : (
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-green-500" />
                </div>
              )} */}

              {/* Profile Icon with Green Border */}
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-green-800 flex-shrink-0">
                <User className="h-5 w-5 text-green-800" />
              </div>

              {!context?.toggle && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium  truncate">
                    {user?.user?.firstName || user?.user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.user?.email || ''}
                  </p>
                </div>
              )}

              {!context?.toggle && (
                <ChevronDown className="h-4 w-4 text-white transition-transform duration-200 group-hover:rotate-180 flex-shrink-0" />
              )}
            </button>

            {/* Dropdown Menu - Rendered outside sidebar overflow */}
            {showUserMenu && (
              <div
                ref={dropdownRef}
                className="absolute mb-2 w-56 bg-white shadow-sm border border-gray-200 rounded-sm z-[9999]"
                style={{
                  position: 'fixed',
                  bottom: '1px',
                  left: context?.toggle ? '70px' : '100px',
                  zIndex: 9999,
                }}
              >
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.user?.firstName || user?.user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.user?.email || ''}
                    </p>
                  </div>
                  <button className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <User className="h-4 w-4 mr-3 text-gray-500" />
                    Profile
                  </button>
                  <button onClick={() => router.push('/settings')} className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <Settings className="h-4 w-4 mr-3 text-gray-500" />
                    Settings
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center">
          <div className="bg-white p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
              <button
                onClick={() => setShowSignOutModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to sign out? You will be redirected to the
              login page.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarProfile;

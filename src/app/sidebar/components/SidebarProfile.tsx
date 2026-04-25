import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signOutWithAuthApi } from '@/lib/auth-sign-out';
import { List } from '@phosphor-icons/react';
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
    void signOutWithAuthApi();
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
              <List size={23} weight="regular" className="text-black" />
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
                <User className="h-5 w-5 text-black" />
              </div>

              {!context?.toggle && (
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate text-base font-medium text-black">
                    {user?.name || 'User'}
                  </p>
                  <p className="truncate text-base text-black">
                    {user?.email || ''}
                  </p>
                </div>
              )}

              {!context?.toggle && (
                <ChevronDown className="h-4 w-4 shrink-0 text-black transition-transform duration-200 group-hover:rotate-180" />
              )}
            </button>

            {/* Dropdown Menu - Rendered outside sidebar overflow */}
            {showUserMenu && (
              <div
                ref={dropdownRef}
                className="absolute z-[9999] mb-2 w-56 rounded-sm border border-stone-200 bg-white shadow-sm"
                style={{
                  position: 'fixed',
                  bottom: '1px',
                  left: context?.toggle ? '70px' : '100px',
                  zIndex: 9999,
                }}
              >
                <div className="p-2">
                  <div className="mb-1 border-b border-stone-200 px-3 py-2">
                    <p className="text-base font-medium text-black">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-base text-black">
                      {user?.email || ''}
                    </p>
                  </div>
                  <button className="flex w-full items-center px-3 py-2.5 text-base text-black transition-colors duration-200 hover:bg-stone-50">
                    <User className="mr-3 h-4 w-4 text-black" />
                    Profile
                  </button>
                  <button onClick={() => router.push('/settings')} className="flex w-full items-center px-3 py-2.5 text-base text-black transition-colors duration-200 hover:bg-stone-50">
                    <Settings className="mr-3 h-4 w-4 text-black" />
                    Settings
                  </button>
                  <hr className="my-1 border-stone-200" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center px-3 py-2.5 text-base text-red-600 transition-colors duration-200 hover:bg-red-50"
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
              <h3 className="text-lg font-medium text-black">Sign Out</h3>
              <button
                onClick={() => setShowSignOutModal(false)}
                className="text-black hover:opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-base text-black">
              Are you sure you want to sign out? You will be redirected to the
              login page.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 text-base text-black transition-colors hover:opacity-80"
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

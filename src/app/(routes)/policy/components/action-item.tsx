import React, { useMemo, useEffect } from 'react';
import { Button } from '@potta/components/shadcn/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@potta/components/shadcn/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { Check, X, UserPlus } from 'lucide-react';
import { Badge } from '@potta/components/shadcn/badge';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@potta/components/avatar';
import { useSearchEmployees } from '../hooks/policyHooks';

import { 
  ConditionAction, 
  ApproverActionType, 
  ApprovalMode, 
  User 
} from '../types/approval-rule';

// Define the employee data structure from the API
interface EmployeeData {
  uuid: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  // Add any other fields that might be in the API response
}

interface ActionItemProps {
  action: ConditionAction;
  users: User[];
  onRemove: () => void;
  onUpdateMode: (mode: ApprovalMode) => void;
  onAddUser: (user: User) => void;
  onRemoveUser: (user: User) => void;
  isUserSelectionOpen: boolean;
  onUserSelectionOpenChange: (isOpen: boolean) => void;
  userSearchQuery: string;
  onUserSearchQueryChange: (query: string) => void;
}

export const ActionItem: React.FC<ActionItemProps> = ({
  action,
  users,
  onRemove,
  onUpdateMode,
  onAddUser,
  onRemoveUser,
  isUserSelectionOpen,
  onUserSelectionOpenChange,
  userSearchQuery,
  onUserSearchQueryChange
}) => {
  // Fetch employees from backend using the hook
  const { data: employeesData, isLoading } = useSearchEmployees(userSearchQuery);

  // Debug log whenever employeesData changes
  useEffect(() => {
    console.log('Search query:', userSearchQuery);
    console.log('Raw employeesData:', employeesData);
  }, [employeesData, userSearchQuery]);

  // Transform employee data to our normalized User format
  const availableUsers = useMemo(() => {
    if (!employeesData) return [];
    
    // Check if employeesData is an array or has a nested data structure
    let dataArray;
    
    if (Array.isArray(employeesData)) {
      dataArray = employeesData;
    }  else {
      dataArray = [];
    }
    
    console.log('Extracted data array:', dataArray);
    
    // Ensure we're working with an array
    if (!Array.isArray(dataArray)) {
      console.error('Expected array of employees, got:', typeof dataArray);
      return [];
    }
    
    const mappedUsers = dataArray.map((employee: any) => {
      // Handle different possible structures
      const uuid = employee.uuid || employee.id;
      const firstName = employee.firstName || employee.first_name || '';
      const lastName = employee.lastName || employee.last_name || '';
      
      const user = {
        id: uuid || `temp-${Math.random()}`,
        name: `${firstName} ${lastName}`.trim() || employee.name || employee.fullName || 'Unknown',
        email: employee.email || '',
        initials: `${firstName?.[0] || ''}${lastName?.[0] || ''}`,
        profilePicture: employee.profilePicture || employee.avatar || '',
      };
      
      console.log('Mapped user:', user);
      return user;
    });
    
    console.log('Final mapped users:', mappedUsers);
    return mappedUsers;
  }, [employeesData]);

  // Get selected users from the action's userIds
  const selectedUsers = users.filter(user => action.userIds.includes(user.id));

  // Get action type display name
  const getActionTypeDisplay = () => {
    return action.type === ApproverActionType.APPROVAL ? 'Approval' : 'Notification';
  };

  return (
    <div className="border rounded-md p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{getActionTypeDisplay()}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {action.type === ApproverActionType.APPROVAL && (
        <div className="grid grid-cols-1 gap-2">
          <Select
            value={action.mode}
            onValueChange={(value) => onUpdateMode(value as ApprovalMode)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Approval Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ApprovalMode.ALL}>All must approve</SelectItem>
              <SelectItem value={ApprovalMode.ANY}>Anyone can approve</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {selectedUsers.map(user => (
            <Badge
              key={user.id}
              className="flex items-center gap-1 pl-1 pr-1.5"
              variant="secondary"
            >
              <Avatar className="h-5 w-5">
                {user.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.initials || user.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <span>{user.name}</span>
              <Button
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1"
                onClick={() => onRemoveUser(user)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          <Popover
            open={isUserSelectionOpen}
            onOpenChange={onUserSelectionOpenChange}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Add User
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" side="top">
              <Command>
                <CommandInput 
                  placeholder="Search users..." 
                  value={userSearchQuery}
                  onValueChange={onUserSearchQueryChange}
                  autoFocus
                />
                
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {isLoading ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        <div className="animate-pulse flex justify-center">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </div>
                      </div>
                    ) : availableUsers && availableUsers.length > 0 ? (
                      availableUsers.map(user => (
                        <CommandItem
                          key={user.id}
                          value={user.name}
                          onSelect={() => {
                            console.log('User selected:', user);
                            onAddUser(user);
                          }}
                          disabled={action.userIds.includes(user.id)}
                          className="flex items-center gap-2"
                        >
                          <Avatar className="h-6 w-6">
                            {user.profilePicture ? (
                              <AvatarImage src={user.profilePicture} alt={user.name} />
                            ) : (
                              <AvatarFallback>{user.initials || user.name.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <span>{user.name}</span>
                          {action.userIds.includes(user.id) && (
                            <Check className="h-4 w-4 ml-auto opacity-70" />
                          )}
                        </CommandItem>
                      ))
                    ) : userSearchQuery ? (
                      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                        No users found
                      </CommandEmpty>
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Start typing to search for users
                      </div>
                    )}
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {action.userIds.length === 0 && (
          <p className="text-xs text-muted-foreground">No users added yet</p>
        )}
      </div>
    </div>
  );
};
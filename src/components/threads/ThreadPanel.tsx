'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ThreadEntityType, ThreadMessage } from '../../services/threadService';
import {
  useCreateThread,
  useMarkThreadRead,
  useReplyToThread,
  useThreadMessages,
  useThread,
} from '../../hooks/useThreads';
import { Button } from '@potta/components/shadcn/button';
import { Textarea } from '@potta/components/shadcn/textarea';
import { Input } from '@potta/components/shadcn/input';
import {
  Loader2,
  MessageSquare,
  Send,
  X,
  Reply,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '../../app/(routes)/auth/AuthContext';
import { useEmployees } from '../../app/(routes)/account_payables/spend-program/hooks/useEmployees';

interface ThreadPanelProps {
  entityType: ThreadEntityType;
  entityId?: string;
  entityDisplayName?: string;
  emptyStateMessage?: string;
}

const formatTime = (isoDate?: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const formatMessageTime = (isoDate?: string) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export const ThreadPanel = ({
  entityType,
  entityId,
  entityDisplayName,
  emptyStateMessage = 'No messages yet. Start the conversation!',
}: ThreadPanelProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [seedSubject, setSeedSubject] = useState('');
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ThreadMessage | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [mentionState, setMentionState] = useState<{
    isActive: boolean;
    query: string;
    position: { top: number; left: number };
    selectedIndex: number;
  }>({
    isActive: false,
    query: '',
    position: { top: 0, left: 0 },
    selectedIndex: 0,
  });
  const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionPopupRef = useRef<HTMLDivElement>(null);

  // Fetch current user's ID (try multiple possible locations)
  const currentUserId = useMemo(() => {
    if (!user) return undefined;
    // Try different possible locations for user ID
    return (
      user.id ||
      (user as any).userId ||
      (user as any).uuid ||
      (user as any).user?.id ||
      (user as any).session?.userId
    );
  }, [user]);

  // Fetch all employees for name resolution
  const { data: employees = [] } = useEmployees();

  // Create a map of userId to user data (name, profile picture, etc.)
  const userDataMap = useMemo(() => {
    const map: Record<
      string,
      { name: string; profilePicture?: string; email?: string }
    > = {};
    employees.forEach((emp: any) => {
      const userId = emp.uuid || emp.id;
      if (userId) {
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
        const userData = {
          name: fullName || emp.email || 'Unknown User',
          profilePicture: emp.profilePicture,
          email: emp.email,
        };
        map[userId] = userData;
        // Also map by id if different from uuid
        if (emp.id && emp.id !== userId) {
          map[emp.id] = userData;
        }
      }
    });
    return map;
  }, [employees]);

  // Helper to get user profile from message or fallback to lookup
  const getUserProfileFromMessage = useCallback((msg?: ThreadMessage) => {
    if (!msg) return null;
    return msg.actor || msg.user || null;
  }, []);

  // Fetch the single thread (auto-provisioned at entity creation)
  const {
    data: thread,
    isLoading: loadingThread,
    error: threadError,
  } = useThread(entityType, entityId, !!entityId);

  // Create user profile map from thread's participantProfiles (after thread is fetched)
  const userProfileMap = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; email?: string; profilePicture?: string }
    >();

    // First, use participantProfiles from thread (has actual user data)
    if (thread?.participantProfiles && Array.isArray(thread.participantProfiles)) {
      thread.participantProfiles.forEach((profile: any) => {
        const userId = profile.userId || profile.user?.id;
        if (userId && profile.user) {
          const user = profile.user;
          
          // Extract display name - prioritize username, then displayName, then firstName+lastName, then email
          // But NEVER use the user ID as the name
          let displayName: string | undefined;
          
          // First priority: username (what the user wants to see)
          if (user.username && user.username.trim() && user.username !== userId) {
            displayName = user.username.trim();
          } else if (user.displayName && user.displayName.trim() && user.displayName !== userId) {
            displayName = user.displayName.trim();
          } else {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            if (fullName && fullName !== userId && fullName.length > 0) {
              displayName = fullName;
            } else if (user.email && user.email !== userId && user.email.includes('@')) {
              // Only use email if it's a valid email format (contains @)
              displayName = user.email;
            }
          }
          
          // Only filter out if the name is literally the userId or a UUID format
          // Be more lenient - if we have ANY name (even if it's not perfect), use it
          const isInvalidName = 
            !displayName || 
            !displayName.trim() || 
            displayName === userId ||
            displayName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i); // UUID format
          
          if (!isInvalidName) {
            map.set(userId, {
              id: userId,
              name: displayName.trim(),
              email: user.email,
              profilePicture:
                user.profilePicture || user.avatar || user.image || undefined,
            });
          } else {
            console.warn('Skipping participant with invalid name:', {
              userId,
              displayName,
              username: user.username,
              userDisplayName: user.displayName,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              fullUser: user,
            });
          }
        }
      });
    }

    // Debug logging
    console.log('userProfileMap created:', {
      participantProfilesCount: thread?.participantProfiles?.length || 0,
      mapSize: map.size,
      mapEntries: Array.from(map.entries()).map(([id, p]) => ({
        id,
        name: p.name,
        email: p.email,
      })),
      rawParticipantProfiles: thread?.participantProfiles?.map((p: any) => ({
        userId: p.userId,
        user: {
          id: p.user?.id,
          username: p.user?.username,
          displayName: p.user?.displayName,
          firstName: p.user?.firstName,
          lastName: p.user?.lastName,
          email: p.user?.email,
        },
      })),
    });

    return map;
  }, [thread?.participantProfiles]);

  // Get authenticated user's profile from participantProfiles (after thread is fetched)
  const authenticatedUserProfile = useMemo(() => {
    if (!currentUserId || !thread?.participantProfiles) return null;
    
    // Find the authenticated user in participantProfiles
    // Match by userId or user.id, handling both string and UUID formats
    const profile = thread.participantProfiles.find((p: any) => {
      const profileUserId = p.userId || p.user?.id;
      // Compare both as strings to handle UUID format differences
      return (
        profileUserId === currentUserId ||
        String(profileUserId) === String(currentUserId)
      );
    });
    
    if (profile?.user) {
      const user = profile.user;
      return {
        id: currentUserId,
        name:
          user.username ||
          user.displayName ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email ||
          'Unknown User',
        email: user.email,
        profilePicture: user.profilePicture || user.avatar || user.image || undefined,
      };
    }
    
    return null;
  }, [currentUserId, thread?.participantProfiles]);

  // Helper to get user display name (prioritize profile from thread, then message, then lookup)
  // Must be defined AFTER userProfileMap and authenticatedUserProfile
  const getUserDisplayName = useCallback(
    (userId?: string, userProfile?: any) => {
      if (!userId) return 'Unknown User';
      
      // If this is the current user, use their profile from participantProfiles
      if (userId === currentUserId && authenticatedUserProfile) {
        return authenticatedUserProfile.name;
      }

      // First, check userProfileMap (from thread's participantProfiles)
      const profileFromThread = userProfileMap.get(userId);
      if (profileFromThread) {
        return profileFromThread.name;
      }

      // Use profile from message if available
      if (userProfile) {
        const name =
          userProfile.name ||
          userProfile.username ||
          userProfile.displayName ||
          `${userProfile.firstName || ''} ${
            userProfile.lastName || ''
          }`.trim() ||
          userProfile.email ||
          'Unknown User';
        return name;
      }

      // Fallback to lookup
      return userDataMap[userId]?.name || `User ${userId.slice(0, 8)}`;
    },
    [userDataMap, currentUserId, userProfileMap, authenticatedUserProfile]
  );

  // Helper to get user profile picture (prioritize profile from thread, then message, then lookup)
  // Must be defined AFTER userProfileMap and authenticatedUserProfile
  const getUserProfilePicture = useCallback(
    (userId?: string, userProfile?: any) => {
      if (!userId) return undefined;

      // If this is the current user, use their profile from participantProfiles
      if (userId === currentUserId && authenticatedUserProfile?.profilePicture) {
        return authenticatedUserProfile.profilePicture;
      }

      // First, check userProfileMap (from thread's participantProfiles)
      const profileFromThread = userProfileMap.get(userId);
      if (profileFromThread?.profilePicture) {
        return profileFromThread.profilePicture;
      }

      // Use profile from message if available
      if (userProfile) {
        return (
          userProfile.profilePicture ||
          userProfile.avatar ||
          userProfile.image ||
          undefined
        );
      }

      // Fallback to lookup
      return userDataMap[userId]?.profilePicture;
    },
    [userDataMap, userProfileMap, currentUserId, authenticatedUserProfile]
  );

  // Helper to get user email (prioritize profile from thread, then message, then lookup)
  // Must be defined AFTER userProfileMap and authenticatedUserProfile
  const getUserEmail = useCallback(
    (userId?: string, userProfile?: any) => {
      if (!userId) return undefined;

      // First, check userProfileMap (from thread's participantProfiles)
      const profileFromThread = userProfileMap.get(userId);
      if (profileFromThread?.email) {
        return profileFromThread.email;
      }

      // Use profile from message if available
      if (userProfile) {
        return userProfile.email;
      }

      // Fallback to lookup
      return userDataMap[userId]?.email;
    },
    [userDataMap, userProfileMap]
  );

  // Auto-select thread when it loads
  const threadId = thread?.uuid || thread?.id || null;

  // Fetch messages for the thread
  const {
    data: messages,
    isLoading: loadingMessages,
    error: messagesError,
  } = useThreadMessages(
    entityType,
    entityId,
    threadId || undefined,
    !!threadId
  );

  // Auto-scroll to bottom when new messages arrive
  const messagesArray: ThreadMessage[] = Array.isArray(messages)
    ? messages
    : [];

  // Get participants ONLY from thread's participantProfiles (not from messages)
  const participants = useMemo(() => {
    const participantList: Array<{
      id: string;
      name: string;
      email?: string;
      profilePicture?: string;
    }> = [];

    console.log('Building participants list:', {
      currentUserId,
      userProfileMapSize: userProfileMap.size,
      userProfileMapEntries: Array.from(userProfileMap.entries()).map(([id, p]) => ({
        id,
        name: p.name,
        isCurrentUser: id === currentUserId || String(id) === String(currentUserId),
      })),
    });

    // ONLY use userProfileMap (from thread's participantProfiles)
    userProfileMap.forEach((profile, userId) => {
      // Compare user IDs as strings to handle UUID format differences
      const isCurrentUser =
        currentUserId &&
        (userId === currentUserId ||
         String(userId) === String(currentUserId) ||
         String(userId).toLowerCase() === String(currentUserId).toLowerCase());

      // Only exclude if it's the current user
      // The name validation was already done in userProfileMap creation
      if (!isCurrentUser) {
        participantList.push(profile);
      } else {
        console.log('Filtered out participant (current user):', {
          userId,
          currentUserId,
          profileName: profile.name,
        });
      }
    });

    // Fallback: If no participants found, try to extract directly from participantProfiles
    // This handles cases where userProfileMap filtering was too strict or all were filtered as current user
    if (participantList.length === 0 && thread?.participantProfiles && Array.isArray(thread.participantProfiles)) {
      console.warn('No participants in list, trying fallback extraction from participantProfiles', {
        participantProfilesCount: thread.participantProfiles.length,
        userProfileMapSize: userProfileMap.size,
        currentUserId,
      });
      
      thread.participantProfiles.forEach((profile: any) => {
        const userId = profile.userId || profile.user?.id;
        if (userId && profile.user) {
          const user = profile.user;
          
          // More lenient current user check - compare as strings and handle case differences
          const profileUserIdStr = String(userId).toLowerCase().trim();
          const currentUserIdStr = currentUserId ? String(currentUserId).toLowerCase().trim() : '';
          const isCurrentUser = currentUserIdStr && (
            profileUserIdStr === currentUserIdStr ||
            profileUserIdStr.includes(currentUserIdStr) ||
            currentUserIdStr.includes(profileUserIdStr)
          );
          
          if (!isCurrentUser) {
            // Try to extract name with fallback - be very lenient
            const name =
              user.username ||
              user.displayName ||
              `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
              user.email ||
              `User ${userId.slice(0, 8)}`;
            
            // Only filter out if name is literally a UUID format
            const isUUID = name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
            
            if (!isUUID && name && name.trim()) {
              participantList.push({
                id: userId,
                name: name.trim(),
                email: user.email,
                profilePicture: user.profilePicture || user.avatar || user.image || undefined,
              });
              console.log('Added participant from fallback:', {
                userId,
                name: name.trim(),
                username: user.username,
                displayName: user.displayName,
              });
            }
          } else {
            console.log('Skipped participant (identified as current user):', {
              userId,
              currentUserId,
              profileUserIdStr,
              currentUserIdStr,
            });
          }
        }
      });
    }

    // Sort by name for consistent display
    participantList.sort((a, b) => a.name.localeCompare(b.name));

    // Debug logging
    console.log('Participants for mentions (from participantProfiles only):', {
      userProfileMapSize: userProfileMap.size,
      userProfileMapEntries: Array.from(userProfileMap.entries()).map(([id, p]) => ({
        id,
        name: p.name,
      })),
      currentUserId,
      participantsCount: participantList.length,
      participants: participantList.map((p) => ({ id: p.id, name: p.name })),
      threadParticipantProfiles: thread?.participantProfiles?.map((p: any) => ({
        userId: p.userId,
        username: p.user?.username,
        userDisplayName: p.user?.displayName,
        firstName: p.user?.firstName,
        lastName: p.user?.lastName,
        userName: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim(),
      })),
    });

    return participantList;
  }, [userProfileMap, currentUserId, thread?.participantProfiles]);

  // Filter participants based on mention query
  const filteredParticipants = useMemo(() => {
    if (!mentionState.query) return participants;
    const query = mentionState.query.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query)
    );
  }, [participants, mentionState.query]);

  const createThreadMutation = useCreateThread(entityType, entityId);
  const replyMutation = useReplyToThread(
    entityType,
    entityId,
    threadId || undefined
  );
  const markReadMutation = useMarkThreadRead(
    entityType,
    entityId,
    threadId || undefined
  );

  // Mark thread as read when it loads or messages change
  useEffect(() => {
    if (threadId && messages && messages.length > 0) {
      markReadMutation.mutate(threadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesArray.length]); // Scroll when message count changes

  // Close mention popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionPopupRef.current &&
        !mentionPopupRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setMentionState((prev) => ({ ...prev, isActive: false }));
      }
    };

    if (mentionState.isActive) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [mentionState.isActive]);

  const hasMessages = messagesArray.length > 0;
  const isSending = createThreadMutation.isPending || replyMutation.isPending;
  const isInputDisabled = !entityId || isSending;

  // Handle mention detection and insertion
  const handleMessageChange = (value: string) => {
    setMessage(value);

    // Detect @ mention
    const cursorPosition = textareaRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if we're still in a mention (no space after @)
      if (!textAfterAt.match(/[\s\n]/)) {
        const query = textAfterAt.toLowerCase();
        const textarea = textareaRef.current;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          const scrollTop = textarea.scrollTop;
          const lineHeight =
            parseInt(getComputedStyle(textarea).lineHeight) || 20;
          const lines = textBeforeCursor.split('\n').length - 1;
          const top = rect.top + lines * lineHeight - scrollTop - 200; // Position above

          setMentionState({
            isActive: true,
            query,
            position: {
              top: Math.max(10, top),
              left: rect.left,
            },
            selectedIndex: 0,
          });
          return;
        }
      }
    }

    // Close mention popup if @ is removed or space is added
    if (mentionState.isActive) {
      setMentionState((prev) => ({ ...prev, isActive: false }));
    }

    // Extract tagged user IDs from message
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const taggedIds: string[] = [];
    let match;
    while ((match = mentionRegex.exec(value)) !== null) {
      taggedIds.push(match[2]); // User ID is in the second capture group
    }
    setTaggedUserIds(taggedIds);
  };

  // Insert mention into message
  const insertMention = (participant: { id: string; name: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = message.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const beforeMention = message.substring(0, lastAtIndex);
      const afterMention = message.substring(cursorPosition);
      // Store formatted mention internally, but display only username
      const mentionText = `@[${participant.name}](${participant.id})`;
      const displayText = `@${participant.name}`;

      const newMessage = beforeMention + mentionText + ' ' + afterMention;
      setMessage(newMessage);

      // Update cursor position (use display text length for visual positioning)
      setTimeout(() => {
        const newPosition = lastAtIndex + displayText.length + 1;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);

      // Update tagged user IDs
      const newTaggedIds = [...taggedUserIds, participant.id];
      setTaggedUserIds(newTaggedIds);
    }

    setMentionState((prev) => ({ ...prev, isActive: false }));
  };

  // Convert message to display format (show only usernames, not IDs)
  const getDisplayMessage = (msg: string): string => {
    // Replace @[Name](userId) with @Name for display
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    return msg.replace(mentionRegex, '@$1');
  };

  // Convert display message back to internal format (preserve mention IDs)
  const convertDisplayToInternal = (displayValue: string, currentInternalMessage: string): string => {
    // Extract all mentions from current internal message to preserve their IDs
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions = new Map<string, string>(); // name -> id
    let match;
    while ((match = mentionRegex.exec(currentInternalMessage)) !== null) {
      mentions.set(match[1], match[2]);
    }
    
    // Replace @Name in display with @[Name](id) if we have the ID
    let result = displayValue;
    const displayMentionRegex = /@(\w+)/g;
    const processedNames = new Set<string>();
    
    while ((match = displayMentionRegex.exec(displayValue)) !== null) {
      const name = match[1];
      if (!processedNames.has(name)) {
        processedNames.add(name);
        const id = mentions.get(name);
        if (id) {
          // Replace first occurrence only
          result = result.replace(`@${name}`, `@[${name}](${id})`);
        }
      }
    }
    
    return result;
  };

  // Convert mention format to plain text for backend
  // @[Name](userId) -> @Name
  const convertMentionsToPlainText = (text: string): string => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(mentionRegex, '@$1');
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() || isInputDisabled) return;

    try {
      // Extract final tagged user IDs from message
      const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
      const finalTaggedIds: string[] = [];
      let match;
      while ((match = mentionRegex.exec(message)) !== null) {
        finalTaggedIds.push(match[2]);
      }

      // Convert message to plain text (remove mention format for backend)
      const plainTextMessage = convertMentionsToPlainText(message.trim());

      if (!threadId) {
        // Create thread with first message
        await createThreadMutation.mutateAsync({
          subject: showSubjectInput
            ? seedSubject.trim() || undefined
            : undefined,
          initialMessage: plainTextMessage,
          taggedUserIds: finalTaggedIds.length > 0 ? finalTaggedIds : undefined,
        });
        setSeedSubject('');
        setShowSubjectInput(false);
      } else {
        // Reply to existing thread
        await replyMutation.mutateAsync({
          message: plainTextMessage,
          parentMessageId: replyingTo?.uuid || replyingTo?.id || undefined,
          taggedUserIds: finalTaggedIds.length > 0 ? finalTaggedIds : undefined,
        });
      }
      setMessage('');
      setReplyingTo(null);
      setTaggedUserIds([]);
      setMentionState((prev) => ({ ...prev, isActive: false }));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error is already handled by the mutation's onError
    }
  };

  const handleReplyToMessage = (msg: ThreadMessage) => {
    setReplyingTo(msg);
    // Focus on textarea
    setTimeout(() => {
      const textarea = document.querySelector(
        '#thread-message-input'
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention popup navigation
    if (mentionState.isActive) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          selectedIndex: Math.min(
            prev.selectedIndex + 1,
            filteredParticipants.length - 1
          ),
        }));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        if (filteredParticipants[mentionState.selectedIndex]) {
          insertMention(filteredParticipants[mentionState.selectedIndex]);
        }
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setMentionState((prev) => ({ ...prev, isActive: false }));
        return;
      }
    }

    // Normal message sending
    if (event.key === 'Enter' && !event.shiftKey && !mentionState.isActive) {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  // Parse message to display mentions with user profiles
  const parseMessageWithMentions = (
    text: string,
    isCurrentUser: boolean,
    taggedUsers?: any[]
  ) => {
    // Create a map of tagged users by ID and by name for quick lookup
    const taggedUsersMapById = new Map<string, any>();
    const taggedUsersMapByName = new Map<string, any>();
    
    // First, add users from taggedUsers array (from message)
    if (taggedUsers && Array.isArray(taggedUsers)) {
      taggedUsers.forEach((user: any) => {
        const userId = user.id || user.uuid || user.userId;
        if (userId) {
          taggedUsersMapById.set(userId, user);
        }
        // Also map by name for plain @ mentions
        const userName =
          user.name ||
          user.displayName ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email;
        if (userName) {
          taggedUsersMapByName.set(userName.toLowerCase(), user);
        }
      });
    }
    
    // Also add users from userProfileMap as fallback (from thread's participantProfiles)
    userProfileMap.forEach((profile, userId) => {
      if (!taggedUsersMapById.has(userId)) {
        taggedUsersMapById.set(userId, {
          id: userId,
          name: profile.name,
          displayName: profile.name,
          email: profile.email,
          profilePicture: profile.profilePicture,
        });
      }
    });

    const parts: Array<{
      type: 'text' | 'mention';
      content: string;
      userId?: string;
      userProfile?: any;
    }> = [];
    let lastIndex = 0;
    let match;

    // First, try to parse formatted mentions @[Name](userId) (from UI input)
    const formattedMentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = formattedMentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }
      // Add mention with user profile if available
      const userId = match[2];
      // Try to get user profile from taggedUsersMap, then userProfileMap, then use helper functions
      let userProfile = taggedUsersMapById.get(userId);
      if (!userProfile) {
        // Fallback to userProfileMap
        const profileFromMap = userProfileMap.get(userId);
        if (profileFromMap) {
          userProfile = {
            id: userId,
            name: profileFromMap.name,
            displayName: profileFromMap.name,
            email: profileFromMap.email,
            profilePicture: profileFromMap.profilePicture,
          };
        } else {
          // Last resort: use helper functions to get display name
          const displayName = getUserDisplayName(userId);
          userProfile = {
            id: userId,
            name: displayName,
            displayName: displayName,
            profilePicture: getUserProfilePicture(userId),
          };
        }
      }
      parts.push({
        type: 'mention',
        content: userProfile?.name || userProfile?.displayName || match[1], // Use actual name from profile
        userId: userId,
        userProfile: userProfile,
      });
      lastIndex = match.index + match[0].length;
    }

    // If no formatted mentions found, try plain @ mentions (from backend)
    if (parts.length === 0 || lastIndex === 0) {
      // Reset if we found formatted mentions
      if (lastIndex > 0) {
        // We already processed formatted mentions, just add remaining text
        if (lastIndex < text.length) {
          parts.push({
            type: 'text',
            content: text.substring(lastIndex),
          });
        }
      } else {
        // No formatted mentions, parse plain @ mentions
        const plainMentionRegex = /@(\w+)/g;
        lastIndex = 0;
        while ((match = plainMentionRegex.exec(text)) !== null) {
          // Add text before mention
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: text.substring(lastIndex, match.index),
            });
          }
          // Try to find user profile by name
          const mentionName = match[1].toLowerCase();
          const userProfile = taggedUsersMapByName.get(mentionName) || null;
          parts.push({
            type: 'mention',
            content: match[1], // Mentioned name
            userId: userProfile?.id || userProfile?.uuid || userProfile?.userId,
            userProfile: userProfile,
          });
          lastIndex = match.index + match[0].length;
        }
        // Add remaining text
        if (lastIndex < text.length) {
          parts.push({
            type: 'text',
            content: text.substring(lastIndex),
          });
        }
      }
    } else {
      // Add remaining text after formatted mentions
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex),
        });
      }
    }

    if (parts.length === 0) {
      return <>{text}</>;
    }

    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'mention') {
            // Use profile from taggedUsers if available, otherwise fallback to lookup
            const userProfile = part.userProfile;
            const userName = userProfile
              ? userProfile.name ||
                `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() ||
                userProfile.email ||
                part.content
              : part.content;
            const profilePicture = userProfile
              ? userProfile.profilePicture ||
                userProfile.avatar ||
                userProfile.image ||
                undefined
              : getUserProfilePicture(part.userId);
            const displayName = userProfile
              ? userName
              : getUserDisplayName(part.userId, userProfile);

            // Ensure we have a valid display name
            const finalDisplayName = displayName || part.content || 'Unknown User';
            
            return (
              <span
                key={index}
                className={`inline-flex items-center gap-1 font-medium ${
                  isCurrentUser
                    ? 'text-green-100 bg-green-600/30 px-1.5 py-0.5 rounded'
                    : 'text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded'
                }`}
                title={finalDisplayName}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={finalDisplayName}
                    className="h-4 w-4 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('span');
                      fallback.className = 'text-xs';
                      fallback.textContent = finalDisplayName.charAt(0).toUpperCase();
                      target.parentNode?.appendChild(fallback);
                    }}
                  />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-medium text-gray-600">
                    {finalDisplayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>@{finalDisplayName}</span>
              </span>
            );
          }
          return <span key={index}>{part.content}</span>;
        })}
      </>
    );
  };


  if (!entityId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 text-center">
        Threading is unavailable for this record.
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {thread?.subject || entityDisplayName || 'Conversation'}
            </h3>
            {(() => {
              // Use participantProfiles count if available, otherwise fallback to participants
              const participantCount =
                thread?.participantProfiles?.length ||
                thread?.participants?.length ||
                0;
              return participantCount > 0 ? (
                <p className="text-xs text-gray-500">
                  {participantCount} participant{participantCount !== 1 ? 's' : ''}
                </p>
              ) : null;
            })()}
          </div>
        </div>
        {loadingThread && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {/* Error display for thread fetch */}
      {threadError &&
        (threadError as any)?.response?.status !== 404 &&
        !loadingThread && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center mx-4 mt-4">
            <p className="text-sm text-red-600 mb-3">
              Error loading thread:{' '}
              {(threadError as any)?.message || 'Unknown error'}.
            </p>
          </div>
        )}

      {/* Messages Area - WhatsApp style */}
      <div
        ref={messagesContainerRef}
        id="thread-messages"
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {loadingMessages && messagesArray.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : hasMessages ? (
          messagesArray.map((msg, index) => {
            const isCurrentUser =
              msg.userId === currentUserId || msg.actorId === currentUserId;
            const userProfile = msg.actor || msg.user;
            const senderName = getUserDisplayName(
              msg.userId || msg.actorId,
              userProfile
            );
            const senderProfilePicture = getUserProfilePicture(
              msg.userId || msg.actorId,
              userProfile
            );
            const isHovered = hoveredMessageId === (msg.uuid || msg.id);
            const prevMessage = index > 0 ? messagesArray[index - 1] : null;
            const showSenderName =
              !prevMessage ||
              prevMessage.userId !== msg.userId ||
              prevMessage.actorId !== msg.actorId;

            return (
              <div
                key={msg.uuid || msg.id}
                className={`flex ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                } group`}
                onMouseEnter={() =>
                  setHoveredMessageId(msg.uuid || msg.id || null)
                }
                onMouseLeave={() => {
                  setHoveredMessageId(null);
                }}
              >
                <div
                  className={`flex items-end gap-2 max-w-[75%] ${
                    isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar for other users */}
                  {!isCurrentUser && (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mb-1 overflow-hidden">
                      {senderProfilePicture ? (
                        <img
                          src={senderProfilePicture}
                          alt={senderName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs font-medium text-gray-600">${senderName
                                .charAt(0)
                                .toUpperCase()}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">
                          {senderName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {/* Sender name for other users */}
                    {!isCurrentUser && showSenderName && (
                      <p className="text-xs font-medium text-gray-600 px-1">
                        {senderName}
                      </p>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`relative rounded-2xl px-4 py-2 shadow-sm ${
                        isCurrentUser
                          ? 'bg-green-500 text-white rounded-tr-sm'
                          : 'bg-white text-gray-900 rounded-tl-sm border border-gray-200'
                      }`}
                    >
                      {/* Reply preview if this is a reply */}
                      {msg.parentMessage && (
                        <div
                          className={`mb-2 pb-2 border-l-2 pl-2 ${
                            isCurrentUser
                              ? 'border-green-300'
                              : 'border-gray-300'
                          }`}
                        >
                          <p
                            className={`text-xs font-medium ${
                              isCurrentUser ? 'text-green-100' : 'text-gray-600'
                            }`}
                          >
                            {getUserDisplayName(
                              msg.parentMessage.userId ||
                                msg.parentMessage.actorId,
                              msg.parentMessage.actor || msg.parentMessage.user
                            )}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isCurrentUser ? 'text-green-50' : 'text-gray-500'
                            }`}
                          >
                            {parseMessageWithMentions(
                              msg.parentMessage.message,
                              msg.parentMessage.userId === currentUserId || msg.parentMessage.actorId === currentUserId,
                              msg.parentMessage.taggedUsers
                            )}
                          </p>
                        </div>
                      )}

                      {/* Message content with mentions */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {parseMessageWithMentions(
                          msg.message,
                          isCurrentUser,
                          msg.taggedUsers
                        )}
                      </p>

                      {/* Time and status */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p
                          className={`text-xs ${
                            isCurrentUser ? 'text-green-50' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </p>
                        {isCurrentUser && (
                          <span className="text-green-50">✓✓</span>
                        )}
                      </div>

                      {/* Action buttons on hover */}
                      {isHovered && (
                        <div
                          className={`absolute top-0 ${
                            isCurrentUser ? 'left-0' : 'right-0'
                          } -translate-y-full mb-1 flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1`}
                        >
                          <button
                            onClick={() => handleReplyToMessage(msg)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Reply"
                          >
                            <Reply className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avatar for current user */}
                  {isCurrentUser && (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mb-1 overflow-hidden">
                      {getUserProfilePicture(currentUserId) ? (
                        <img
                          src={getUserProfilePicture(currentUserId)}
                          alt={getUserDisplayName(currentUserId)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs font-medium text-white">${getUserDisplayName(
                                currentUserId
                              )
                                .charAt(0)
                                .toUpperCase()}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs font-medium text-white">
                          {getUserDisplayName(currentUserId)
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500 text-center">
              {emptyStateMessage}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Reply className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                Replying to{' '}
                {getUserDisplayName(
                  replyingTo.userId || replyingTo.actorId,
                  replyingTo.actor || replyingTo.user
                )}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {replyingTo.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Message Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {!threadId && !showSubjectInput && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSubjectInput(true)}
            size="sm"
            className="w-full mb-2"
          >
            Start Conversation
          </Button>
        )}

        {!threadId && showSubjectInput && (
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="Subject (optional)"
              value={seedSubject}
              onChange={(e) => setSeedSubject(e.target.value)}
              className="flex-1"
              disabled={isInputDisabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSubjectInput(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {(threadId || showSubjectInput) && (
          <form
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 relative"
          >
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                id="thread-message-input"
                placeholder="Type a message... (use @ to mention)"
                rows={1}
                value={getDisplayMessage(message)}
                onChange={(e) => {
                  const displayValue = e.target.value;
                  // Convert display back to internal format, preserving mention IDs
                  const internalValue = convertDisplayToInternal(displayValue, message);
                  handleMessageChange(internalValue);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none min-h-[40px] max-h-[120px] pr-10"
                disabled={isInputDisabled}
              />
              {/* Mention popup */}
              {mentionState.isActive && (
                <div
                  ref={mentionPopupRef}
                  className="absolute bottom-full left-0 mb-2 w-full max-w-[280px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[200px] overflow-y-auto"
                  style={{
                    top: 'auto',
                    bottom: '100%',
                    transform: 'translateY(-8px)',
                  }}
                >
                  <div className="p-2">
                    <p className="text-xs text-gray-500 px-2 py-1 mb-1">
                      Mention someone
                    </p>
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map((participant, index) => (
                      <button
                        key={participant.id}
                        type="button"
                        onClick={() => insertMention(participant)}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 transition-colors ${
                          index === mentionState.selectedIndex
                            ? 'bg-blue-50 border border-blue-200'
                            : ''
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {participant.profilePicture ? (
                            <img
                              src={participant.profilePicture}
                              alt={participant.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback to initial if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-xs font-medium text-gray-600">${participant.name
                                    .charAt(0)
                                    .toUpperCase()}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {participant.name}
                          </p>
                          {participant.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {participant.email}
                            </p>
                          )}
                        </div>
                      </button>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-center text-sm text-gray-500">
                        No participants available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || isInputDisabled}
              size="icon"
              className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ThreadPanel;

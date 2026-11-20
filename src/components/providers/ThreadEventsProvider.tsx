'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getAuthConfig } from '../../../config/auth.config';
import { useAuth } from '../../app/(routes)/auth/AuthContext';
import { THREAD_QUERY_KEYS } from '../../hooks/useThreads';
import type { ThreadEntityType } from '../../services/threadService';

interface ThreadEventsProviderProps {
  children: ReactNode;
}

type ThreadStreamEventType = 'thread_created' | 'thread_reply' | 'thread_read';

interface ThreadStreamEvent {
  type: ThreadStreamEventType;
  orgId: string;
  locationContextId?: string | null;
  threadId: string;
  entityType: ThreadEntityType | string;
  entityId: string;
  actorId: string;
  recipientUserIds: string[];
  messageId?: string;
  messagePreview?: string;
  metadata?: Record<string, any>;
  emittedAt: string;
}

interface ThreadEventsContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const ThreadEventsContext = createContext<ThreadEventsContextValue>({
  socket: null,
  isConnected: false,
});

export const ThreadEventsProvider = ({
  children,
}: ThreadEventsProviderProps) => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user?.id) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const { apiUrl } = getAuthConfig();
    const baseUrl = (apiUrl || '').replace(/\/$/, '');
    const socket = io(`${baseUrl}/thread-events`, {
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('thread_events:connected', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('thread_events:event', (event: ThreadStreamEvent) => {
      const entityType = event.entityType as ThreadEntityType;
      queryClient.invalidateQueries({
        queryKey: THREAD_QUERY_KEYS.threads(entityType, event.entityId),
      });
      queryClient.invalidateQueries({
        queryKey: THREAD_QUERY_KEYS.threadMessages(
          entityType,
          event.entityId,
          event.threadId
        ),
      });
    });

    socket.on('thread_events:error', (payload) => {
      console.error('Thread stream error', payload?.message || payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, user?.id, queryClient]);

  const contextValue = useMemo(
    () => ({
      socket: socketRef.current,
      isConnected,
    }),
    [isConnected]
  );

  return (
    <ThreadEventsContext.Provider value={contextValue}>
      {children}
    </ThreadEventsContext.Provider>
  );
};

export const useThreadEvents = () => useContext(ThreadEventsContext);


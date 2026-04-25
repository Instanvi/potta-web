import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreateThreadPayload,
  ReplyThreadPayload,
  ThreadEntityType,
  threadService,
} from '../services/threadService';

export const THREAD_QUERY_KEYS = {
  threads: (entityType: ThreadEntityType, entityId?: string) => [
    'threads',
    entityType,
    entityId,
  ],
  threadMessages: (
    entityType: ThreadEntityType,
    entityId: string | undefined,
    threadId: string | undefined
  ) => ['threadMessages', entityType, entityId, threadId],
};

// Get the single thread for an entity (auto-provisioned at creation)
export const useThread = (
  entityType: ThreadEntityType,
  entityId?: string,
  enabled = true
) =>
  useQuery({
    queryKey: THREAD_QUERY_KEYS.threads(entityType, entityId),
    queryFn: () => threadService.getThread(entityType, entityId as string),
    enabled: enabled && !!entityId,
    staleTime: 30 * 1000,
  });

// Backward compatibility alias
export const useThreads = useThread;

export const useThreadMessages = (
  entityType: ThreadEntityType,
  entityId?: string,
  threadId?: string,
  enabled = true
) =>
  useQuery<import('../services/threadService').ThreadMessage[]>({
    queryKey: THREAD_QUERY_KEYS.threadMessages(entityType, entityId, threadId),
    queryFn: () =>
      threadService.getMessages(
        entityType,
        entityId as string,
        threadId as string
      ),
    enabled: enabled && !!entityId && !!threadId,
    staleTime: 30 * 1000,
  });

export const useCreateThread = (
  entityType: ThreadEntityType,
  entityId?: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateThreadPayload) =>
      threadService.createThread(entityType, entityId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: THREAD_QUERY_KEYS.threads(entityType, entityId),
      });
      queryClient.invalidateQueries({
        queryKey: THREAD_QUERY_KEYS.threadMessages(
          entityType,
          entityId,
          undefined
        ),
      });
      toast.success('Message posted');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to post message';
      toast.error(message);
    },
  });
};

export const useReplyToThread = (
  entityType: ThreadEntityType,
  entityId?: string,
  threadId?: string
) => {
  const queryClient = useQueryClient();
  const threadIdRef = useRef(threadId);

  // Update ref when threadId changes
  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  return useMutation({
    mutationFn: (payload: ReplyThreadPayload) => {
      const currentThreadId = threadIdRef.current || threadId;
      if (!currentThreadId) {
        throw new Error('Thread ID is required to reply');
      }
      return threadService.replyToThread(
        entityType,
        entityId as string,
        currentThreadId as string,
        payload
      );
    },
    onSuccess: () => {
      const currentThreadId = threadIdRef.current || threadId;
      const messageKey = THREAD_QUERY_KEYS.threadMessages(
        entityType,
        entityId,
        currentThreadId
      );
      queryClient.invalidateQueries({ queryKey: messageKey });
      queryClient.invalidateQueries({
        queryKey: THREAD_QUERY_KEYS.threads(entityType, entityId),
      });
      toast.success('Reply posted');
    },
    onError: (error: any) => {
      console.error('Reply error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to send reply';
      toast.error(message);
    },
  });
};

export const useMarkThreadRead = (
  entityType: ThreadEntityType,
  entityId?: string,
  threadId?: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (overrideThreadId?: string) =>
      threadService.markThreadRead(
        entityType,
        entityId as string,
        (overrideThreadId || threadId) as string
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: THREAD_QUERY_KEYS.threads(entityType, entityId),
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to mark thread as read';
      toast.error(message);
    },
  });
};

export const useDeleteMessage = (
  entityType: ThreadEntityType,
  entityId?: string,
  threadId?: string
) => {
  const queryClient = useQueryClient();
  const threadIdRef = useRef(threadId);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  return useMutation({
    mutationFn: (messageId: string) => {
      const currentThreadId = threadIdRef.current || threadId;
      if (!currentThreadId) {
        throw new Error('Thread ID is required to delete message');
      }
      return threadService.deleteMessage(
        entityType,
        entityId as string,
        currentThreadId as string,
        messageId
      );
    },
    onSuccess: () => {
      const currentThreadId = threadIdRef.current || threadId;
      const messageKey = THREAD_QUERY_KEYS.threadMessages(
        entityType,
        entityId,
        currentThreadId
      );
      queryClient.invalidateQueries({ queryKey: messageKey });
      queryClient.invalidateQueries({
        queryKey: THREAD_QUERY_KEYS.threads(entityType, entityId),
      });
      toast.success('Message deleted');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete message';
      toast.error(message);
    },
  });
};

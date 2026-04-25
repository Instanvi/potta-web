import axios from 'config/axios.config';

export type ThreadEntityType = 'INVOICE' | 'SPEND_REQUEST';

export interface ThreadParticipant {
  id: string;
  name?: string;
  avatarUrl?: string;
  userId?: string;
  participantType?: string;
  lastReadAt?: string;
  unreadCount?: number;
}

export interface ParticipantProfile {
  userId: string;
  participantType?: string;
  lastReadAt?: string;
  unreadCount?: number;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email?: string;
    profilePicture?: string;
    avatar?: string;
    image?: string;
  };
}

export interface ThreadSummary {
  uuid: string;
  id?: string; // Alias for uuid
  subject?: string | null;
  entityType: ThreadEntityType;
  entityId: string;
  lastMessagePreview?: string | null;
  lastMessageAt?: string;
  messageCount?: number;
  updatedAt?: string;
  createdAt?: string;
  unreadCount?: number;
  participants?: ThreadParticipant[];
  participantProfiles?: ParticipantProfile[]; // User profiles from API
  metadata?: Record<string, any>;
  status?: string;
}

export interface UserProfile {
  id: string;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  profilePicture?: string;
  avatar?: string;
  image?: string;
}

export interface ThreadMessage {
  uuid: string;
  id?: string; // Alias for uuid
  threadId: string;
  message: string;
  userId: string;
  actorId?: string; // Alias for userId
  actorName?: string;
  actor?: UserProfile; // User profile from API
  user?: UserProfile; // User profile from API (alternative field name)
  createdAt: string;
  parentMessageId?: string | null;
  parentMessage?: ThreadMessage | null;
  taggedUserIds?: string[];
  taggedUsers?: UserProfile[]; // User profiles for tagged users
  tags?: any[];
  isRead?: boolean;
  isEdited?: boolean;
  metadata?: Record<string, any>;
}

export interface ThreadWithMessages extends ThreadSummary {
  messages: ThreadMessage[];
}

export interface CreateThreadPayload {
  subject?: string;
  initialMessage: string;
  taggedUserIds?: string[];
}

export interface ReplyThreadPayload {
  message: string;
  parentMessageId?: string;
  messageType?: ThreadEntityType;
  taggedUserIds?: string[];
}

export interface MarkThreadReadPayload {
  messageId?: string;
}

const THREAD_BASE_PATHS: Record<ThreadEntityType, string> = {
  INVOICE: '/invoice',
  SPEND_REQUEST: '/procurement/spend-requests',
};

const buildThreadPath = (
  entityType: ThreadEntityType,
  entityId: string,
  suffix = ''
) => {
  const base = THREAD_BASE_PATHS[entityType];
  return `${base}/${entityId}/threads${suffix}`;
};

export const threadService = {
  // Get the single thread for an entity (auto-provisioned at creation)
  // API returns array with single thread or single thread object
  getThread: async (
    entityType: ThreadEntityType,
    entityId: string
  ): Promise<ThreadSummary | null> => {
    try {
      const response = await axios.get(buildThreadPath(entityType, entityId));
      const data = response.data;
      // Handle array response (legacy) or single object
      if (Array.isArray(data)) {
        const thread = data[0];
        if (thread) {
          // Add id alias for uuid
          thread.id = thread.uuid || thread.id;
        }
        return thread || null;
      }
      if (data) {
        // Add id alias for uuid
        data.id = data.uuid || data.id;
      }
      return data || null;
    } catch (error: any) {
      // If 404, thread doesn't exist yet (shouldn't happen but handle gracefully)
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createThread: async (
    entityType: ThreadEntityType,
    entityId: string,
    payload: CreateThreadPayload
  ): Promise<ThreadSummary> => {
    const response = await axios.post(
      buildThreadPath(entityType, entityId),
      payload
    );
    return response.data;
  },

  getMessages: async (
    entityType: ThreadEntityType,
    entityId: string,
    threadId: string
  ): Promise<ThreadMessage[]> => {
    const response = await axios.get(
      buildThreadPath(entityType, entityId, `/${threadId}/messages`)
    );
    const data = response.data;

    // API returns thread object with messages array inside
    if (data?.messages && Array.isArray(data.messages)) {
      // Normalize message format: preserve user profiles from API
      return data.messages.map((msg: any) => ({
        ...msg,
        id: msg.uuid || msg.id,
        actorId: msg.userId || msg.actorId,
        // Preserve user profile data from API
        actor: msg.actor || msg.user || null,
        user: msg.user || msg.actor || null,
        // Preserve tagged user profiles if available
        taggedUsers: msg.taggedUsers || msg.tags || [],
      }));
    }

    // Fallback: if messages is directly an array
    if (Array.isArray(data)) {
      return data.map((msg: any) => ({
        ...msg,
        id: msg.uuid || msg.id,
        actorId: msg.userId || msg.actorId,
        // Preserve user profile data from API
        actor: msg.actor || msg.user || null,
        user: msg.user || msg.actor || null,
        // Preserve tagged user profiles if available
        taggedUsers: msg.taggedUsers || msg.tags || [],
      }));
    }

    return [];
  },

  replyToThread: async (
    entityType: ThreadEntityType,
    entityId: string,
    threadId: string,
    payload: ReplyThreadPayload
  ): Promise<ThreadMessage> => {
    // Remove messageType from payload as backend doesn't expect it
    const { messageType, ...requestPayload } = payload;
    
    // Log payload for debugging
    console.log('Reply payload:', {
      url: buildThreadPath(entityType, entityId, `/${threadId}/messages`),
      payload: requestPayload,
    });
    
    const response = await axios.post(
      buildThreadPath(entityType, entityId, `/${threadId}/messages`),
      requestPayload
    );
    const data = response.data;
    // Normalize response: preserve user profile data from API
    if (data) {
      return {
        ...data,
        id: data.uuid || data.id,
        actorId: data.userId || data.actorId,
        // Preserve user profile data from API
        actor: data.actor || data.user || null,
        user: data.user || data.actor || null,
        // Preserve tagged user profiles if available
        taggedUsers: data.taggedUsers || data.tags || [],
      };
    }
    return data;
  },

  markThreadRead: async (
    entityType: ThreadEntityType,
    entityId: string,
    threadId: string,
    payload: MarkThreadReadPayload = {}
  ): Promise<void> => {
    await axios.post(
      buildThreadPath(entityType, entityId, `/${threadId}/read`),
      payload
    );
  },

  deleteMessage: async (
    entityType: ThreadEntityType,
    entityId: string,
    threadId: string,
    messageId: string
  ): Promise<void> => {
    await axios.delete(
      buildThreadPath(
        entityType,
        entityId,
        `/${threadId}/messages/${messageId}`
      )
    );
  },
};

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Chat } from 'stream-chat-react';
import { useAuth } from './AuthContext';
import { initStreamChat, disconnectStreamChat, getChatToken } from '../lib/streamChat';
import { CHAT_CONFIG } from '../config/env.config';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

/** Hook to get just the unread count — lightweight for navbar usage */
export const useChatUnread = () => {
  const context = useContext(ChatContext);
  return context?.totalUnread ?? 0;
};

/**
 * Check if Stream Chat is properly configured on the frontend
 */
const isChatConfigured = () => {
  return (
    CHAT_CONFIG.enabled &&
    CHAT_CONFIG.provider === 'stream' &&
    CHAT_CONFIG.stream.apiKey
  );
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  // Ref tracks whether a client was initialized (avoids stale closure in cleanup)
  const clientInitializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initChat = async () => {
      if (!isAuthenticated || !user) {
        setClient(null);
        setIsLoading(false);
        clientInitializedRef.current = false;
        return;
      }

      // Graceful fallback when Stream Chat credentials are missing
      if (!isChatConfigured()) {
        if (mounted) {
          setIsUnavailable(true);
          setClient(null);
          setIsLoading(false);
          setError('Chat service is not configured');
          clientInitializedRef.current = false;
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setIsUnavailable(false);

        // Get chat token from backend using standardized user._id
        const { token, userId } = await getChatToken();

        // Initialize Stream Chat
        const chatClient = await initStreamChat(userId || user._id, token, user);

        if (mounted && chatClient) {
          setClient(chatClient);
          clientInitializedRef.current = true;
        } else if (mounted && !chatClient) {
          setIsUnavailable(true);
          setError('Failed to connect to chat service');
          clientInitializedRef.current = false;
        }
      } catch (err) {
        if (mounted) {
          setIsUnavailable(true);
          setError(err.message || 'Failed to initialize chat');
          clientInitializedRef.current = false;
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initChat();

    return () => {
      mounted = false;
      if (clientInitializedRef.current) {
        disconnectStreamChat();
        clientInitializedRef.current = false;
      }
    };
  }, [isAuthenticated, user]);

  // Track unread message count from Stream Chat events
  useEffect(() => {
    if (!client) { setTotalUnread(0); return; }

    // Read initial unread count from the connected user
    setTotalUnread(client.user?.total_unread_count || 0);

    const handleEvent = (event) => {
      if (event.total_unread_count !== undefined) {
        setTotalUnread(event.total_unread_count);
      }
    };

    client.on('notification.message_new', handleEvent);
    client.on('notification.mark_read', handleEvent);
    client.on('message.new', handleEvent);

    return () => {
      client.off('notification.message_new', handleEvent);
      client.off('notification.mark_read', handleEvent);
      client.off('message.new', handleEvent);
    };
  }, [client]);

  const value = {
    client,
    isLoading,
    error,
    isUnavailable,
    totalUnread,
  };

  // Always provide the context, but only wrap with Chat if client is available
  if (!isAuthenticated) {
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
  }

  // If unavailable, loading, or no client, provide context without Chat wrapper
  if (isUnavailable || isLoading || !client) {
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
  }

  // If client is available, wrap with Chat
  return (
    <ChatContext.Provider value={value}>
      <Chat client={client}>{children}</Chat>
    </ChatContext.Provider>
  );
};

export default ChatContext;

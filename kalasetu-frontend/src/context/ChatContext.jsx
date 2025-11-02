import { createContext, useContext, useEffect, useState } from 'react';
import { Chat } from 'stream-chat-react';
import { useAuth } from './AuthContext';
import { initStreamChat, disconnectStreamChat, getChatToken } from '../lib/streamChat';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initChat = async () => {
      if (!isAuthenticated || !user) {
        setClient(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get chat token from backend
        const { token, userId } = await getChatToken();

        // Initialize Stream Chat
        const chatClient = await initStreamChat(userId, token, user);

        if (mounted && chatClient) {
          setClient(chatClient);
        }
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize chat');
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
      if (client) {
        disconnectStreamChat();
      }
    };
  }, [isAuthenticated, user]);

  const value = {
    client,
    isLoading,
    error,
  };

  // Don't render chat UI if not authenticated or still loading
  if (!isAuthenticated || !client) {
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
  }

  return (
    <ChatContext.Provider value={value}>
      <Chat client={client}>{children}</Chat>
    </ChatContext.Provider>
  );
};

export default ChatContext;

import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import ChannelList from '../components/ChannelList';
import ChatInterface from '../components/ChatInterface';
import 'stream-chat-react/dist/css/v2/index.css';

const MessagesPage = () => {
  const { client, isLoading, error } = useChat();
  const [activeChannel, setActiveChannel] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Chat Error
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chat Unavailable
          </h3>
          <p className="text-gray-600">
            Please log in to access messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Channel List Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChannelList onChannelSelect={setActiveChannel} />
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatInterface channel={activeChannel} />
      </div>
    </div>
  );
};

export default MessagesPage;

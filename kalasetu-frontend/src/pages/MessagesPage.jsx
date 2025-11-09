import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChatContext, Channel, ChannelList, MessageList, MessageInput, Window, Thread } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

const MessagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { client } = useChatContext();
  const navigate = useNavigate();
  
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!client || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  const filters = {
    type: 'messaging',
    members: { $in: [user._id || user.id] },
  };

  const sort = { last_message_at: -1 };

  const options = {
    limit: 20,
    state: true,
    watch: true,
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar - Channel List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h1 className="text-2xl font-bold text-white mb-4">Messages</h1>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border-0 bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto">
          <ChannelList
            filters={filters}
            sort={sort}
            options={options}
            showChannelSearch={false}
            Preview={(previewProps) => <CustomChannelPreview {...previewProps} searchQuery={searchQuery} />}
            onSelect={(channel) => setActiveChannel(channel)}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChannel ? (
          <Channel channel={activeChannel}>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={activeChannel.data?.image || '/default-avatar.png'}
                      alt={activeChannel.data?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activeChannel.data?.name || 'Conversation'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeChannel.state.members
                        ? Object.keys(activeChannel.state.members).length
                        : 0}{' '}
                      members
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message List */}
            <Window>
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Conversation Selected</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Channel Preview Component
const CustomChannelPreview = ({ channel, searchQuery, ...previewProps }) => {
  const { setActiveChannel, channel: activeChannel } = previewProps;
  
  const isActive = activeChannel?.id === channel.id;
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();

  // Simple search filter
  if (searchQuery && !channel.data?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <div
      onClick={() => setActiveChannel(channel, {})}
      className={`px-4 py-4 cursor-pointer transition-all border-b border-gray-100 hover:bg-blue-50 ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
          <img
            src={channel.data?.image || '/default-avatar.png'}
            alt={channel.data?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {channel.data?.name || 'Unnamed Channel'}
            </h3>
            {lastMessage && (
              <span className="text-xs text-gray-500 ml-2">
                {new Date(lastMessage.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate">
              {lastMessage.text || '📎 Attachment'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

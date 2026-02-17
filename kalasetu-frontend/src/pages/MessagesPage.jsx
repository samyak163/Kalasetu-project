import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { createDMChannel } from '../lib/streamChat';
import { Channel, ChannelList, MessageList, MessageInput, Window, Thread } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

/**
 * Get the other member in a DM channel (not the current user).
 * Returns { name, image } from the Stream member's user profile.
 */
const getOtherMember = (channel, currentUserId) => {
  const members = channel.state?.members;
  if (!members) return null;

  const other = Object.values(members).find(
    (m) => m.user_id !== currentUserId && m.user?.id !== currentUserId
  );
  return other?.user || null;
};

/** Initials avatar — colored circle with first letter of name */
const InitialsAvatar = ({ name, size = 'w-12 h-12 text-lg' }) => {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg, #A55233, #C97B5D)' }}
    >
      {letter}
    </div>
  );
};

const MessagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { client, isLoading, error, isUnavailable } = useChat();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeChannel, setActiveChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dmLoading, setDmLoading] = useState(false);
  const dmInitRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Auto-open DM channel when navigating from artisan profile (?artisan=<id>)
  useEffect(() => {
    const artisanId = searchParams.get('artisan');
    if (!artisanId || !client || !user || dmInitRef.current) return;

    dmInitRef.current = true;
    setDmLoading(true);

    (async () => {
      try {
        // Create/get the DM channel via backend
        const res = await createDMChannel(artisanId);
        const channelId = res.channelId || res.channel?.id;
        const channelType = res.channelType || res.channel?.type || 'messaging';

        if (channelId) {
          // Initialize the channel on the client side and watch it
          const channel = client.channel(channelType, channelId);
          await channel.watch();
          setActiveChannel(channel);
        }

        // Clear the artisan param from URL so refresh doesn't re-trigger
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('artisan');
        setSearchParams(newParams, { replace: true });
      } catch (err) {
        console.error('Failed to open DM channel:', err);
      } finally {
        setDmLoading(false);
      }
    })();
  }, [client, user, searchParams, setSearchParams]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100">
        <div className="text-center">
          <p className="text-lg text-gray-700 font-medium">Please log in to access messages.</p>
        </div>
      </div>
    );
  }

  // Show graceful fallback when Stream Chat is not configured
  if (isUnavailable) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100">
        <div className="text-center max-w-md">
          <svg className="w-24 h-24 mx-auto mb-4 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chat Unavailable</h3>
          <p className="text-gray-500">
            The messaging service is currently unavailable. Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !client || dmLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            {dmLoading ? 'Opening conversation...' : 'Loading messages...'}
          </p>
        </div>
      </div>
    );
  }

  const filters = {
    type: 'messaging',
    members: { $in: [user._id] },
  };

  const sort = { last_message_at: -1 };

  const options = {
    limit: 20,
    state: true,
    watch: true,
  };

  // Resolve the other member for the active channel header
  const otherUser = activeChannel ? getOtherMember(activeChannel, user._id) : null;
  const headerName = otherUser?.name || activeChannel?.data?.name || 'Conversation';
  const headerImage = otherUser?.image || activeChannel?.data?.image;

  return (
    <div className="flex h-screen bg-gradient-to-br from-brand-50 via-brand-50 to-brand-100">
      {/* Sidebar - Channel List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-brand-600 to-brand-500">
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
            Preview={(previewProps) => (
              <CustomChannelPreview {...previewProps} searchQuery={searchQuery} currentUserId={user._id} />
            )}
            onSelect={(channel) => setActiveChannel(channel)}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChannel ? (
          <Channel channel={activeChannel}>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-brand-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {headerImage ? (
                      <img
                        src={headerImage}
                        alt={headerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <InitialsAvatar name={headerName} />
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {headerName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {otherUser?.accountType === 'artisan' ? 'Artisan' : 'Customer'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages + Input */}
            <Window>
              <MessageList />
              <MessageInput focus />
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

// Custom Channel Preview — shows the other member's name & avatar for DM channels
const CustomChannelPreview = ({ channel, searchQuery, currentUserId, ...previewProps }) => {
  const { setActiveChannel, channel: activeChannel } = previewProps;

  const isActive = activeChannel?.id === channel.id;
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();

  // Resolve the other member's info for display
  const otherUser = getOtherMember(channel, currentUserId);
  const displayName = otherUser?.name || channel.data?.name || 'Unnamed';
  const displayImage = otherUser?.image || channel.data?.image;

  // Search filter against the resolved display name
  if (searchQuery && !displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <div
      onClick={() => setActiveChannel(channel, {})}
      className={`px-4 py-4 cursor-pointer transition-all border-b border-gray-100 hover:bg-brand-50 ${
        isActive ? 'bg-brand-50 border-l-4 border-l-brand-600' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <InitialsAvatar name={displayName} />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
              {displayName}
            </h3>
            {lastMessage && (
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {new Date(lastMessage.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
              {lastMessage.text || 'Attachment'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

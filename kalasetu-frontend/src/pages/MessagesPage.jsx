import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { createDMChannel } from '../lib/streamChat';
import {
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Window,
  Thread,
  TypingIndicator,
} from 'stream-chat-react';
import { ArrowLeft, MessageCircle, Search } from 'lucide-react';
import { Skeleton, EmptyState } from '../components/ui/index.js';
import 'stream-chat-react/dist/css/v2/index.css';

/**
 * Get the other member in a DM channel (not the current user).
 * Returns the Stream user object { name, image, accountType }.
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
      className={`${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700`}
    >
      {letter}
    </div>
  );
};

const MessagesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { client, isLoading, isUnavailable } = useChat();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeChannel, setActiveChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dmLoading, setDmLoading] = useState(false);
  // Mobile: tracks whether the chat pane is shown (hides channel list)
  const [showChat, setShowChat] = useState(false);
  const dmInitRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Auto-open DM channel when navigating from artisan profile (?artisan=<id>)
  useEffect(() => {
    const artisanId = searchParams.get('artisan');
    if (!artisanId || !client || !user || dmInitRef.current) return;

    dmInitRef.current = true;
    setDmLoading(true);

    (async () => {
      try {
        const res = await createDMChannel(artisanId);
        const channelId = res.channelId || res.channel?.id;
        const channelType = res.channelType || res.channel?.type || 'messaging';

        if (channelId) {
          const channel = client.channel(channelType, channelId);
          await channel.watch();
          setActiveChannel(channel);
          setShowChat(true);
        }

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

  // Handle channel selection — open chat pane (mobile: swap view)
  const handleSelectChannel = (channel) => {
    setActiveChannel(channel);
    setShowChat(true);
  };

  // Mobile: back button returns to channel list
  const handleBack = () => {
    setShowChat(false);
  };

  // ---------- Auth guard ----------
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] bg-gray-50">
        <p className="text-base text-gray-600 font-medium">Please log in to access messages.</p>
      </div>
    );
  }

  // ---------- Stream Chat unavailable ----------
  if (isUnavailable) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] bg-gray-50">
        <EmptyState
          icon={<MessageCircle className="h-12 w-12" />}
          title="Chat Unavailable"
          description="The messaging service is currently unavailable. Please try again later."
        />
      </div>
    );
  }

  // ---------- Loading ----------
  if (isLoading || !client || dmLoading) {
    return (
      <div className="flex min-h-[calc(100vh-73px)] bg-gray-50">
        {/* Sidebar skeleton */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 p-4 space-y-3">
          <Skeleton variant="rect" height="40px" className="rounded-lg" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circle" width="48px" height="48px" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="rect" height="14px" width="60%" />
                <Skeleton variant="rect" height="12px" width="80%" />
              </div>
            </div>
          ))}
        </div>
        {/* Chat area skeleton (desktop only) */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-brand-500 border-t-transparent mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">
              {dmLoading ? 'Opening conversation...' : 'Connecting to chat...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filters = { type: 'messaging', members: { $in: [user._id] } };
  const sort = { last_message_at: -1 };
  const listOptions = { limit: 20, state: true, watch: true };

  // Resolve the other member for the active channel header
  const otherUser = activeChannel ? getOtherMember(activeChannel, user._id) : null;
  const headerName = otherUser?.name || activeChannel?.data?.name || 'Conversation';
  const headerImage = otherUser?.image || activeChannel?.data?.image;

  return (
    <div className="flex h-[calc(100vh-73px)] bg-gray-50">
      {/* ─── Sidebar: Channel List ─── */}
      <div
        className={`${
          showChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-col flex-shrink-0`}
      >
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-lg font-display font-bold text-gray-900 mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto">
          <ChannelList
            filters={filters}
            sort={sort}
            options={listOptions}
            showChannelSearch={false}
            Preview={(previewProps) => (
              <CustomChannelPreview
                {...previewProps}
                searchQuery={searchQuery}
                currentUserId={user._id}
                onSelect={handleSelectChannel}
              />
            )}
            EmptyStateIndicator={() => (
              <div className="px-4 py-12">
                <EmptyState
                  icon={<MessageCircle className="h-10 w-10" />}
                  title="No conversations yet"
                  description="Start a conversation by messaging an artisan from their profile."
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* ─── Main Chat Area ─── */}
      <div
        className={`${
          showChat ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col bg-white min-w-0`}
      >
        {activeChannel ? (
          <Channel channel={activeChannel}>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
              {/* Back button (mobile only) */}
              <button
                onClick={handleBack}
                className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {headerImage ? (
                  <img
                    src={headerImage}
                    alt={headerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <InitialsAvatar name={headerName} size="w-10 h-10 text-sm" />
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-500 border-2 border-white rounded-full" />
              </div>

              {/* Name + role */}
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 truncate">{headerName}</h2>
                <p className="text-xs text-gray-500">
                  {otherUser?.accountType === 'artisan' ? 'Artisan' : 'Customer'}
                </p>
              </div>
            </div>

            {/* Messages + typing + input */}
            <Window>
              <MessageList />
              <TypingIndicator />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageCircle className="h-12 w-12" />}
              title="No Conversation Selected"
              description="Choose a conversation from the list to start messaging."
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Custom Channel Preview — shows the other member's name & avatar for DM channels.
 * Filters by search query against the resolved display name.
 */
const CustomChannelPreview = ({ channel, searchQuery, currentUserId, onSelect, ...previewProps }) => {
  const activeChannel = previewProps.activeChannel || previewProps.channel;
  const isActive = activeChannel?.id === channel.id;
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();

  const otherUser = getOtherMember(channel, currentUserId);
  const displayName = otherUser?.name || channel.data?.name || 'Unnamed';
  const displayImage = otherUser?.image || channel.data?.image;

  // Filter by search query
  if (searchQuery && !displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  // Format timestamp: today shows time, older shows date
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <button
      onClick={() => onSelect(channel)}
      className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-50 hover:bg-gray-50 ${
        isActive ? 'bg-brand-50 border-l-3 border-l-brand-500' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {displayImage ? (
            <img src={displayImage} alt={displayName} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <InitialsAvatar name={displayName} size="w-11 h-11 text-sm" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
              {displayName}
            </span>
            {lastMessage && (
              <span className="text-[11px] text-gray-400 flex-shrink-0">
                {formatTime(lastMessage.created_at)}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
              {lastMessage.text || 'Attachment'}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default MessagesPage;

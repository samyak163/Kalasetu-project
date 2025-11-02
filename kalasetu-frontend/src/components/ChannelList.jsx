import { ChannelList as StreamChannelList, ChannelPreviewMessenger } from 'stream-chat-react';
import { useAuth } from '../context/AuthContext';
import 'stream-chat-react/dist/css/v2/index.css';

const ChannelList = ({ onChannelSelect }) => {
  const { user } = useAuth();

  if (!user) return null;

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
    <div className="h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
      </div>
      <StreamChannelList
        filters={filters}
        sort={sort}
        options={options}
        Preview={ChannelPreviewMessenger}
        onSelect={onChannelSelect}
      />
    </div>
  );
};

export default ChannelList;

import { useState } from 'react';
import {
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

const ChatInterface = ({ channel }) => {
  const [showThread, setShowThread] = useState(false);

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Chat Selected
          </h3>
          <p className="text-gray-600">
            Select a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <Channel channel={channel}>
        <Window>
          <div className="flex-1 overflow-hidden">
            <MessageList
              messageActions={['reply', 'react', 'delete', 'edit']}
              onThreadClick={() => setShowThread(true)}
            />
          </div>
          <MessageInput grow />
        </Window>
        {showThread && (
          <Thread
            additionalMessageInputProps={{
              grow: true,
            }}
          />
        )}
      </Channel>
    </div>
  );
};

export default ChatInterface;

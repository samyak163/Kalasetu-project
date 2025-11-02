# 🚀 Quick Reference: Stream Chat & Daily.co

## Environment Setup

### Backend (.env)
```env
# Stream Chat
STREAM_API_KEY=your_key
STREAM_API_SECRET=your_secret
STREAM_APP_ID=your_app_id
CHAT_ENABLED=true
CHAT_PROVIDER=stream

# Daily.co
DAILY_API_KEY=your_key
DAILY_DOMAIN=yourcompany.daily.co
VIDEO_ENABLED=true
VIDEO_PROVIDER=daily
```

### Frontend (.env)
```env
VITE_STREAM_API_KEY=your_key
VITE_STREAM_APP_ID=your_app_id
VITE_DAILY_DOMAIN=yourcompany.daily.co
```

---

## Stream Chat Quick Start

### Backend Usage

```javascript
// Initialize (in server.js)
import { initStreamChat } from './utils/streamChat.js';
initStreamChat();

// Generate token
import { createStreamUserToken } from './utils/streamChat.js';
const token = createStreamUserToken(userId, 86400); // 24 hours

// Create user
import { upsertStreamUser } from './utils/streamChat.js';
await upsertStreamUser({
  id: user._id,
  name: user.fullName,
  image: user.profileImage,
  role: user.role,
});

// Create DM channel
import { createDirectMessageChannel } from './utils/streamChat.js';
const channel = await createDirectMessageChannel(userId1, userId2);
```

### Frontend Usage

```jsx
// Get chat token
import { getChatToken } from '../lib/streamChat';
const { token, userId } = await getChatToken();

// Create DM
import { createDMChannel } from '../lib/streamChat';
const channel = await createDMChannel(recipientId);

// Use Chat Context
import { useChat } from '../context/ChatContext';
const { client, isLoading, error } = useChat();

// Display channel list
import ChannelList from '../components/ChannelList';
<ChannelList onChannelSelect={setActiveChannel} />

// Display chat interface
import ChatInterface from '../components/ChatInterface';
<ChatInterface channel={activeChannel} />
```

---

## Daily.co Quick Start

### Backend Usage

```javascript
// Create room
import { createDailyRoom } from './utils/dailyco.js';
const room = await createDailyRoom({
  name: 'my-room',
  privacy: 'private',
  maxParticipants: 10,
  expiresAt: Date.now() + 3600, // 1 hour
});

// Generate meeting token
import { createMeetingToken } from './utils/dailyco.js';
const token = await createMeetingToken(roomName, {
  userId: user.id,
  userName: user.name,
  isOwner: true,
  expiresAt: Date.now() + 3600,
});

// Get room details
import { getDailyRoom } from './utils/dailyco.js';
const room = await getDailyRoom(roomName);

// Delete room
import { deleteDailyRoom } from './utils/dailyco.js';
await deleteDailyRoom(roomName);
```

### Frontend Usage

```jsx
// Create room
import { createVideoRoom } from '../lib/dailyco';
const room = await createVideoRoom({
  name: 'my-room',
  privacy: 'private',
  maxParticipants: 10,
});

// Get meeting token
import { getMeetingToken } from '../lib/dailyco';
const token = await getMeetingToken(roomName, { isOwner: true });

// Display video call
import VideoCall from '../components/VideoCall';
<VideoCall 
  roomUrl={room.url} 
  token={token} 
  onLeave={handleLeave}
/>

// Navigate to video call page
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate(`/video-call?room=${roomName}&owner=true`);
```

---

## Common Patterns

### Start Video Call from Chat

```jsx
import { createVideoRoom } from '../lib/dailyco';
import { useNavigate } from 'react-router-dom';

const handleStartVideoCall = async (channel) => {
  // Create room
  const room = await createVideoRoom({
    name: `call-${channel.id}-${Date.now()}`,
  });

  // Send invitation in chat
  await channel.sendMessage({
    text: `📹 Video call: Join now!`,
    attachments: [{
      type: 'video_call',
      roomName: room.name,
      roomUrl: room.url,
    }],
  });

  // Navigate to call
  navigate(`/video-call?room=${room.name}&owner=true`);
};
```

### Display Video Call Invitation in Chat

```jsx
const MessageContent = ({ message }) => {
  const navigate = useNavigate();
  const videoAttachment = message.attachments?.find(
    (a) => a.type === 'video_call'
  );

  if (videoAttachment) {
    return (
      <div className="video-call-invitation">
        <p>{message.text}</p>
        <button 
          onClick={() => navigate(`/video-call?room=${videoAttachment.roomName}`)}
          className="join-call-btn"
        >
          Join Video Call
        </button>
      </div>
    );
  }

  return <p>{message.text}</p>;
};
```

---

## API Endpoints

### Stream Chat
- `GET /api/chat/token` - Get chat token
- `POST /api/chat/channels/dm` - Create DM channel
- `GET /api/chat/channels` - Get user channels
- `POST /api/chat/channels/:type/:id/members` - Add members
- `DELETE /api/chat/channels/:type/:id/members` - Remove members

### Daily.co Video
- `POST /api/video/rooms` - Create room
- `GET /api/video/rooms` - List rooms
- `GET /api/video/rooms/:name` - Get room details
- `DELETE /api/video/rooms/:name` - Delete room
- `POST /api/video/tokens` - Get meeting token

---

## Error Handling

### Stream Chat

```javascript
try {
  const token = await getChatToken();
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 500) {
    // Server error - show error message
  }
}
```

### Daily.co

```javascript
try {
  const room = await createVideoRoom(options);
} catch (error) {
  if (error.response?.status === 400) {
    // Invalid room options
  } else if (error.response?.status === 429) {
    // Rate limit exceeded
  }
}
```

---

## Debugging Tips

### Stream Chat
1. Check browser console for Stream errors
2. Verify WebSocket connection in Network tab
3. Check Stream dashboard for API usage
4. Test with Stream CLI: `stream-cli chat list-channels`

### Daily.co
1. Test room creation in Daily.co dashboard
2. Check API key permissions
3. Verify domain is correct
4. Test with Daily Prebuilt UI first

---

## Common Issues

### "Chat token expired"
**Fix:** Backend generates new token on each request. Frontend should request fresh token from `/api/chat/token`.

### "Failed to connect to Stream"
**Fix:** Check CORS settings, verify WebSocket is allowed through firewall.

### "Video call black screen"
**Fix:** Wait 3-5 seconds for connection, check token validity, verify HTTPS.

### "Camera permission denied"
**Fix:** Browser settings > Site permissions > Camera/Microphone > Allow.

---

## Performance Tips

### Stream Chat
- Paginate channel lists (limit: 20)
- Use connection recovery
- Debounce typing indicators
- Lazy load message history

### Daily.co
- Preload Daily.co script
- Test network before joining
- Use adaptive bitrate
- Limit max participants on free tier (10)

---

## Testing Commands

```bash
# Test Stream Chat connection
curl -X GET http://localhost:5000/api/chat/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test room creation
curl -X POST http://localhost:5000/api/video/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-room","privacy":"private"}'

# Test meeting token
curl -X POST http://localhost:5000/api/video/tokens \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test-room","isOwner":true}'
```

---

## Resources

- **Stream Chat Docs:** https://getstream.io/chat/docs/
- **Daily.co Docs:** https://docs.daily.co/
- **React Components:** See `kalasetu-frontend/src/components/`
- **Backend Utils:** See `kalasetu-backend/utils/`

---

**Quick Setup Checklist:**
- [ ] Environment variables configured
- [ ] Packages installed
- [ ] Stream Chat initialized in server.js
- [ ] ChatProvider wrapping app in main.jsx
- [ ] Routes added to App.jsx
- [ ] Test chat token endpoint
- [ ] Test video room creation
- [ ] Verify WebSocket connection
- [ ] Test camera permissions

---

**Need Help?**
1. Check COMMUNICATION_TOOLS_IMPLEMENTATION.md for detailed guide
2. Review code comments in utils/streamChat.js and utils/dailyco.js
3. Test with Postman/curl first
4. Check browser console for errors
5. Verify environment variables are loaded

---

**Last Updated:** January 2024

# 🎯 Communication Tools Implementation Guide

## Stream Chat + Daily.co Video Calls Integration

This document provides comprehensive implementation details for **Stream Chat** (real-time messaging) and **Daily.co** (video calls) in the Kalasetu platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Stream Chat Implementation](#stream-chat-implementation)
5. [Daily.co Video Calls Implementation](#dailyco-video-calls-implementation)
6. [API Reference](#api-reference)
7. [Frontend Integration](#frontend-integration)
8. [Testing Checklist](#testing-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## 🎯 Overview

### Stream Chat
**Purpose:** Real-time messaging between artisans and customers  
**Features:**
- Direct messaging (DM) channels
- Group channels
- Message reactions and threading
- Read receipts and typing indicators
- File attachments
- Channel member management

### Daily.co Video Calls
**Purpose:** Face-to-face consultations and meetings  
**Features:**
- HD video calls (up to 100 participants)
- Screen sharing
- In-call chat
- Recording capabilities
- Custom branding
- Network quality indicators

---

## 📦 Prerequisites

### Stream Chat Requirements
1. **Stream Account:** Sign up at [getstream.io](https://getstream.io)
2. **API Credentials:**
   - API Key
   - API Secret
   - App ID

### Daily.co Requirements
1. **Daily Account:** Sign up at [daily.co](https://daily.co)
2. **API Key:** Available in your dashboard
3. **Domain:** Your custom Daily domain (e.g., `kalasetu.daily.co`)

---

## 🔧 Installation

### Backend Dependencies
```bash
cd kalasetu-backend
npm install stream-chat @daily-co/daily-js
```

### Frontend Dependencies
```bash
cd kalasetu-frontend
npm install stream-chat stream-chat-react @daily-co/daily-js @daily-co/daily-react --legacy-peer-deps
```

**Note:** Use `--legacy-peer-deps` if you encounter React 19 peer dependency warnings.

---

## 💬 Stream Chat Implementation

### Backend Setup

#### 1. Environment Variables
Add to `kalasetu-backend/.env`:
```env
# Stream Chat
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
STREAM_APP_ID=your_stream_app_id
CHAT_ENABLED=true
CHAT_PROVIDER=stream
```

#### 2. Configuration (env.config.js)
```javascript
export const CHAT_CONFIG = {
  enabled: process.env.CHAT_ENABLED === 'true',
  provider: process.env.CHAT_PROVIDER || 'stream',
  stream: {
    apiKey: process.env.STREAM_API_KEY,
    apiSecret: process.env.STREAM_API_SECRET,
    appId: process.env.STREAM_APP_ID,
  },
};
```

#### 3. Stream Chat Utility (utils/streamChat.js)
**Key Functions:**
- `initStreamChat()` - Initialize Stream client
- `createStreamUserToken(userId, expiresIn)` - Generate user token
- `upsertStreamUser(user)` - Create/update user
- `createDirectMessageChannel(userId1, userId2)` - Create DM channel
- `sendMessage(channelType, channelId, userId, text)` - Send message
- `queryChannels(filter, sort, options)` - Search channels

**Usage Example:**
```javascript
import { initStreamChat, createStreamUserToken } from './utils/streamChat.js';

// Initialize on server startup
initStreamChat();

// Generate token for user
const token = createStreamUserToken(userId, 86400); // 24 hours
```

#### 4. Chat Controller (controllers/chatController.js)
**Endpoints:**
- `GET /api/chat/token` - Get chat token for authenticated user
- `POST /api/chat/channels/dm` - Create direct message channel
- `GET /api/chat/channels` - Get user's channels
- `POST /api/chat/channels/:type/:id/members` - Add members
- `DELETE /api/chat/channels/:type/:id/members` - Remove members

#### 5. Chat Routes (routes/chatRoutes.js)
Protected routes requiring either artisan or customer authentication.

#### 6. Server Integration
```javascript
import { initStreamChat } from './utils/streamChat.js';
import chatRoutes from './routes/chatRoutes.js';

// Initialize
initStreamChat();

// Mount routes
app.use('/api/chat', chatRoutes);
```

### Frontend Setup

#### 1. Environment Variables
Add to `kalasetu-frontend/.env`:
```env
VITE_STREAM_API_KEY=your_stream_api_key
VITE_STREAM_APP_ID=your_stream_app_id
```

#### 2. Stream Chat Library (lib/streamChat.js)
**Key Functions:**
- `initStreamChat(userId, token, user)` - Initialize and connect
- `disconnectStreamChat()` - Disconnect user
- `getChatToken()` - Get token from backend
- `createDMChannel(recipientId)` - Create DM
- `getUserChannels(limit, offset)` - Get channels

#### 3. Chat Context (context/ChatContext.jsx)
Provides Stream client to entire app:
```jsx
import { ChatProvider, useChat } from './context/ChatContext';

// In main.jsx
<ChatProvider>
  <App />
</ChatProvider>

// In components
const { client, isLoading, error } = useChat();
```

#### 4. Chat Components

**ChannelList Component:**
```jsx
import ChannelList from './components/ChannelList';

<ChannelList onChannelSelect={setActiveChannel} />
```

**ChatInterface Component:**
```jsx
import ChatInterface from './components/ChatInterface';

<ChatInterface channel={activeChannel} />
```

#### 5. Messages Page (pages/MessagesPage.jsx)
Complete chat interface with channel list and message view.

**Route:** `/messages` (protected)

### Stream Chat API Flow

```
1. User logs in → AuthContext sets user
2. ChatContext requests token from backend
3. Backend generates Stream token using user ID
4. Frontend connects to Stream with token
5. ChatProvider wraps app with Stream client
6. User can view channels and send messages
```

---

## 📹 Daily.co Video Calls Implementation

### Backend Setup

#### 1. Environment Variables
Add to `kalasetu-backend/.env`:
```env
# Daily.co
DAILY_API_KEY=your_daily_api_key
DAILY_DOMAIN=kalasetu.daily.co
VIDEO_ENABLED=true
VIDEO_PROVIDER=daily
```

#### 2. Configuration (env.config.js)
```javascript
export const VIDEO_CONFIG = {
  enabled: process.env.VIDEO_ENABLED === 'true',
  provider: process.env.VIDEO_PROVIDER || 'daily',
  daily: {
    apiKey: process.env.DAILY_API_KEY,
    domain: process.env.DAILY_DOMAIN,
  },
};
```

#### 3. Daily.co Utility (utils/dailyco.js)
**Key Functions:**
- `createDailyRoom(options)` - Create video room
- `getDailyRoom(roomName)` - Get room details
- `deleteDailyRoom(roomName)` - Delete room
- `createMeetingToken(roomName, options)` - Generate token
- `listDailyRooms(options)` - List all rooms

**Usage Example:**
```javascript
import { createDailyRoom, createMeetingToken } from './utils/dailyco.js';

// Create room
const room = await createDailyRoom({
  name: 'consultation-123',
  privacy: 'private',
  maxParticipants: 10,
  expiresAt: Date.now() + 3600, // 1 hour
});

// Generate token
const token = await createMeetingToken(room.name, {
  userId: user.id,
  userName: user.name,
  isOwner: true,
});
```

#### 4. Video Controller (controllers/videoController.js)
**Endpoints:**
- `POST /api/video/rooms` - Create video room
- `GET /api/video/rooms` - List rooms
- `GET /api/video/rooms/:roomName` - Get room details
- `DELETE /api/video/rooms/:roomName` - Delete room
- `POST /api/video/tokens` - Create meeting token

#### 5. Video Routes (routes/videoRoutes.js)
Protected routes requiring authentication.

#### 6. Server Integration
```javascript
import videoRoutes from './routes/videoRoutes.js';

app.use('/api/video', videoRoutes);
```

### Frontend Setup

#### 1. Environment Variables
Add to `kalasetu-frontend/.env`:
```env
VITE_DAILY_DOMAIN=kalasetu.daily.co
```

#### 2. Daily.co Library (lib/dailyco.js)
**Key Functions:**
- `createVideoRoom(options)` - Create room via backend
- `getMeetingToken(roomName, options)` - Get token
- `createDailyCall(container, options)` - Create call object
- `joinVideoCall(callObject, url, token)` - Join call
- `leaveVideoCall(callObject)` - Leave call

#### 3. Video Call Component (components/VideoCall.jsx)
Renders Daily.co video interface with controls.

**Usage:**
```jsx
import VideoCall from './components/VideoCall';

<VideoCall 
  roomUrl={roomUrl} 
  token={token} 
  onLeave={handleLeave}
/>
```

#### 4. Video Call Page (pages/VideoCallPage.jsx)
Complete video call experience.

**Route:** `/video-call?room=<roomName>&owner=<true|false>`

**Features:**
- Auto-creates room if doesn't exist
- Generates meeting token
- Handles join/leave
- Error handling

### Daily.co API Flow

```
1. User clicks "Start Video Call"
2. Frontend requests room creation from backend
3. Backend creates room via Daily.co API
4. Frontend requests meeting token
5. Backend generates token with user info
6. Frontend joins call with token
7. Video interface displays in iframe
```

---

## 🔌 API Reference

### Stream Chat Endpoints

#### Get Chat Token
```http
GET /api/chat/token
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "userId": "60d5ec49f1b2c8b1f8e4c1a1"
}
```

#### Create DM Channel
```http
POST /api/chat/channels/dm
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "recipientId": "60d5ec49f1b2c8b1f8e4c1a2"
}

Response:
{
  "success": true,
  "channelId": "60d5ec49f1b2c8b1f8e4c1a1-60d5ec49f1b2c8b1f8e4c1a2",
  "channelType": "messaging",
  "channel": {
    "id": "...",
    "type": "messaging",
    "cid": "messaging:..."
  }
}
```

#### Get User Channels
```http
GET /api/chat/channels?limit=20&offset=0
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "count": 5,
  "channels": [
    {
      "id": "channel-1",
      "type": "messaging",
      "name": "John Doe",
      "memberCount": 2,
      "lastMessage": {...},
      "unreadCount": 3
    }
  ]
}
```

### Daily.co Video Endpoints

#### Create Video Room
```http
POST /api/video/rooms
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "consultation-123",
  "privacy": "private",
  "maxParticipants": 10,
  "expiresIn": 3600
}

Response:
{
  "success": true,
  "room": {
    "name": "consultation-123",
    "url": "https://kalasetu.daily.co/consultation-123",
    "createdAt": "2024-01-15T10:00:00Z",
    "config": {...}
  }
}
```

#### Get Meeting Token
```http
POST /api/video/tokens
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "roomName": "consultation-123",
  "isOwner": true,
  "expiresIn": 3600
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "roomName": "consultation-123",
  "userId": "60d5ec49f1b2c8b1f8e4c1a1"
}
```

---

## 🎨 Frontend Integration

### Stream Chat UI Customization

```css
/* Custom Stream Chat styles */
.str-chat__container {
  height: 100vh;
}

.str-chat__channel-list {
  width: 320px;
  border-right: 1px solid #e5e7eb;
}

.str-chat__message-simple {
  padding: 8px 12px;
}
```

### Daily.co Call Customization

```javascript
const callObject = DailyIframe.createFrame(container, {
  showLeaveButton: true,
  showFullscreenButton: true,
  iframeStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '0',
    borderRadius: '8px',
  },
});
```

### Example: Start Video Call from Chat

```jsx
const ChatMessage = ({ channel }) => {
  const navigate = useNavigate();

  const handleStartVideoCall = async () => {
    try {
      // Create video room
      const room = await createVideoRoom({
        name: `call-${channel.id}-${Date.now()}`,
        privacy: 'private',
      });

      // Send invitation in chat
      await channel.sendMessage({
        text: `Video call started: ${room.url}`,
        attachments: [
          {
            type: 'video_call',
            roomName: room.name,
            roomUrl: room.url,
          },
        ],
      });

      // Navigate to video call
      navigate(`/video-call?room=${room.name}&owner=true`);
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  };

  return (
    <button onClick={handleStartVideoCall}>
      Start Video Call
    </button>
  );
};
```

---

## ✅ Testing Checklist

### Stream Chat Testing

#### Backend Tests
- [ ] Stream Chat initializes successfully
- [ ] User tokens are generated correctly
- [ ] Users are created/updated in Stream
- [ ] DM channels are created successfully
- [ ] Channels are queried with filters
- [ ] Members can be added/removed
- [ ] Authentication works for both artisans and customers

#### Frontend Tests
- [ ] Chat client connects successfully
- [ ] Channel list displays correctly
- [ ] Messages send and receive in real-time
- [ ] Typing indicators work
- [ ] Read receipts update
- [ ] File uploads work
- [ ] Reactions are displayed
- [ ] Thread replies work
- [ ] User profiles display correctly
- [ ] Disconnect on logout

### Daily.co Video Testing

#### Backend Tests
- [ ] Rooms are created successfully
- [ ] Room details are retrieved
- [ ] Rooms are deleted
- [ ] Meeting tokens are generated
- [ ] Tokens have correct permissions
- [ ] Room expiration works

#### Frontend Tests
- [ ] Video call page loads
- [ ] Room is created/joined
- [ ] Video streams display
- [ ] Audio works
- [ ] Screen sharing works
- [ ] In-call chat works
- [ ] Participant list updates
- [ ] Leave call works
- [ ] Room URL can be shared
- [ ] Token expiration is handled

### Integration Tests
- [ ] Video call invitation sent in chat
- [ ] User can join from chat message
- [ ] Multiple users in same call
- [ ] Call ends when last person leaves
- [ ] Network issues handled gracefully

---

## 🐛 Troubleshooting

### Stream Chat Issues

#### Error: "Failed to initialize Stream Chat"
**Solution:**
1. Check API credentials in `.env`
2. Verify `CHAT_ENABLED=true`
3. Check network connectivity to Stream servers
4. Review server logs for detailed errors

#### Error: "Token expired"
**Solution:**
1. Tokens expire after specified duration
2. Backend generates new token on each request
3. Frontend should refresh token before expiration

#### Messages not appearing in real-time
**Solution:**
1. Check WebSocket connection in browser DevTools
2. Verify CORS settings allow WebSocket
3. Check firewall rules

### Daily.co Issues

#### Error: "Failed to create room"
**Solution:**
1. Verify Daily.co API key in `.env`
2. Check account limits (free tier: 10 participants max)
3. Review Daily.co dashboard for usage

#### Video/audio not working
**Solution:**
1. Check browser permissions for camera/microphone
2. Test on HTTPS (required for getUserMedia)
3. Try different browser
4. Check firewall/network settings

#### Black screen in video call
**Solution:**
1. Wait 3-5 seconds for connection
2. Check token is valid
3. Verify room URL is correct
4. Test with Daily.co Prebuilt UI first

---

## 🚀 Best Practices

### Stream Chat

1. **Token Management:**
   - Generate tokens on backend only
   - Use reasonable expiration times (24 hours recommended)
   - Refresh tokens before expiration

2. **Channel Organization:**
   - Use consistent naming conventions
   - Set appropriate channel types (messaging, team, etc.)
   - Add custom data for filtering

3. **Performance:**
   - Paginate channel lists
   - Limit message history loaded
   - Use connection recovery

4. **Security:**
   - Never expose API secret on frontend
   - Validate user permissions on backend
   - Use channel-level permissions

### Daily.co

1. **Room Management:**
   - Set expiration times on rooms
   - Delete rooms after use to save quota
   - Use meaningful room names

2. **Token Security:**
   - Generate tokens on backend
   - Set appropriate permissions (isOwner)
   - Use short expiration times for guests

3. **Call Quality:**
   - Test network connectivity before joining
   - Monitor bandwidth usage
   - Handle network disconnections gracefully

4. **User Experience:**
   - Show loading states
   - Provide clear error messages
   - Allow users to test audio/video before joining
   - Display participant count

---

## 📚 Additional Resources

### Stream Chat
- [Documentation](https://getstream.io/chat/docs/)
- [React Components](https://getstream.io/chat/docs/sdk/react/)
- [API Reference](https://getstream.io/chat/docs/api/)

### Daily.co
- [Documentation](https://docs.daily.co/)
- [React SDK](https://docs.daily.co/reference/daily-react)
- [API Reference](https://docs.daily.co/reference/rest-api)

---

## 🎉 Summary

You've successfully integrated:
- ✅ **Stream Chat** - Real-time messaging with DMs and group channels
- ✅ **Daily.co** - HD video calls with screen sharing

Both systems are production-ready with proper error handling, authentication, and best practices implemented.

For support, contact the development team or refer to the official documentation.

---

**Last Updated:** January 2024  
**Version:** 1.0.0

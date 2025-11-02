# ✅ Communication Tools Setup Checklist

## Pre-Deployment Checklist

Use this checklist to ensure everything is properly configured before deploying to production.

---

## 📋 API Credentials Setup

### Stream Chat
- [ ] Sign up at [getstream.io](https://getstream.io)
- [ ] Create new Stream app
- [ ] Copy API Key
- [ ] Copy API Secret
- [ ] Copy App ID
- [ ] Add to `kalasetu-backend/.env`:
  ```env
  STREAM_API_KEY=<your_key>
  STREAM_API_SECRET=<your_secret>
  STREAM_APP_ID=<your_app_id>
  CHAT_ENABLED=true
  CHAT_PROVIDER=stream
  ```
- [ ] Add to `kalasetu-frontend/.env`:
  ```env
  VITE_STREAM_API_KEY=<your_key>
  VITE_STREAM_APP_ID=<your_app_id>
  ```

### Daily.co
- [ ] Sign up at [daily.co](https://daily.co)
- [ ] Get API key from dashboard
- [ ] Note your domain (e.g., `kalasetu.daily.co`)
- [ ] Add to `kalasetu-backend/.env`:
  ```env
  DAILY_API_KEY=<your_key>
  DAILY_DOMAIN=<your_domain>.daily.co
  VIDEO_ENABLED=true
  VIDEO_PROVIDER=daily
  ```
- [ ] Add to `kalasetu-frontend/.env`:
  ```env
  VITE_DAILY_DOMAIN=<your_domain>.daily.co
  ```

---

## 🔧 Backend Setup

### Installation
- [x] Stream Chat package installed (`stream-chat`)
- [x] Daily.co package installed (`@daily-co/daily-js`)

### Files Created/Modified
- [x] `utils/streamChat.js` created
- [x] `controllers/chatController.js` created
- [x] `routes/chatRoutes.js` created
- [x] `utils/dailyco.js` created
- [x] `controllers/videoController.js` created
- [x] `routes/videoRoutes.js` created
- [x] `config/env.config.js` updated with CHAT_CONFIG and VIDEO_CONFIG
- [x] `server.js` updated with Stream initialization and routes

### Testing
- [ ] Start backend: `cd kalasetu-backend && npm start`
- [ ] Test chat token endpoint:
  ```bash
  curl -X GET http://localhost:5000/api/chat/token \
    -H "Authorization: Bearer YOUR_JWT"
  ```
- [ ] Test video room creation:
  ```bash
  curl -X POST http://localhost:5000/api/video/rooms \
    -H "Authorization: Bearer YOUR_JWT" \
    -H "Content-Type: application/json" \
    -d '{"name":"test-room"}'
  ```
- [ ] Verify no errors in console
- [ ] Check Stream Chat initializes: "✅ Stream Chat initialized"

---

## 🎨 Frontend Setup

### Installation
- [x] Stream Chat packages installed (`stream-chat`, `stream-chat-react`)
- [x] Daily.co packages installed (`@daily-co/daily-js`, `@daily-co/daily-react`)

### Files Created/Modified
- [x] `lib/streamChat.js` created
- [x] `context/ChatContext.jsx` created
- [x] `components/ChatInterface.jsx` created
- [x] `components/ChannelList.jsx` created
- [x] `pages/MessagesPage.jsx` created
- [x] `lib/dailyco.js` created
- [x] `components/VideoCall.jsx` created
- [x] `pages/VideoCallPage.jsx` created
- [x] `config/env.config.js` updated with CHAT_CONFIG and VIDEO_CONFIG
- [x] `main.jsx` updated with ChatProvider
- [x] `App.jsx` updated with routes

### Testing
- [ ] Start frontend: `cd kalasetu-frontend && npm run dev`
- [ ] Login as artisan or customer
- [ ] Navigate to `/messages`
- [ ] Verify chat interface loads
- [ ] Navigate to `/video-call`
- [ ] Verify video interface loads
- [ ] Check browser console for errors
- [ ] Test in different browsers (Chrome, Firefox, Safari)

---

## 🧪 Feature Testing

### Stream Chat Features
- [ ] **Get Chat Token**
  - [ ] Login as artisan
  - [ ] Token is generated
  - [ ] Login as customer
  - [ ] Token is generated
  
- [ ] **Channel List**
  - [ ] Navigate to `/messages`
  - [ ] Channel list displays
  - [ ] No channels shows "No Chat Selected"
  
- [ ] **Create DM Channel**
  - [ ] Test creating DM between two users
  - [ ] Channel appears in list
  - [ ] Both users can see channel
  
- [ ] **Send Messages**
  - [ ] Type message
  - [ ] Press Enter or click Send
  - [ ] Message appears in chat
  - [ ] Other user receives message in real-time
  
- [ ] **Message Features**
  - [ ] Typing indicators work
  - [ ] Read receipts update
  - [ ] Message reactions work
  - [ ] Thread replies work
  - [ ] File attachments work
  
- [ ] **Real-time Updates**
  - [ ] Open chat in two browsers
  - [ ] Send message from one
  - [ ] Message appears in other instantly

### Daily.co Video Features
- [ ] **Create Video Room**
  - [ ] Navigate to `/video-call`
  - [ ] Room is created automatically
  - [ ] Room URL is generated
  
- [ ] **Join Video Call**
  - [ ] Camera permission requested
  - [ ] Microphone permission requested
  - [ ] Video stream displays
  - [ ] Audio works
  
- [ ] **Video Controls**
  - [ ] Mute/unmute microphone
  - [ ] Turn camera on/off
  - [ ] Screen sharing works
  - [ ] Fullscreen mode works
  
- [ ] **Multiple Participants**
  - [ ] Share room URL with second user
  - [ ] Second user joins call
  - [ ] Both videos display
  - [ ] Participant count updates
  
- [ ] **Leave Call**
  - [ ] Click "Leave Call" button
  - [ ] Redirects to `/messages`
  - [ ] Room cleanup happens

---

## 🔐 Security Testing

### Authentication
- [ ] Unauthenticated users cannot access `/messages`
- [ ] Unauthenticated users cannot access `/video-call`
- [ ] Artisans can access chat features
- [ ] Customers can access chat features
- [ ] Chat tokens expire after 24 hours
- [ ] Meeting tokens expire after 1 hour

### API Security
- [ ] Chat endpoints require authentication
- [ ] Video endpoints require authentication
- [ ] Invalid tokens are rejected
- [ ] Users can only access their own channels

---

## 🌐 Browser Testing

### Desktop Browsers
- [ ] **Chrome** (latest)
  - [ ] Chat works
  - [ ] Video works
  - [ ] Screen sharing works
  
- [ ] **Firefox** (latest)
  - [ ] Chat works
  - [ ] Video works
  - [ ] Screen sharing works
  
- [ ] **Safari** (latest)
  - [ ] Chat works
  - [ ] Video works
  - [ ] Screen sharing works (limited)
  
- [ ] **Edge** (latest)
  - [ ] Chat works
  - [ ] Video works
  - [ ] Screen sharing works

### Mobile Browsers
- [ ] **Chrome Mobile**
  - [ ] Chat works
  - [ ] Video works
  - [ ] Camera switching works
  
- [ ] **Safari Mobile**
  - [ ] Chat works
  - [ ] Video works
  - [ ] Camera switching works

---

## 🚀 Performance Testing

### Stream Chat
- [ ] Channel list loads in < 2 seconds
- [ ] Messages send instantly
- [ ] Typing indicators appear immediately
- [ ] No memory leaks (check DevTools)
- [ ] WebSocket connection is stable

### Daily.co
- [ ] Room creation < 1 second
- [ ] Video call joins in < 5 seconds
- [ ] Video quality is HD
- [ ] Audio has no lag
- [ ] Screen sharing is smooth

---

## 📱 Responsive Design Testing

### Chat Interface
- [ ] **Desktop** (1920x1080)
  - [ ] Channel list visible
  - [ ] Chat interface full width
  
- [ ] **Tablet** (768x1024)
  - [ ] Channel list toggles
  - [ ] Chat interface adapts
  
- [ ] **Mobile** (375x667)
  - [ ] Channel list full screen
  - [ ] Chat interface full screen
  - [ ] Back button works

### Video Interface
- [ ] **Desktop** - Full screen video
- [ ] **Tablet** - Adapted video
- [ ] **Mobile** - Full screen video

---

## 🐛 Error Handling Testing

### Stream Chat Errors
- [ ] Invalid token shows error message
- [ ] Network failure handled gracefully
- [ ] Reconnection works automatically
- [ ] Loading states display correctly

### Daily.co Errors
- [ ] Camera permission denied shows message
- [ ] Room not found shows error
- [ ] Network issues handled
- [ ] Browser not supported shows warning

---

## 📊 Analytics & Monitoring

### PostHog Tracking (if enabled)
- [ ] Chat token requests tracked
- [ ] Message sent events tracked
- [ ] Video room creation tracked
- [ ] Video call duration tracked

### LogRocket (if enabled)
- [ ] Chat sessions recorded
- [ ] Video call sessions recorded
- [ ] User interactions captured

### Sentry (if enabled)
- [ ] Chat errors reported
- [ ] Video errors reported
- [ ] Performance metrics captured

---

## 🌍 Production Deployment

### Environment Variables
- [ ] All `.env` variables set in production
- [ ] Stream API keys configured
- [ ] Daily.co API key configured
- [ ] CORS origins configured correctly

### Backend Deployment
- [ ] Stream Chat initializes on startup
- [ ] Chat routes accessible
- [ ] Video routes accessible
- [ ] HTTPS enabled (required for video)

### Frontend Deployment
- [ ] Environment variables injected
- [ ] Chat provider wraps app
- [ ] Routes are accessible
- [ ] HTTPS enabled

### DNS & SSL
- [ ] Domain configured for Daily.co
- [ ] SSL certificate valid
- [ ] WebSocket connections allowed

---

## 📚 Documentation Review

- [x] `COMMUNICATION_TOOLS_IMPLEMENTATION.md` created
- [x] `QUICK_REFERENCE_COMMUNICATION.md` created
- [x] `IMPLEMENTATION_SUMMARY_COMMUNICATION.md` created
- [x] Code comments in all files
- [x] API endpoints documented
- [x] Error handling documented

---

## 👥 User Training

- [ ] Train artisans on chat features
- [ ] Train customers on chat features
- [ ] Create video tutorial for video calls
- [ ] Document common issues and solutions
- [ ] Prepare support documentation

---

## 🎯 Final Verification

### Critical Features
- [ ] Users can log in
- [ ] Users can send messages
- [ ] Users can receive messages
- [ ] Users can start video calls
- [ ] Users can join video calls
- [ ] All features work on mobile

### Nice-to-Have Features
- [ ] Message search works
- [ ] User avatars display
- [ ] Notification sounds work
- [ ] Desktop notifications work
- [ ] Video call recording works

---

## 📝 Post-Deployment

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Monitor Stream Chat usage
- [ ] Monitor Daily.co usage
- [ ] Track error rates
- [ ] Monitor WebSocket connections

### Optimization
- [ ] Review performance metrics
- [ ] Optimize bundle size
- [ ] Enable CDN for assets
- [ ] Cache optimization

### Maintenance
- [ ] Schedule regular updates
- [ ] Monitor API rate limits
- [ ] Review security logs
- [ ] Update documentation

---

## ✅ Sign-Off

Once all items are checked:

- [ ] **Backend Team Lead:** __________________ Date: ________
- [ ] **Frontend Team Lead:** _________________ Date: ________
- [ ] **QA Lead:** ___________________________ Date: ________
- [ ] **Product Owner:** ______________________ Date: ________

---

## 🆘 Troubleshooting Quick Links

If something doesn't work:

1. **Check Environment Variables**
   - Backend: `kalasetu-backend/.env`
   - Frontend: `kalasetu-frontend/.env`

2. **Check Console Logs**
   - Backend: Terminal running `npm start`
   - Frontend: Browser DevTools Console

3. **Check Documentation**
   - `COMMUNICATION_TOOLS_IMPLEMENTATION.md`
   - `QUICK_REFERENCE_COMMUNICATION.md`

4. **Common Issues**
   - Token expired → Request new token
   - WebSocket connection failed → Check CORS
   - Video black screen → Check camera permissions
   - Audio not working → Check microphone permissions

5. **Test Endpoints with curl**
   ```bash
   # Test chat token
   curl -X GET http://localhost:5000/api/chat/token \
     -H "Authorization: Bearer YOUR_JWT"
   
   # Test video room
   curl -X POST http://localhost:5000/api/video/rooms \
     -H "Authorization: Bearer YOUR_JWT" \
     -H "Content-Type: application/json" \
     -d '{"name":"test"}'
   ```

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** Ready for Testing

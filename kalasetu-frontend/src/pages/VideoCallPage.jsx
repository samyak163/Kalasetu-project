import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoCall from '../components/VideoCall';
import { createVideoRoom, getMeetingToken, getVideoRoom } from '../lib/dailyco';
import axios from '../lib/axios';

const VideoCallPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('new'); // 'history' | 'new' | 'call'
  
  // Call state
  const [roomUrl, setRoomUrl] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // History state
  const [callHistory, setCallHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Form state for new call
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [artisans, setArtisans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if coming from URL with room parameter
  const roomNameFromUrl = searchParams.get('room');
  const isOwner = searchParams.get('owner') === 'true';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If room in URL, go directly to call
    if (roomNameFromUrl) {
      setActiveTab('call');
      initializeCall(roomNameFromUrl, isOwner);
    } else {
      // Load artisans for new call
      loadArtisans();
      // Load call history
      loadCallHistory();
    }
  }, [isAuthenticated, roomNameFromUrl]);

  const loadArtisans = async () => {
    try {
      const { data } = await axios.get('/api/artisans', {
        params: { limit: 100 }
      });
      // Handle both array response and object with artisans property
      const artisansList = Array.isArray(data) ? data : (data.artisans || []);
      // Filter for active artisans only
      const activeArtisans = artisansList.filter(a => a.isActive !== false);
      setArtisans(activeArtisans);
    } catch (err) {
      console.error('Failed to load artisans:', err);
      setArtisans([]);
    }
  };

  const loadCallHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const { data } = await axios.get('/api/calls/history?limit=20');
      setCallHistory(data.data || []);
    } catch (err) {
      console.error('Failed to load call history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const initializeCall = async (roomName, owner) => {
    try {
      setIsLoading(true);
      setError(null);

      let room;

      if (roomName) {
        // Join existing room
        try {
          room = await getVideoRoom(roomName);
        } catch (err) {
          if (err.response?.status === 404) {
            room = await createVideoRoom({
              name: roomName,
              privacy: 'private',
              maxParticipants: 2,
            });
          } else {
            throw err;
          }
        }
      } else {
        // Create new room
        room = await createVideoRoom({
          privacy: 'private',
          maxParticipants: 2,
        });
      }

      // Get meeting token
      const meetingToken = await getMeetingToken(room.name, {
        isOwner: owner,
      });

      setRoomUrl(room.url);
      setToken(meetingToken);
      setActiveTab('call');
    } catch (err) {
      console.error('Failed to initialize call:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initialize video call');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCall = async () => {
    if (!selectedArtisan) {
      alert('Please select an artisan to call');
      return;
    }

    const roomName = `call-${user._id}-${selectedArtisan._id}-${Date.now()}`;
    setSearchParams({ room: roomName, owner: 'true' });
    await initializeCall(roomName, true);
  };

  const handleLeaveCall = () => {
    setRoomUrl(null);
    setToken(null);
    setActiveTab('new');
    setSearchParams({});
    loadCallHistory(); // Refresh history after call
  };

  const handleRejoinCall = (call) => {
    setSearchParams({ room: call.roomName, owner: 'false' });
    initializeCall(call.roomName, false);
  };

  const filteredArtisans = artisans.filter(a => 
    a.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.craft?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render call interface
  if (activeTab === 'call' && roomUrl && token) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Video Call</h1>
            {selectedArtisan && (
              <span className="text-gray-300">with {selectedArtisan.fullName}</span>
            )}
          </div>
          <button
            onClick={handleLeaveCall}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            End Call
          </button>
        </div>
        <div className="flex-1">
          <VideoCall roomUrl={roomUrl} token={token} onLeave={handleLeaveCall} />
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Setting up video call...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && activeTab === 'call') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Video Call Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setActiveTab('new');
                setSearchParams({});
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Back to Calls
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main UI with tabs
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Video Calls</h1>
          <p className="text-gray-600">Connect with artisans through video consultations</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                activeTab === 'new'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>New Call</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-lg font-semibold transition-all ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Call History</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* New Call Tab */}
            {activeTab === 'new' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Artisans
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, craft, or email..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredArtisans.map(artisan => (
                    <div
                      key={artisan._id}
                      onClick={() => setSelectedArtisan(artisan)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedArtisan?._id === artisan._id
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={artisan.profileImageUrl || '/default-avatar.png'}
                          alt={artisan.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{artisan.fullName}</h3>
                          <p className="text-sm text-gray-600 truncate">{artisan.craft}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredArtisans.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No artisans found</p>
                  </div>
                )}

                <button
                  onClick={handleStartCall}
                  disabled={!selectedArtisan || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Starting Call...' : 'Start Video Call'}
                </button>
              </div>
            )}

            {/* Call History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {isLoadingHistory ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading call history...</p>
                  </div>
                ) : callHistory.length > 0 ? (
                  callHistory.map((call, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {call.artisan?.fullName || call.user?.fullName || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(call.startedAt).toLocaleString()}
                          </p>
                          {call.duration && (
                            <p className="text-xs text-gray-500">Duration: {Math.round(call.duration / 60)} min</p>
                          )}
                        </div>
                      </div>
                      {call.roomName && (
                        <button
                          onClick={() => handleRejoinCall(call)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Rejoin
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No call history yet</p>
                    <p className="text-sm mt-2">Start your first video call to see it here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;

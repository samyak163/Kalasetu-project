import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VideoCall from '../components/VideoCall';
import { createVideoRoom, getMeetingToken, getVideoRoom } from '../lib/dailyco';

const VideoCallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [roomUrl, setRoomUrl] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get room name from URL params
  const roomNameFromUrl = searchParams.get('room');
  const isOwner = searchParams.get('owner') === 'true';

  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let room;

        if (roomNameFromUrl) {
          // Join existing room
          try {
            room = await getVideoRoom(roomNameFromUrl);
          } catch (err) {
            // Room doesn't exist, create it
            if (err.response?.status === 404) {
              room = await createVideoRoom({
                name: roomNameFromUrl,
                privacy: 'private',
                maxParticipants: 10,
              });
            } else {
              throw err;
            }
          }
        } else {
          // Create new room
          room = await createVideoRoom({
            privacy: 'private',
            maxParticipants: 10,
          });

          // Update URL with room name
          navigate(`/video-call?room=${room.name}&owner=true`, { replace: true });
        }

        // Get meeting token
        const meetingToken = await getMeetingToken(room.name, {
          isOwner: isOwner,
        });

        setRoomUrl(room.url);
        setToken(meetingToken);
      } catch (err) {
        console.error('Failed to initialize call:', err);
        setError(err.message || 'Failed to initialize video call');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCall();
  }, [roomNameFromUrl, isOwner, navigate]);

  const handleLeaveCall = () => {
    navigate('/messages');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Setting up video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Video Call Error
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/messages')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <VideoCall roomUrl={roomUrl} token={token} onLeave={handleLeaveCall} />
    </div>
  );
};

export default VideoCallPage;

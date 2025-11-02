import { useEffect, useRef, useState } from 'react';
import { useDaily, DailyProvider } from '@daily-co/daily-react';
import { createDailyCall, joinVideoCall, leaveVideoCall } from '../lib/dailyco';

const VideoCallComponent = ({ roomUrl, token, onLeave }) => {
  const daily = useDaily();
  const [callState, setCallState] = useState('idle'); // 'idle' | 'joining' | 'joined' | 'leaving' | 'error'
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!daily) return;

    const handleJoinedMeeting = () => {
      console.log('Joined meeting');
      setCallState('joined');
    };

    const handleLeftMeeting = () => {
      console.log('Left meeting');
      setCallState('idle');
      if (onLeave) onLeave();
    };

    const handleParticipantJoined = (event) => {
      console.log('Participant joined:', event.participant);
      updateParticipants();
    };

    const handleParticipantLeft = (event) => {
      console.log('Participant left:', event.participant);
      updateParticipants();
    };

    const handleError = (event) => {
      console.error('Daily error:', event);
      setError(event.errorMsg);
      setCallState('error');
    };

    const updateParticipants = () => {
      const allParticipants = daily.participants();
      setParticipants(Object.values(allParticipants));
    };

    // Subscribe to events
    daily
      .on('joined-meeting', handleJoinedMeeting)
      .on('left-meeting', handleLeftMeeting)
      .on('participant-joined', handleParticipantJoined)
      .on('participant-left', handleParticipantLeft)
      .on('error', handleError);

    // Join the call
    const joinCall = async () => {
      try {
        setCallState('joining');
        await joinVideoCall(daily, roomUrl, token);
        updateParticipants();
      } catch (err) {
        setError(err.message);
        setCallState('error');
      }
    };

    joinCall();

    // Cleanup
    return () => {
      daily
        .off('joined-meeting', handleJoinedMeeting)
        .off('left-meeting', handleLeftMeeting)
        .off('participant-joined', handleParticipantJoined)
        .off('participant-left', handleParticipantLeft)
        .off('error', handleError);
    };
  }, [daily, roomUrl, token, onLeave]);

  const handleLeaveCall = async () => {
    if (daily && callState === 'joined') {
      setCallState('leaving');
      await leaveVideoCall(daily);
    }
  };

  if (callState === 'error') {
    return (
      <div className="flex items-center justify-center h-full bg-red-50">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Call Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (callState === 'joining') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-900">
      {/* Video container - Daily automatically renders here */}
      
      {/* Call controls */}
      {callState === 'joined' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          <button
            onClick={handleLeaveCall}
            className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 font-medium shadow-lg"
          >
            Leave Call
          </button>
        </div>
      )}

      {/* Participant count */}
      {callState === 'joined' && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
        </div>
      )}
    </div>
  );
};

const VideoCall = ({ roomUrl, token, onLeave }) => {
  const callRef = useRef(null);
  const [callObject, setCallObject] = useState(null);

  useEffect(() => {
    if (!callRef.current) return;

    const call = createDailyCall(callRef.current);
    setCallObject(call);

    return () => {
      if (call) {
        call.destroy().catch(console.error);
      }
    };
  }, []);

  return (
    <div ref={callRef} className="h-full w-full">
      {callObject && (
        <DailyProvider callObject={callObject}>
          <VideoCallComponent roomUrl={roomUrl} token={token} onLeave={onLeave} />
        </DailyProvider>
      )}
    </div>
  );
};

export default VideoCall;

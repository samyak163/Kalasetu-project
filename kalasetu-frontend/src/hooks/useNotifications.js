import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNotificationClickHandler, isSubscribed } from '../lib/onesignal.js';

/**
 * Custom hook for handling notifications
 */
export const useNotifications = () => {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    checkSubscription();
    setupNotificationHandlers();
    return () => {
      setNotificationClickHandler(null);
    };
  }, []);

  const checkSubscription = async () => {
    const status = await isSubscribed();
    setSubscribed(status);
  };

  const setupNotificationHandlers = () => {
    setNotificationClickHandler((event) => {
      const data = event.data;
      
      // Handle different notification types
      switch (data.type) {
        case 'message':
          navigate('/messages');
          break;
        case 'order':
          navigate(`/orders/${data.orderId}`);
          break;
        case 'review':
          navigate('/reviews');
          break;
        case 'profile_view':
          navigate('/profile');
          break;
        default:
          if (data.url) {
            navigate(data.url);
          }
      }
    });
  };

  return {
    subscribed,
  };
};

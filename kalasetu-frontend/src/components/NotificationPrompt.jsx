import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui';
import {
  isSubscribed,
  requestNotificationPermission,
  showNativePrompt
} from '../lib/onesignal.js';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const status = await isSubscribed();
    setSubscribed(status);

    // Show prompt if not subscribed and not dismissed before
    if (!status && !localStorage.getItem('notification-prompt-dismissed')) {
      setTimeout(() => setShow(true), 5000); // Show after 5 seconds
    }
  };

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setSubscribed(true);
      setShow(false);
    } else {
      showNativePrompt();
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!show || subscribed) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-brand-500" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Enable Notifications
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Get instant updates about messages, orders, and new opportunities
          </p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleEnable}>Enable</Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>Not now</Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

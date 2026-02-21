import React from 'react';
import { X, Bell } from 'lucide-react';
import { EmptyState } from './ui';

const NotificationPanel = ({ isOpen, onClose, notifications = [], unreadCount = 0, onMarkRead }) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    notifications.filter(n => !n.read).forEach(n => onMarkRead?.(n._id || n.id));
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-500 hover:text-brand-600 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-6 h-6" />}
              title="You're all caught up"
              description="No notifications right now."
            />
          ) : (
            notifications.map(n => (
              <button
                key={n._id || n.id}
                onClick={() => { if (!n.read) onMarkRead?.(n._id || n.id); }}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  n.read ? 'bg-white hover:bg-gray-50' : 'bg-brand-50 hover:bg-brand-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  {n.title && <div className="text-sm font-semibold text-gray-900">{n.title}</div>}
                  <div className="text-sm text-gray-700 mt-0.5 line-clamp-2">{n.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.timeAgo || ''}</div>
                </div>
                {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotificationPanel;

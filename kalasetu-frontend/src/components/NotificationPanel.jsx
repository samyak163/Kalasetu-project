import React from 'react';

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
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#A55233] hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="font-medium">You're all caught up</p>
              <p className="text-sm mt-1">No notifications right now.</p>
            </div>
          ) : (
            notifications.map(n => (
              <button
                key={n._id || n.id}
                onClick={() => { if (!n.read) onMarkRead?.(n._id || n.id); }}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  n.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#A55233]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#A55233]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {n.title && <div className="text-sm font-semibold text-gray-900">{n.title}</div>}
                  <div className="text-sm text-gray-700 mt-0.5 line-clamp-2">{n.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.timeAgo || ''}</div>
                </div>
                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotificationPanel;

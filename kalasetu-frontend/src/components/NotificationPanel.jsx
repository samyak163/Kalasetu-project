import React from 'react';

const NotificationPanel = ({ isOpen, onClose, notifications = [], unreadCount = 0 }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Notifications</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">✕</button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-56px)]">
          {notifications.length === 0 ? (
            <div className="text-gray-500">You're all caught up.</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 border rounded">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1">
                  {n.title && <div className="text-sm font-semibold text-gray-900">{n.title}</div>}
                  <div className="text-sm text-gray-700 mt-0.5">{n.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{n.timeAgo || ''}</div>
                </div>
                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};

export default NotificationPanel;



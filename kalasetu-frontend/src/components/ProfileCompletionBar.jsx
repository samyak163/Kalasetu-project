import React from 'react';

const ProfileCompletionBar = ({ percent = 0 }) => {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
        <span className="text-sm text-gray-500">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">Complete your profile to rank higher in search.</p>
    </div>
  );
};

export default ProfileCompletionBar;

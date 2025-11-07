import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext.jsx';
import { ToastContext } from '../../../context/ToastContext.jsx';

const AppearanceTab = ({ user }) => {
  const { theme, fontSize, updateTheme, updateFontSize } = useContext(ThemeContext);
  const { showToast } = useContext(ToastContext);

  const handleThemeChange = async (newTheme) => {
    updateTheme(newTheme);
    showToast('Theme updated successfully!', 'success');
  };

  const handleFontSizeChange = async (newSize) => {
    updateFontSize(newSize);
    showToast('Font size updated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize how the app looks and feels
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="space-y-3">
          {[
            { value: 'light', label: 'Light Mode' },
            { value: 'dark', label: 'Dark Mode' },
            { value: 'auto', label: 'Auto (System)' },
          ].map(option => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => handleThemeChange(option.value)}
                className="w-5 h-5 text-[#A55233] focus:ring-[#A55233]"
              />
              <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#A55233] rounded-full" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Sample Card</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">This is how it looks</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#A55233] text-white rounded-lg text-sm">
              Sample Button
            </button>
          </div>
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Font Size</h3>
        <div className="space-y-3">
          {[
            { value: 'small', label: 'Small (14px)' },
            { value: 'medium', label: 'Medium (16px)' },
            { value: 'large', label: 'Large (18px)' },
          ].map(option => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <input
                type="radio"
                name="fontSize"
                value={option.value}
                checked={fontSize === option.value}
                onChange={() => handleFontSizeChange(option.value)}
                className="w-5 h-5 text-[#A55233] focus:ring-[#A55233]"
              />
              <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: option.value === 'small' ? '14px' : option.value === 'large' ? '18px' : '16px' }}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Accessibility
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300">High contrast mode</span>
            <input
              type="checkbox"
              className="w-5 h-5 text-[#A55233] rounded focus:ring-[#A55233]"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300">Reduce animations</span>
            <input
              type="checkbox"
              className="w-5 h-5 text-[#A55233] rounded focus:ring-[#A55233]"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;

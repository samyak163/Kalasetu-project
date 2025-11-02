import React, { useEffect, useState, useContext } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';

const PortfolioTab = () => {
  const { showToast } = useContext(ToastContext);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(false);
      // Placeholder data
      setPortfolio([]);
    } catch (error) {
      showToast('Failed to load portfolio', 'error');
      setLoading(false);
    }
  };

  const handleUpload = () => {
    showToast('Upload feature coming soon!', 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A55233]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio & Gallery</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showcase your best work to attract customers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
          >
            + Upload Photos
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            + Add Project
          </button>
        </div>
      </div>

      {/* Empty State */}
      {portfolio.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Build Your Portfolio
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Artisans with portfolios get 3x more bookings! Upload photos of your best work to attract customers.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleUpload}
              className="px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
            >
              Upload Your First Photo
            </button>
            <button
              onClick={handleUpload}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Create Project Showcase
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>💡 Tip: Add before/after photos to show your transformation work</p>
          </div>
        </div>
      )}

      {/* Portfolio Grid (when has content) */}
      {portfolio.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Portfolio items will go here */}
        </div>
      )}
    </div>
  );
};

export default PortfolioTab;

import React, { useState } from 'react';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';

const HelpSupportTab = () => {
  const { showToast } = React.useContext(ToastContext);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [issueReport, setIssueReport] = useState({
    type: 'bug',
    description: '',
  });

  const faqs = [
    {
      question: 'How do I book an artisan?',
      answer: 'Browse artisans, select one that fits your needs, and click "Book Now" to schedule a service.',
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to Your Profile tab, click "Change Password", enter your current and new password.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept Razorpay, credit/debit cards, UPI, and cash payments.',
    },
    {
      question: 'How do I cancel an order?',
      answer: 'Go to Order History, find your order, and click "Cancel". Cancellation policies apply.',
    },
    {
      question: 'How are ratings calculated?',
      answer: 'Ratings are based on feedback from artisans across 5 categories: Punctuality, Courtesy, Generosity, Communication, and Property Care.',
    },
  ];

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/support/contact', supportForm);
      showToast('Message sent successfully!', 'success');
      setSupportForm({ subject: '', message: '', priority: 'medium' });
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleIssueReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/support/report', issueReport);
      showToast('Issue reported successfully!', 'success');
      setIssueReport({ type: 'bug', description: '' });
    } catch (error) {
      showToast('Failed to report issue', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Find answers or get in touch with our support team
        </p>
      </div>

      {/* FAQs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFaq === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaq === idx && (
                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contact Support
        </h3>
        <div className="space-y-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Email:</p>
            <a
              href="mailto:support@kalasetu.com"
              className="text-[#A55233] hover:text-[#8e462b] font-medium"
            >
              support@kalasetu.com
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Phone:</p>
            <a
              href="tel:+911234567890"
              className="text-[#A55233] hover:text-[#8e462b] font-medium"
            >
              +91-1234567890
            </a>
          </div>
        </div>
        <form onSubmit={handleSupportSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={supportForm.subject}
              onChange={e => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={supportForm.message}
              onChange={e => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white resize-none"
              required
              minLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={supportForm.priority}
              onChange={e => setSupportForm(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Report Issue */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Report an Issue
        </h3>
        <form onSubmit={handleIssueReport} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Issue Type
            </label>
            <select
              value={issueReport.type}
              onChange={e => setIssueReport(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white"
            >
              <option value="bug">Bug/Error</option>
              <option value="payment">Payment Problem</option>
              <option value="artisan">Artisan Complaint</option>
              <option value="performance">App Performance</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={issueReport.description}
              onChange={e => setIssueReport(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A55233] dark:bg-gray-700 dark:text-white resize-none"
              required
              minLength={50}
              placeholder="Describe the issue in detail..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {issueReport.description.length}/50 characters minimum
            </p>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-[#A55233] text-white rounded-lg hover:bg-[#8e462b] transition-colors"
          >
            Submit Report
          </button>
        </form>
      </div>

      {/* Legal Links */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
        <div className="space-y-2">
          <a href="/terms" className="block text-[#A55233] hover:text-[#8e462b] hover:underline">
            Terms of Service
          </a>
          <a href="/privacy" className="block text-[#A55233] hover:text-[#8e462b] hover:underline">
            Privacy Policy
          </a>
          <a href="/refund" className="block text-[#A55233] hover:text-[#8e462b] hover:underline">
            Refund Policy
          </a>
        </div>
      </div>

      {/* App Version */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>App Version: 1.0.0</p>
        <button className="text-[#A55233] hover:text-[#8e462b] mt-2">
          Check for Updates
        </button>
      </div>
    </div>
  );
};

export default HelpSupportTab;

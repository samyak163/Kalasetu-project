import { useState, useEffect, useContext } from 'react';
import api from '../../../lib/axios.js';
import { ToastContext } from '../../../context/ToastContext.jsx';
import { Input, Button } from '../../ui';
import {
  Calendar,
  CreditCard,
  RotateCcw,
  User as UserIcon,
  AlertTriangle,
  HelpCircle,
  X,
  ChevronDown,
  Clock,
  MessageSquare
} from 'lucide-react';

const HelpSupportTab = () => {
  const { showToast } = useContext(ToastContext);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Support form state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
  const [supportLoading, setSupportLoading] = useState(false);

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Issue report state
  const [issueReport, setIssueReport] = useState({
    type: 'bug',
    description: '',
  });

  const supportCategories = [
    {
      key: 'booking',
      label: 'Booking Issue',
      description: 'Problems with a booking or appointment',
      icon: Calendar,
      subject: 'Booking Issue'
    },
    {
      key: 'payment',
      label: 'Payment Problem',
      description: 'Payment failed, wrong amount, or charges',
      icon: CreditCard,
      subject: 'Payment Issue'
    },
    {
      key: 'refund',
      label: 'Refund Help',
      description: 'Questions about refunds or returns',
      icon: RotateCcw,
      subject: 'Refund Inquiry'
    },
    {
      key: 'account',
      label: 'Account Help',
      description: 'Login, password, or profile issues',
      icon: UserIcon,
      subject: 'Account Issue'
    },
    {
      key: 'technical',
      label: 'Technical Issue',
      description: 'App errors, bugs, or performance',
      icon: AlertTriangle,
      subject: 'Technical Issue'
    },
    {
      key: 'other',
      label: 'Other',
      description: 'Anything else we can help with',
      icon: HelpCircle,
      subject: ''
    },
  ];

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

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await api.get('/api/support');
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Failed to load support tickets:', error);
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const getTicketStatusColor = (status) => {
    const colors = {
      open: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[status] || colors.open;
  };

  const openSupportForm = (category) => {
    setSelectedCategory(category);
    setSupportForm({ subject: category.subject, message: '' });
  };

  const handleSupportSubmit = async () => {
    if (!supportForm.subject || !supportForm.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setSupportLoading(true);
      const response = await api.post('/api/users/support/contact', {
        subject: supportForm.subject,
        message: supportForm.message,
        priority: 'medium',
        category: selectedCategory?.key || 'other',
      });

      const ticketNumber = response.data?.data?.ticketNumber || response.data?.ticketNumber;
      showToast(
        ticketNumber
          ? `Support ticket created! Ticket #${ticketNumber}`
          : 'Message sent successfully!',
        'success'
      );

      setSupportForm({ subject: '', message: '' });
      setSelectedCategory(null);
      fetchTickets(); // Refresh tickets list
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleIssueReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/support/report', issueReport);
      showToast('Issue reported successfully!', 'success');
      setIssueReport({ type: 'bug', description: '' });
      fetchTickets(); // Refresh tickets list
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to report issue', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Find answers or get in touch with our support team
        </p>
      </div>

      {/* My Support Tickets */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Support Tickets
        </h3>
        {ticketsLoading ? (
          <p className="text-sm text-gray-500">Loading tickets...</p>
        ) : tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.slice(0, 5).map(ticket => (
              <div key={ticket._id}>
                <div
                  onClick={() => setSelectedTicket(selectedTicket?._id === ticket._id ? null : ticket)}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-brand-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ticket.ticketNumber} · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`ml-3 px-2 py-1 rounded text-xs font-medium shrink-0 ${getTicketStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Expanded ticket detail */}
                {selectedTicket?._id === ticket._id && (
                  <div className="mt-2 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.description}</p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Created {new Date(ticket.createdAt).toLocaleString()}
                        </div>
                        {ticket.updatedAt !== ticket.createdAt && (
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Updated {new Date(ticket.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      {ticket.status === 'in_progress' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          Our team is working on this ticket
                        </p>
                      )}
                      {ticket.status === 'resolved' && (
                        <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          This ticket has been resolved
                        </p>
                      )}
                      {ticket.status === 'closed' && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 p-2 rounded">
                          This ticket has been closed
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No support tickets yet.</p>
        )}
      </div>

      {/* Quick Help Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How can we help?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {supportCategories.map(cat => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => openSupportForm(cat)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedCategory?.key === cat.key
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-brand-300'
                }`}
              >
                <IconComponent className="h-6 w-6 text-brand-500 mb-2" />
                <p className="font-medium text-sm text-gray-900 dark:text-white">{cat.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Support Form (shown after category selection) */}
      {selectedCategory && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {selectedCategory.label}
            </h4>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Subject"
              value={supportForm.subject}
              onChange={e => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              required
            />
            <Input
              label="Describe your issue"
              as="textarea"
              value={supportForm.message}
              onChange={e => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              required
              minLength={20}
              placeholder={
                selectedCategory.key === 'booking'
                  ? 'Which booking? What went wrong?'
                  : selectedCategory.key === 'payment'
                  ? 'What payment issue are you facing?'
                  : 'Tell us what happened...'
              }
            />
            <Button
              variant="primary"
              onClick={handleSupportSubmit}
              loading={supportLoading}
              disabled={supportLoading || !supportForm.subject || !supportForm.message}
            >
              {supportLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Can't find what you need? Email us at <a href="mailto:support@kalasetu.com" className="text-brand-500 hover:text-brand-600">support@kalasetu.com</a>
          </p>
        </div>
      )}

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
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFaq === idx ? 'rotate-180' : ''
                  }`}
                />
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

      {/* Report Issue */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Report an Issue
        </h3>
        <form onSubmit={handleIssueReport} className="space-y-4">
          <Input
            label="Issue Type"
            as="select"
            value={issueReport.type}
            onChange={e => setIssueReport(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'bug', label: 'Bug/Error' },
              { value: 'payment', label: 'Payment Problem' },
              { value: 'artisan', label: 'Artisan Complaint' },
              { value: 'performance', label: 'App Performance' },
              { value: 'feature', label: 'Feature Request' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            label="Description"
            as="textarea"
            value={issueReport.description}
            onChange={e => setIssueReport(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            required
            minLength={50}
            placeholder="Describe the issue in detail..."
            helperText={`${issueReport.description.length}/50 characters minimum`}
          />
          <Button type="submit" variant="primary">
            Submit Report
          </Button>
        </form>
      </div>

      {/* Legal Links */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
        <div className="space-y-2">
          <a href="/terms" className="block text-brand-500 hover:text-brand-600 hover:underline">
            Terms of Service
          </a>
          <a href="/privacy" className="block text-brand-500 hover:text-brand-600 hover:underline">
            Privacy Policy
          </a>
          <a href="/refund" className="block text-brand-500 hover:text-brand-600 hover:underline">
            Refund Policy
          </a>
        </div>
      </div>

      {/* App Version */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>App Version: 1.0.0</p>
        <button className="text-brand-500 hover:text-brand-600 mt-2">
          Check for Updates
        </button>
      </div>
    </div>
  );
};

export default HelpSupportTab;

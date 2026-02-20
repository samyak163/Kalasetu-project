import { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import api from '../../lib/axios.js';

const DISMISS_KEY = 'ks_profile_completion_dismissed';

const STEP_LABELS = {
  hasProfilePhoto: { label: 'Add a profile photo', tab: 'profile' },
  hasBio: { label: 'Write your bio (at least 10 characters)', tab: 'profile' },
  hasService: { label: 'Add at least one service', tab: 'services' },
  hasPortfolio: { label: 'Create a portfolio project', tab: 'portfolio' },
  emailVerified: { label: 'Verify your email address', tab: 'profile' },
};

/**
 * Profile completion progress card. Only renders when profile is incomplete.
 * Dismissible — stores preference in localStorage.
 *
 * @param {function} onNavigateTab - (tabKey) => void, navigates to a dashboard tab
 */
export default function ProfileCompletionCard({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    if (dismissed) return;
    api.get('/api/artisan/dashboard/verification-status')
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch((err) => { console.error('[ProfileCompletionCard] fetch failed:', err.message); setFetchError(true); });
  }, [dismissed]);

  if (dismissed || !data || data.isFullyVerified) return null;
  if (fetchError) return null;

  const percentage = Math.round((data.completedCount / data.totalCount) * 100);
  const nextStep = data.steps.find(s => !s.completed);
  const nextStepInfo = nextStep ? STEP_LABELS[nextStep.name] : null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch {}
  };

  return (
    <Card className="border border-brand-100 bg-brand-50/30">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Complete your profile</h3>
          <p className="text-xs text-gray-500 mt-0.5">{percentage}% complete — {data.completedCount}/{data.totalCount} steps done</p>
        </div>
        <button onClick={handleDismiss} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step checklist */}
      <div className="space-y-1.5 mb-3">
        {data.steps.map(step => {
          const info = STEP_LABELS[step.name] || { label: step.name, tab: 'profile' };
          return (
            <div key={step.name} className="flex items-center gap-2 text-sm">
              {step.completed ? (
                <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300 shrink-0" />
              )}
              <span className={step.completed ? 'text-gray-400 line-through' : 'text-gray-700'}>
                {info.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next action CTA */}
      {nextStepInfo && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateTab?.(nextStepInfo.tab)}
          className="w-full justify-between"
        >
          {nextStepInfo.label}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}

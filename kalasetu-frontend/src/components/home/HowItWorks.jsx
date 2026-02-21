import { Search, Calendar, Star } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Browse',
    description: 'Discover skilled artisans in your city with verified profiles and real reviews.',
  },
  {
    icon: Calendar,
    title: 'Book',
    description: 'Pick a date and time that works for you. Pay securely through KalaSetu.',
  },
  {
    icon: Star,
    title: 'Experience',
    description: 'Enjoy the service and leave a review to help others find great artisans.',
  },
];

/**
 * 3-step "How It Works" explainer (Browse → Book → Experience).
 * Redesigned with design system tokens.
 */
export default function HowItWorks() {
  return (
    <section className="py-12 bg-surface-muted">
      <div className="px-4 max-w-container mx-auto text-center">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center mb-3">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="text-xs text-gray-400 font-medium mb-1">Step {i + 1}</span>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-600 max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

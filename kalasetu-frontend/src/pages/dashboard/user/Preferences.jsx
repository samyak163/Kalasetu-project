import { Settings } from 'lucide-react';
import { EmptyState } from '../../../components/ui';

const Preferences = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
      <EmptyState
        icon={<Settings className="w-12 h-12" />}
        title="Preferences Coming Soon"
        description="Notification settings, language preferences, and more will be available in an upcoming update."
      />
    </div>
  );
};

export default Preferences;

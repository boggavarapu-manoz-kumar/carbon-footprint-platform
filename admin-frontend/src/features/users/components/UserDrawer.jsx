import { X, ShieldAlert, CheckCircle, Mail, Calendar, User, Globe, Phone, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../../components/ui/Button';

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
    <dt className="text-sm text-gray-500">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-words">{value || '—'}</dd>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-orange-100 text-orange-800',
    LOCKED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

export const UserDrawer = ({ user, isOpen, onClose, onSuspendToggle, isActionPending, actionError }) => {
  if (!user) return null;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.email;
  const initial = (user.firstName || user.email || '?').charAt(0).toUpperCase();
  const isActive = user.status === 'ACTIVE';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="px-6 py-8 flex flex-col items-center border-b border-gray-100 bg-gray-50">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm mb-4">
              {initial}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
            <div className="flex items-center text-gray-500 mt-1">
              <Mail className="w-4 h-4 mr-1.5" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="mt-3">
              <StatusBadge status={user.status} />
            </div>
          </div>

          {/* Error Banner */}
          {actionError && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {/* Account Details */}
          <div className="px-6 py-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Information</h4>
            <dl>
              <InfoRow label="User ID" value={`#${user.id}`} />
              <InfoRow label="Username" value={user.username} />
              <InfoRow label="Role" value={user.role} />
              <InfoRow label="Provider" value={user.provider} />
              <InfoRow label="Gender" value={user.gender} />
              <InfoRow label="Mobile" value={user.mobileNumber} />
              <InfoRow
                label="Joined"
                value={user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : null}
              />
              <InfoRow
                label="Last Updated"
                value={user.updatedAt ? format(new Date(user.updatedAt), 'MMM d, yyyy · h:mm a') : null}
              />
            </dl>
          </div>

          {/* User Statistics */}
          <div className="px-6 py-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">—</p>
                <p className="text-xs text-blue-600 mt-1">Activities Logged</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-700">—</p>
                <p className="text-xs text-green-600 mt-1">Emissions Tracked</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Detailed per-user stats coming soon via analytics API.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isActionPending}>
            Close
          </Button>
          <Button
            variant={isActive ? 'danger' : 'primary'}
            className="flex-1"
            onClick={() => onSuspendToggle(user)}
            disabled={isActionPending}
          >
            {isActionPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isActive ? (
              <ShieldAlert className="w-4 h-4 mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {isActionPending ? 'Processing…' : isActive ? 'Suspend User' : 'Restore Access'}
          </Button>
        </div>
      </div>
    </>
  );
};

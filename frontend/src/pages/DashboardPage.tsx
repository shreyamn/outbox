import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ComposeModal } from '../components/ComposeModal';
import { ScheduledEmailsTable } from '../components/ScheduledEmailsTable';
import { SentEmailsTable } from '../components/SentEmailsTable';
import type { User } from '../types';

type Tab = 'scheduled' | 'sent';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>('scheduled');
  const [showCompose, setShowCompose] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Load user from JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login', { replace: true }); return; }

    // Decode JWT payload (client side, no verification needed — server verifies on each API call)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ userId: payload.userId, email: payload.email });
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Show Slack connection feedback
  useEffect(() => {
    if (params.get('slack_connected')) toast.success('🎉 Slack connected successfully!');
    if (params.get('slack_error')) toast.error('Failed to connect Slack');
  }, [params]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleScheduleSuccess = useCallback(() => {
    setRefreshTrigger((n) => n + 1);
    setTab('scheduled');
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage scheduled campaigns and track delivery
          </p>
        </div>
        <button
          id="compose-btn"
          onClick={() => setShowCompose(true)}
          className="btn-primary text-sm px-6 py-3 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Compose New Email
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'BullMQ Jobs', value: 'Active', icon: '⚡', color: 'text-blue-400' },
          { label: 'Rate Limit', value: '100/hr', icon: '🛡️', color: 'text-violet-400' },
          { label: 'Concurrency', value: '5x', icon: '⚙️', color: 'text-amber-400' },
          { label: 'Bull Board', href: '/admin/queues', value: 'Monitor', icon: '📊', color: 'text-emerald-400' },
        ].map(({ label, value, icon, color, href }) => (
          <div key={label} className="glass-card px-4 py-3 flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className={`text-sm font-semibold ${color} hover:underline`}>{value}</a>
              ) : (
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="flex gap-2 p-3 border-b border-gray-800/50">
          <button
            id="tab-scheduled"
            onClick={() => setTab('scheduled')}
            className={tab === 'scheduled' ? 'tab-btn-active' : 'tab-btn'}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Scheduled Emails
            </span>
          </button>
          <button
            id="tab-sent"
            onClick={() => setTab('sent')}
            className={tab === 'sent' ? 'tab-btn-active' : 'tab-btn'}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sent Emails
            </span>
          </button>
        </div>

        <div className="p-4">
          {tab === 'scheduled' ? (
            <ScheduledEmailsTable refreshTrigger={refreshTrigger} />
          ) : (
            <SentEmailsTable refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;

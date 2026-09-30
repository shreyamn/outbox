import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { TableSkeleton, EmptyState, ErrorState } from './States';
import { useEmailJobs } from '../hooks/useEmailJobs';

interface Props {
  refreshTrigger: number;
}

export const SentEmailsTable: React.FC<Props> = ({ refreshTrigger }) => {
  const { data, loading, error, refetch } = useEmailJobs('sent');

  useEffect(() => { refetch(); }, [refetch, refreshTrigger]);

  if (loading) return <TableSkeleton rows={5} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data?.jobs.length) return (
    <EmptyState
      icon="📬"
      title="No sent emails yet"
      description="Emails that have been sent or failed will appear here with their delivery status."
    />
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{data.total} email{data.total !== 1 ? 's' : ''} delivered</p>
        <button onClick={() => refetch()} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-800/60">
        <table className="w-full data-table">
          <thead className="bg-gray-900/80">
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Sent At</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {data.jobs.map((job) => (
              <tr key={job.id} className="transition-colors">
                <td>
                  <div className="font-medium text-gray-200">{job.toEmail}</div>
                  {job.toName && <div className="text-xs text-gray-500">{job.toName}</div>}
                </td>
                <td className="max-w-xs truncate">{job.subject}</td>
                <td className="whitespace-nowrap text-gray-400">
                  {job.sentAt ? format(new Date(job.sentAt), 'MMM d, yyyy HH:mm') : '—'}
                </td>
                <td><StatusBadge status={job.status} /></td>
                <td>
                  {job.status === 'FAILED' && job.failReason ? (
                    <span className="text-red-400 text-xs truncate max-w-[200px] block" title={job.failReason}>
                      {job.failReason}
                    </span>
                  ) : job.messageId ? (
                    <span className="text-xs text-gray-500 font-mono">{job.messageId.slice(0, 20)}…</span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

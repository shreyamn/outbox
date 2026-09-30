import React from 'react';
import type { EmailStatus } from '../types';

const config: Record<EmailStatus, { label: string; className: string; dot: string }> = {
  SCHEDULED: { label: 'Scheduled', className: 'badge-scheduled', dot: 'bg-blue-400' },
  PROCESSING: { label: 'Processing', className: 'badge-processing', dot: 'bg-amber-400 animate-pulse' },
  SENT:       { label: 'Sent',       className: 'badge-sent',       dot: 'bg-emerald-400' },
  FAILED:     { label: 'Failed',     className: 'badge-failed',     dot: 'bg-red-400' },
};

interface Props {
  status: EmailStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const { label, className, dot } = config[status] ?? config.SCHEDULED;
  return (
    <span className={className}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dot}`} />
      {label}
    </span>
  );
};

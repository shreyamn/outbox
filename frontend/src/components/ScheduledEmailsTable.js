import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { StatusBadge } from './StatusBadge';
import { TableSkeleton, EmptyState, ErrorState } from './States';
import { useEmailJobs } from '../hooks/useEmailJobs';
import { cancelEmailJob } from '../services/emailService';
export const ScheduledEmailsTable = ({ refreshTrigger }) => {
    const { data, loading, error, refetch } = useEmailJobs('scheduled');
    useEffect(() => { refetch(); }, [refetch, refreshTrigger]);
    const handleCancel = useCallback(async (job) => {
        if (!confirm(`Cancel email to ${job.toEmail}?`))
            return;
        try {
            await cancelEmailJob(job.id);
            toast.success('Email cancelled');
            refetch();
        }
        catch {
            toast.error('Failed to cancel email');
        }
    }, [refetch]);
    if (loading)
        return _jsx(TableSkeleton, { rows: 5 });
    if (error)
        return _jsx(ErrorState, { message: error, onRetry: refetch });
    if (!data?.jobs.length)
        return (_jsx(EmptyState, { icon: "\uD83D\uDCED", title: "No scheduled emails", description: "Compose a new campaign to get started. Your scheduled emails will appear here." }));
    return (_jsxs("div", { className: "animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("p", { className: "text-sm text-gray-400", children: [data.total, " scheduled email", data.total !== 1 ? 's' : ''] }), _jsxs("button", { onClick: () => refetch(), className: "text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), "Refresh"] })] }), _jsx("div", { className: "overflow-x-auto rounded-xl border border-gray-800/60", children: _jsxs("table", { className: "w-full data-table", children: [_jsx("thead", { className: "bg-gray-900/80", children: _jsxs("tr", { children: [_jsx("th", { children: "To" }), _jsx("th", { children: "Subject" }), _jsx("th", { children: "Scheduled At" }), _jsx("th", { children: "Status" }), _jsx("th", { className: "text-right", children: "Action" })] }) }), _jsx("tbody", { children: data.jobs.map((job) => (_jsxs("tr", { className: "transition-colors", children: [_jsxs("td", { children: [_jsx("div", { className: "font-medium text-gray-200", children: job.toEmail }), job.toName && _jsx("div", { className: "text-xs text-gray-500", children: job.toName })] }), _jsx("td", { className: "max-w-xs truncate", children: job.subject }), _jsx("td", { className: "whitespace-nowrap text-gray-400", children: format(new Date(job.scheduledAt), 'MMM d, yyyy HH:mm') }), _jsx("td", { children: _jsx(StatusBadge, { status: job.status }) }), _jsx("td", { className: "text-right", children: job.status === 'SCHEDULED' && (_jsx("button", { onClick: () => handleCancel(job), className: "btn-danger py-1 px-3 text-xs", children: "Cancel" })) })] }, job.id))) })] }) }), data.total > data.limit && (_jsxs("p", { className: "text-xs text-gray-500 text-center mt-3", children: ["Showing ", data.jobs.length, " of ", data.total, " \u2014 use pagination to see more"] }))] }));
};

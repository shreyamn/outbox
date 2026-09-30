import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { TableSkeleton, EmptyState, ErrorState } from './States';
import { useEmailJobs } from '../hooks/useEmailJobs';
export const SentEmailsTable = ({ refreshTrigger }) => {
    const { data, loading, error, refetch } = useEmailJobs('sent');
    useEffect(() => { refetch(); }, [refetch, refreshTrigger]);
    if (loading)
        return _jsx(TableSkeleton, { rows: 5 });
    if (error)
        return _jsx(ErrorState, { message: error, onRetry: refetch });
    if (!data?.jobs.length)
        return (_jsx(EmptyState, { icon: "\uD83D\uDCEC", title: "No sent emails yet", description: "Emails that have been sent or failed will appear here with their delivery status." }));
    return (_jsxs("div", { className: "animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("p", { className: "text-sm text-gray-400", children: [data.total, " email", data.total !== 1 ? 's' : '', " delivered"] }), _jsxs("button", { onClick: () => refetch(), className: "text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1", children: [_jsx("svg", { className: "w-3.5 h-3.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), "Refresh"] })] }), _jsx("div", { className: "overflow-x-auto rounded-xl border border-gray-800/60", children: _jsxs("table", { className: "w-full data-table", children: [_jsx("thead", { className: "bg-gray-900/80", children: _jsxs("tr", { children: [_jsx("th", { children: "To" }), _jsx("th", { children: "Subject" }), _jsx("th", { children: "Sent At" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Details" })] }) }), _jsx("tbody", { children: data.jobs.map((job) => (_jsxs("tr", { className: "transition-colors", children: [_jsxs("td", { children: [_jsx("div", { className: "font-medium text-gray-200", children: job.toEmail }), job.toName && _jsx("div", { className: "text-xs text-gray-500", children: job.toName })] }), _jsx("td", { className: "max-w-xs truncate", children: job.subject }), _jsx("td", { className: "whitespace-nowrap text-gray-400", children: job.sentAt ? format(new Date(job.sentAt), 'MMM d, yyyy HH:mm') : '—' }), _jsx("td", { children: _jsx(StatusBadge, { status: job.status }) }), _jsx("td", { children: job.status === 'FAILED' && job.failReason ? (_jsx("span", { className: "text-red-400 text-xs truncate max-w-[200px] block", title: job.failReason, children: job.failReason })) : job.messageId ? (_jsxs("span", { className: "text-xs text-gray-500 font-mono", children: [job.messageId.slice(0, 20), "\u2026"] })) : '—' })] }, job.id))) })] }) })] }));
};

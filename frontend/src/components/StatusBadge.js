import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const config = {
    SCHEDULED: { label: 'Scheduled', className: 'badge-scheduled', dot: 'bg-blue-400' },
    PROCESSING: { label: 'Processing', className: 'badge-processing', dot: 'bg-amber-400 animate-pulse' },
    SENT: { label: 'Sent', className: 'badge-sent', dot: 'bg-emerald-400' },
    FAILED: { label: 'Failed', className: 'badge-failed', dot: 'bg-red-400' },
};
export const StatusBadge = ({ status }) => {
    const { label, className, dot } = config[status] ?? config.SCHEDULED;
    return (_jsxs("span", { className: className, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full inline-block ${dot}` }), label] }));
};

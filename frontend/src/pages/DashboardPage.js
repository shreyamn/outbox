import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ComposeModal } from '../components/ComposeModal';
import { ScheduledEmailsTable } from '../components/ScheduledEmailsTable';
import { SentEmailsTable } from '../components/SentEmailsTable';
const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('scheduled');
    const [showCompose, setShowCompose] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    // Load user from JWT
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        // Decode JWT payload (client side, no verification needed — server verifies on each API call)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ userId: payload.userId, email: payload.email });
        }
        catch {
            navigate('/login', { replace: true });
        }
    }, [navigate]);
    // Show Slack connection feedback
    useEffect(() => {
        if (params.get('slack_connected'))
            toast.success('🎉 Slack connected successfully!');
        if (params.get('slack_error'))
            toast.error('Failed to connect Slack');
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
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" }) }));
    }
    return (_jsxs(DashboardLayout, { user: user, onLogout: handleLogout, children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: "Email Dashboard" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Manage scheduled campaigns and track delivery" })] }), _jsxs("button", { id: "compose-btn", onClick: () => setShowCompose(true), className: "btn-primary text-sm px-6 py-3 self-start sm:self-auto", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "Compose New Email"] })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6", children: [
                    { label: 'BullMQ Jobs', value: 'Active', icon: '⚡', color: 'text-blue-400' },
                    { label: 'Rate Limit', value: '100/hr', icon: '🛡️', color: 'text-violet-400' },
                    { label: 'Concurrency', value: '5x', icon: '⚙️', color: 'text-amber-400' },
                    { label: 'Bull Board', href: '/admin/queues', value: 'Monitor', icon: '📊', color: 'text-emerald-400' },
                ].map(({ label, value, icon, color, href }) => (_jsxs("div", { className: "glass-card px-4 py-3 flex items-center gap-3", children: [_jsx("span", { className: "text-xl", children: icon }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: label }), href ? (_jsx("a", { href: href, target: "_blank", rel: "noreferrer", className: `text-sm font-semibold ${color} hover:underline`, children: value })) : (_jsx("p", { className: `text-sm font-semibold ${color}`, children: value }))] })] }, label))) }), _jsxs("div", { className: "glass-card", children: [_jsxs("div", { className: "flex gap-2 p-3 border-b border-gray-800/50", children: [_jsx("button", { id: "tab-scheduled", onClick: () => setTab('scheduled'), className: tab === 'scheduled' ? 'tab-btn-active' : 'tab-btn', children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), "Scheduled Emails"] }) }), _jsx("button", { id: "tab-sent", onClick: () => setTab('sent'), className: tab === 'sent' ? 'tab-btn-active' : 'tab-btn', children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), "Sent Emails"] }) })] }), _jsx("div", { className: "p-4", children: tab === 'scheduled' ? (_jsx(ScheduledEmailsTable, { refreshTrigger: refreshTrigger })) : (_jsx(SentEmailsTable, { refreshTrigger: refreshTrigger })) })] }), showCompose && (_jsx(ComposeModal, { onClose: () => setShowCompose(false), onSuccess: handleScheduleSuccess }))] }));
};
export default DashboardPage;

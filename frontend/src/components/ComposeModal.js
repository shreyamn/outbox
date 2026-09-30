import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { scheduleEmails, parseCsvPreview } from '../services/emailService';
export const ComposeModal = ({ onClose, onSuccess }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [csvInfo, setCsvInfo] = useState(null);
    const [startTime, setStartTime] = useState(() => {
        const d = new Date(Date.now() + 5 * 60 * 1000);
        return d.toISOString().slice(0, 16);
    });
    const [delayMs, setDelayMs] = useState(2000);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef(null);
    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setCsvFile(file);
        try {
            const info = await parseCsvPreview(file);
            setCsvInfo(info);
        }
        catch {
            toast.error('Failed to parse CSV');
            setCsvFile(null);
        }
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            const fake = { target: { files: [file] } };
            handleFileChange(fake);
        }
    }, [handleFileChange]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            toast.error('Please upload a CSV file');
            return;
        }
        if (!subject.trim()) {
            toast.error('Subject is required');
            return;
        }
        if (!body.trim()) {
            toast.error('Email body is required');
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('csv', csvFile);
            fd.append('subject', subject.trim());
            fd.append('body', body.trim());
            fd.append('startTime', new Date(startTime).toISOString());
            fd.append('delayBetweenMs', String(delayMs));
            const result = await scheduleEmails(fd);
            toast.success(`🎉 Scheduled ${result.count} emails successfully!`);
            onSuccess();
            onClose();
        }
        catch (err) {
            const msg = err?.response?.data?.error ?? 'Failed to schedule emails';
            toast.error(msg);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in", children: [_jsx("div", { className: "absolute inset-0 bg-black/70 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "relative w-full max-w-2xl glass-card p-6 animate-slide-up max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Compose Email Campaign" }), _jsx("p", { className: "text-sm text-gray-400 mt-0.5", children: "Schedule bulk emails with rate-limited delivery" })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Subject *" }), _jsx("input", { className: "input", type: "text", placeholder: "Your email subject line", value: subject, onChange: (e) => setSubject(e.target.value), maxLength: 500 })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Email Body *" }), _jsx("textarea", { className: "input resize-none", rows: 5, placeholder: "Write your email content here (HTML supported)...", value: body, onChange: (e) => setBody(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Recipients CSV *" }), _jsxs("div", { className: `border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${csvFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5'}`, onClick: () => fileRef.current?.click(), onDrop: handleDrop, onDragOver: (e) => e.preventDefault(), children: [_jsx("input", { ref: fileRef, type: "file", accept: ".csv", className: "hidden", onChange: handleFileChange }), csvFile ? (_jsxs("div", { className: "animate-fade-in", children: [_jsx("div", { className: "text-2xl mb-2", children: "\u2705" }), _jsx("p", { className: "text-emerald-400 font-semibold", children: csvFile.name }), csvInfo && (_jsxs("p", { className: "text-sm text-gray-400 mt-1", children: [_jsx("span", { className: "text-white font-bold", children: csvInfo.count }), " unique emails detected"] }))] })) : (_jsxs("div", { children: [_jsx("div", { className: "text-3xl mb-2", children: "\uD83D\uDCC2" }), _jsxs("p", { className: "text-gray-400 text-sm", children: ["Drop CSV here or ", _jsx("span", { className: "text-blue-400", children: "browse" })] }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Columns: email, name (optional)" })] }))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "label", children: "Start Time *" }), _jsx("input", { className: "input", type: "datetime-local", value: startTime, onChange: (e) => setStartTime(e.target.value), min: new Date().toISOString().slice(0, 16) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Delay Between Emails (ms)" }), _jsx("input", { className: "input", type: "number", min: 0, step: 500, value: delayMs, onChange: (e) => setDelayMs(Number(e.target.value)) })] })] }), _jsx("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-lg leading-none", children: "\u2139\uFE0F" }), _jsxs("div", { children: [_jsx("p", { children: "Emails will be sent with BullMQ delayed jobs and are rate-limited server-side." }), _jsx("p", { className: "mt-1 text-blue-400/70", children: "Rate-limited emails are automatically rescheduled to the next available window." })] })] }) }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-secondary", disabled: submitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn-primary", disabled: submitting, children: submitting ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "w-4 h-4 animate-spin", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Scheduling..."] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) }), "Schedule Campaign"] })) })] })] })] })] }));
};

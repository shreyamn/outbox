import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { scheduleEmails, parseCsvPreview } from '../services/emailService';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const ComposeModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvInfo, setCsvInfo] = useState<{ count: number } | null>(null);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [delayMs, setDelayMs] = useState(2000);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    try {
      const info = await parseCsvPreview(file);
      setCsvInfo(info);
    } catch {
      toast.error('Failed to parse CSV');
      setCsvFile(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      const fake = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fake);
    }
  }, [handleFileChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) { toast.error('Please upload a CSV file'); return; }
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!body.trim()) { toast.error('Email body is required'); return; }

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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to schedule emails';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-card p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Compose Email Campaign</h2>
            <p className="text-sm text-gray-400 mt-0.5">Schedule bulk emails with rate-limited delivery</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject */}
          <div>
            <label className="label">Subject *</label>
            <input
              className="input"
              type="text"
              placeholder="Your email subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Body */}
          <div>
            <label className="label">Email Body *</label>
            <textarea
              className="input resize-none"
              rows={5}
              placeholder="Write your email content here (HTML supported)..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {/* CSV Upload */}
          <div>
            <label className="label">Recipients CSV *</label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                csvFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5'
              }`}
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              {csvFile ? (
                <div className="animate-fade-in">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-emerald-400 font-semibold">{csvFile.name}</p>
                  {csvInfo && (
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-white font-bold">{csvInfo.count}</span> unique emails detected
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📂</div>
                  <p className="text-gray-400 text-sm">Drop CSV here or <span className="text-blue-400">browse</span></p>
                  <p className="text-xs text-gray-600 mt-1">Columns: email, name (optional)</p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Config */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time *</label>
              <input
                className="input"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="label">Delay Between Emails (ms)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={500}
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">ℹ️</span>
              <div>
                <p>Emails will be sent with BullMQ delayed jobs and are rate-limited server-side.</p>
                <p className="mt-1 text-blue-400/70">Rate-limited emails are automatically rescheduled to the next available window.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scheduling...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Schedule Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

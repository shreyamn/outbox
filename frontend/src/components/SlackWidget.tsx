import React from 'react';
import { useSlack } from '../hooks/useSlack';
import { toast } from 'react-hot-toast';

export const SlackWidget: React.FC = () => {
  const { status, loading, disconnect, connectUrl } = useSlack();

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Slack disconnected');
    } catch {
      toast.error('Failed to disconnect Slack');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 animate-pulse">
        <div className="w-4 h-4 bg-gray-700 rounded" />
        <div className="w-16 h-3 bg-gray-700 rounded" />
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
      status.connected
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
    }`}>
      {/* Slack logo */}
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>

      {status.connected ? (
        <>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status.teamName ?? 'Connected'}
            {status.channelName && <span className="text-emerald-500/70">#{status.channelName}</span>}
          </span>
          <button
            onClick={handleDisconnect}
            className="ml-1 text-emerald-500/70 hover:text-red-400 transition-colors"
            title="Disconnect Slack"
          >
            ✕
          </button>
        </>
      ) : (
        <a
          href={connectUrl}
          className="hover:text-white transition-colors"
          title="Connect Slack for rate limit notifications"
        >
          Connect Slack
        </a>
      )}
    </div>
  );
};

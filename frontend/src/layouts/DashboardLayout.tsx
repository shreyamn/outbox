import React from 'react';
import type { User } from '../types';
import { SlackWidget } from '../components/SlackWidget';

interface Props {
  user: User;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<React.PropsWithChildren<Props>> = ({ user, onLogout, children }) => (
  <div className="min-h-screen flex flex-col">
    {/* Header */}
    <header className="glass border-b border-gray-800/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-white text-lg leading-none">ReachInbox</span>
            <span className="text-gray-500 text-xs block leading-none mt-0.5">Email Platform</span>
          </div>
        </div>

        {/* Right: Slack + User */}
        <div className="flex items-center gap-3">
          <SlackWidget />

          {/* User info */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-800">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-200 leading-none">{user.email.split('@')[0]}</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="ml-2 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Main content */}
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>

    {/* Footer */}
    <footer className="border-t border-gray-800/40 py-4 text-center text-xs text-gray-600">
      ReachInbox • Built with React, Express, BullMQ & PostgreSQL
    </footer>
  </div>
);

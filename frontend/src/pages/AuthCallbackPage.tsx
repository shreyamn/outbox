import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * /auth/callback?token=xxx
 * Saves the JWT to localStorage and redirects to /dashboard
 */
const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-pulse-slow">
        <div className="text-4xl mb-4">⚡</div>
        <p className="text-gray-400">Completing sign-in…</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

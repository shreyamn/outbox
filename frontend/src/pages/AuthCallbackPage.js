import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
/**
 * /auth/callback?token=xxx
 * Saves the JWT to localStorage and redirects to /dashboard
 */
const AuthCallbackPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            navigate('/dashboard', { replace: true });
        }
        else {
            navigate('/login?error=no_token', { replace: true });
        }
    }, [navigate]);
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center animate-pulse-slow", children: [_jsx("div", { className: "text-4xl mb-4", children: "\u26A1" }), _jsx("p", { className: "text-gray-400", children: "Completing sign-in\u2026" })] }) }));
};
export default AuthCallbackPage;

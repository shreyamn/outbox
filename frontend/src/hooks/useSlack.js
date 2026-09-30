import { useState, useEffect, useCallback } from 'react';
import { getSlackStatus, disconnectSlack } from '../services/emailService';
export function useSlack() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const s = await getSlackStatus();
            setStatus(s);
        }
        catch {
            setStatus({ connected: false });
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { refresh(); }, [refresh]);
    const disconnect = async () => {
        await disconnectSlack();
        await refresh();
    };
    const connectUrl = '/api/slack/connect';
    return { status, loading, refresh, disconnect, connectUrl };
}

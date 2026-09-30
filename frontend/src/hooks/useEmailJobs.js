import { useState, useCallback } from 'react';
import { getScheduledEmails, getSentEmails } from '../services/emailService';
export function useEmailJobs(type) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetch = useCallback(async (page = 1, limit = 20) => {
        setLoading(true);
        setError(null);
        try {
            const fn = type === 'scheduled' ? getScheduledEmails : getSentEmails;
            const res = await fn(page, limit);
            setData(res);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load emails';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    }, [type]);
    return { data, loading, error, refetch: fetch };
}

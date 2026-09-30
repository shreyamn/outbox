import api from './api';
export async function getScheduledEmails(page = 1, limit = 20) {
    const { data } = await api.get('/emails/scheduled', { params: { page, limit } });
    return data;
}
export async function getSentEmails(page = 1, limit = 20) {
    const { data } = await api.get('/emails/sent', { params: { page, limit } });
    return data;
}
export async function scheduleEmails(formData) {
    const { data } = await api.post('/emails/schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}
export async function parseCsvPreview(file) {
    const fd = new FormData();
    fd.append('csv', file);
    const { data } = await api.post('/emails/parse-csv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}
export async function cancelEmailJob(id) {
    await api.delete(`/emails/${id}`);
}
export async function getSlackStatus() {
    const { data } = await api.get('/slack/status');
    return data;
}
export async function disconnectSlack() {
    await api.delete('/slack/disconnect');
}

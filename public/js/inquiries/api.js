import { apiFetchJSON } from '../utils/api.js';

export async function fetchInquiries() {
    const data = await apiFetchJSON('/inquiries', 'GET');
    return data.inquiries ?? [];
}

export async function fetchUserInquiries() {
    const data = await apiFetchJSON('/inquiries/user', 'GET');
    return data.inquiries ?? [];
}

export async function addInquiry(inquiryData) {
    const data = await apiFetchJSON('/inquiries/addInquiry', 'POST', inquiryData);
    return data;
}

export async function replyInquiry(id, response) {
    const body = {
        'id': id,
        'response': response
    };

    const data = await apiFetchJSON('/inquiries/replyInquiry', 'POST', body);
    console.log('inquiry reply sent: ' + data.success);
    return data.success;
}

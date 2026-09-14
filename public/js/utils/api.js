export async function apiFetch(url, method, body = null) {
    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response;
}
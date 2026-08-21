export function getCurrentUser() {
    const user = sessionStorage.getItem('user');

    return user ? JSON.parse(user) : null;
}

export function clearCurrentUser() {
    sessionStorage.removeItem('user');
}
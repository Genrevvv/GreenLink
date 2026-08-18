const login = document.querySelector('#login');

login.addEventListener('click', async (e) => {
    e.preventDefault();

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Login failed.');
            return;
        }

        window.location.href = '/';

    } catch (error) {
        console.error('Login error:', error);
        alert('Something went wrong. Please try again.');
    }
});
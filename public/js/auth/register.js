const register = document.querySelector('#register');

register.addEventListener('click', async (e) => {
    console.log('dwadaw');
    e.preventDefault();

    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, confirmPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Registration failed.');
            return;
        }

        alert('Registration successful!');
        window.location.href = '/login';

    } catch (error) {
        console.error('Registration error:', error);
        alert('Something went wrong. Please try again.');
    }
});
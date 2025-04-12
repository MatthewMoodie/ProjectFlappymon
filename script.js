document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const gameContainer = document.getElementById('game-container');
    const authContainer = document.getElementById('auth-container');

    // Event listeners for auth forms
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
    });

    // Initialize game when user is logged in
    if (localStorage.getItem('currentUser')) {
        authContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        initGame();
    }

    // Login/Register functionality is in auth.js
});

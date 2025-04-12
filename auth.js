// Mock database for users (in a real app, use a backend)
const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const gameContainer = document.getElementById('game-container');
    const authContainer = document.getElementById('auth-container');
    
    // Login
    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const user = usersDB.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            authContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            initGame();
        } else {
            alert('Invalid username or password');
        }
    });
    
    // Register
    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        if (usersDB.some(u => u.username === username)) {
            alert('Username already exists');
            return;
        }
        
        const newUser = {
            username,
            password,
            favorites: [],
            scores: []
        };
        
        usersDB.push(newUser);
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        authContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        initGame();
    });
});

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function updateUser(user) {
    const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
    const index = usersDB.findIndex(u => u.username === user.username);
    if (index !== -1) {
        usersDB[index] = user;
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

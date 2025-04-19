
const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const gameContainer = document.getElementById('game-container');
    const authContainer = document.getElementById('auth-container');
    
    
    loginBtn.addEventListener('click', () => {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Debug: Check what's in storage
        console.log("All users:", JSON.parse(localStorage.getItem('usersDB')));
        
        const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
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
    
    
    registerBtn.addEventListener('click', () => {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        // Validation
        if (!username || !password) {
            alert('Username and password are required');
            return;
        }
        
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        // Check if user exists
        const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
        if (usersDB.some(u => u.username === username)) {
            alert('Username already exists');
            return;
        }
        
        // Create new user
        const newUser = {
            username,
            password, // Note: In production, NEVER store plaintext passwords
            favorites: [],
            scores: [],
            selectedPokemon: null
        };
        
        // Update database
        usersDB.push(newUser);
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Debug: Verify storage
        console.log("Current usersDB:", JSON.parse(localStorage.getItem('usersDB')));
        
        // Redirect to game
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
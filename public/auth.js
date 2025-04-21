
window.allPokemon = [];
window.pokemonDetailsCache = {};
window.currentGame = null;

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const gameContainer = document.getElementById('game-container');
    const authContainer = document.getElementById('auth-container');
    const loginBtn = document.getElementById('login-btn');

    //login credentials
    const BOB_ACCOUNT = {
        username: "bob",
        password: "bobpass",
        favorites: [1, 4, 7],
        scores: [
            {"pokemonId": 1, "score": 10},
            {"pokemonId": 4, "score": 15}
        ],
        selectedPokemon: 1
    };

    
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



    
    
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (username === BOB_ACCOUNT.username && password === BOB_ACCOUNT.password) {
            localStorage.setItem('currentUser', JSON.stringify(BOB_ACCOUNT));
            authContainer.style.display = 'none';
            gameContainer.style.display = 'block';
            
            try {
                await fetchAllPokemon();
                initGame();
            } catch (error) {
                console.error("Game initialization failed:", error);
                alert("Failed to load game. Please refresh and try again.");
            }
        } else {
            alert("Invalid credentials. Use:\nUsername: bob\nPassword: bobpass");
        }
    });

    // auto login if already logged
    if (localStorage.getItem('currentUser')) {
        authContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        initGame();
    }
});




function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function updateUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function onLogin(username) {
    localStorage.setItem('username', username);
}

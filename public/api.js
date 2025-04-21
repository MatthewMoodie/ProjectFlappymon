const POKEAPI_URL = 'https://pokeapi.co/api/v2';




window.pokemonDetailsCache = {};
window.scoreCache = {};

async function fetchAllPokemon() {
    if (window.allPokemon && window.allPokemon.length > 0) return window.allPokemon;
    
    try {
        console.log("Fetching Pokémon from API...");
        const response = await fetch(`${POKEAPI_URL}/pokemon?limit=151`);
        const data = await response.json();
        window.allPokemon = data.results;
        return window.allPokemon;
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        return [];
    }
}










async function fetchPokemonDetails(url) {
    if (window.pokemonDetailsCache[url]) return window.pokemonDetailsCache[url];
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const details = {
            name: data.name,
            id: data.id,
            sprite: data.sprites.front_default,
            image: data.sprites.other['official-artwork']?.front_default || data.sprites.front_default
        };
        
        window.pokemonDetailsCache[url] = details;
        return details;
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}







async function displayPokemonGrid(containerId, pokemonList) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (const pokemon of pokemonList) {
        const details = await fetchPokemonDetails(pokemon.url);
        if (!details) continue;
        
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = details.id;
        card.dataset.name = details.name;
        
        const user = getCurrentUser();
        const isFavorite = user?.favorites?.includes(details.id);
        const isSelected = user?.selectedPokemon === details.id;
        
        if (isSelected) card.classList.add('selected');
        
        card.innerHTML = `
            <img src="${details.sprite}" alt="${details.name}">
            <p>${details.name}</p>
            <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" 
                    data-id="${details.id}">★</button>
        `;
        
        container.appendChild(card);
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.pokemon-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            const user = getCurrentUser();
            user.selectedPokemon = details.id;
            updateUser(user);
        });
        
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const user = getCurrentUser();
            const pokemonId = parseInt(favBtn.dataset.id);
            
            if (user.favorites.includes(pokemonId)) {
                user.favorites = user.favorites.filter(id => id !== pokemonId);
                favBtn.classList.remove('favorited');
            } else {
                user.favorites.push(pokemonId);
                favBtn.classList.add('favorited');
            }
            
            updateUser(user);
            displayFavorites();
        });
    }
}





async function displayFavorites() {
    const user = getCurrentUser();
    if (!user || !user.favorites || user.favorites.length === 0) {
        document.getElementById('favorites-section').style.display = 'none';
        return;
    }
    
    document.getElementById('favorites-section').style.display = 'block';
    
    const favoritePokemon = await Promise.all(
        user.favorites.map(async id => {
            const pokemon = window.allPokemon.find(p => {
                const urlParts = p.url.split('/');
                return parseInt(urlParts[urlParts.length - 2]) === id;
            });
            if (!pokemon) return null;
            return {...await fetchPokemonDetails(pokemon.url), url: pokemon.url};
        })
    );
    
    displayPokemonGrid('favorites-grid', favoritePokemon.filter(p => p !== null));
}


function saveScore(pokemonId, score) {
    const user = getCurrentUser();
    if (!user) return;
    
    
    if (!user.scores) {
        user.scores = [];
    }
    
    
    user.scores.push({
        pokemonId,
        score,
        timestamp: new Date().toISOString()
    });
    
    
    user.scores.sort((a, b) => b.score - a.score);
    user.scores = user.scores.slice(0, 10);
    
    updateUser(user);
    
    
    const allScores = JSON.parse(localStorage.getItem('allScores')) || [];
    allScores.push({
        username: user.username,
        pokemonId,
        score,
        timestamp: new Date().toISOString()
    });
    
    
    allScores.sort((a, b) => b.score - a.score);
    const topScores = allScores.slice(0, 100);
    localStorage.setItem('allScores', JSON.stringify(topScores));
    
    
    displayUserScores();
    updateLeaderboard();
}



function updateLeaderboard() {
    const allScores = JSON.parse(localStorage.getItem('allScores')) || [];
    
    
    const sortedScores = allScores.sort((a, b) => b.score - a.score);
    
    const tableBody = document.getElementById('scores-body');
    tableBody.innerHTML = '';
    
    sortedScores.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        
        const pokemon = window.allPokemon.find(p => {
            const urlParts = p.url.split('/');
            return parseInt(urlParts[urlParts.length - 2]) === entry.pokemonId;
        });
        
        const pokemonName = pokemon ? pokemon.name : `#${entry.pokemonId}`;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username || 'Anonymous'}</td>
            <td>${pokemonName}</td>
            <td>${entry.score}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function displayUserScores() {
    const user = getCurrentUser();
    if (!user || !user.scores || user.scores.length === 0) {
        document.getElementById('user-scores-body').innerHTML = '<tr><td colspan="3">No scores yet</td></tr>';
        return;
    }
    
    const tableBody = document.getElementById('user-scores-body');
    tableBody.innerHTML = '';
    
    
    const sortedScores = user.scores.sort((a, b) => b.score - a.score).slice(0, 5);
    
    sortedScores.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        
        const pokemon = window.allPokemon.find(p => {
            const urlParts = p.url.split('/');
            return parseInt(urlParts[urlParts.length - 2]) === entry.pokemonId;
        });
        
        const pokemonName = pokemon ? pokemon.name : `#${entry.pokemonId}`;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${pokemonName}</td>
            <td>${entry.score}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updateLeaderboard() {
    const allScores = JSON.parse(localStorage.getItem('allScores')) || [];
    
    
    const sortedScores = allScores.sort((a, b) => b.score - a.score).slice(0, 10);
    
    const tableBody = document.getElementById('global-scores-body');
    tableBody.innerHTML = '';
    
    if (sortedScores.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No scores yet</td></tr>';
        return;
    }
    
    sortedScores.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        
        const pokemon = window.allPokemon.find(p => {
            const urlParts = p.url.split('/');
            return parseInt(urlParts[urlParts.length - 2]) === entry.pokemonId;
        });
        
        const pokemonName = pokemon ? pokemon.name : `#${entry.pokemonId}`;
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username || 'Anonymous'}</td>
            <td>${pokemonName}</td>
            <td>${entry.score}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

async function initGame() {
    await fetchAllPokemon();
    await displayPokemonGrid('pokemon-grid', window.allPokemon);
    displayFavorites();
    
    const user = getCurrentUser();
    if (user.selectedPokemon) {
        const selectedCard = document.querySelector(`.pokemon-card[data-id="${user.selectedPokemon}"]`);
        if (selectedCard) selectedCard.classList.add('selected');
    }
    
    document.getElementById('start-game-btn').addEventListener('click', () => {
        const user = getCurrentUser();
        if (!user.selectedPokemon) {
            alert('Please select a Pokemon first!');
            return;
        }
        
        document.getElementById('pokemon-selection').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        startFlappyBirdGame(user.selectedPokemon);
    });
    
    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.getElementById('game-over').style.display = 'none';
        const user = getCurrentUser();
        startFlappyBirdGame(user.selectedPokemon);
    });
    
    updateLeaderboard();
    displayUserScores();
}

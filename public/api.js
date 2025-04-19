const POKEAPI_URL = 'https://pokeapi.co/api/v2';
let allPokemon = [];
let pokemonDetailsCache = {};

async function fetchAllPokemon() {
    if (allPokemon.length > 0) return allPokemon;
    
    try {
        const response = await fetch(`${POKEAPI_URL}/pokemon?limit=151`); 
        const data = await response.json();
        allPokemon = data.results;
        return allPokemon;
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        return [];
    }
}

async function fetchPokemonDetails(url) {
    if (pokemonDetailsCache[url]) return pokemonDetailsCache[url];
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const details = {
            name: data.name,
            id: data.id,
            sprite: data.sprites.front_default,
            image: data.sprites.other['official-artwork']?.front_default || data.sprites.front_default
        };
        
        pokemonDetailsCache[url] = details;
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
    if (!user || !user.favorites.length) {
        document.getElementById('favorites-section').style.display = 'none';
        return;
    }
    
    document.getElementById('favorites-section').style.display = 'block';
    
    const favoritePokemon = await Promise.all(
        user.favorites.map(async id => {
            const pokemon = allPokemon.find(p => {
                const urlParts = p.url.split('/');
                return parseInt(urlParts[urlParts.length - 2]) === id;
            });
            if (!pokemon) return null;
            return {...await fetchPokemonDetails(pokemon.url), url: pokemon.url};
        })
    );
    
    displayPokemonGrid('favorites-grid', favoritePokemon.filter(p => p !== null));
}

async function initGame() {
    await fetchAllPokemon();
    await displayPokemonGrid('pokemon-grid', allPokemon);
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
}

function updateLeaderboard() {
    const usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];
    const allScores = [];
    
    usersDB.forEach(user => {
        user.scores.forEach(score => {
            allScores.push({
                username: user.username,
                pokemonId: score.pokemonId,
                pokemonName: allPokemon.find(p => {
                    const urlParts = p.url.split('/');
                    return parseInt(urlParts[urlParts.length - 2]) === score.pokemonId;
                })?.name || 'Unknown',
                score: score.score
            });
        });
    });
    
    
    allScores.sort((a, b) => b.score - a.score);
    
    const topScores = allScores.slice(0, 10);
    const scoresBody = document.getElementById('scores-body');
    scoresBody.innerHTML = '';
    
    topScores.forEach((score, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.username}</td>
            <td>${score.pokemonName}</td>
            <td>${score.score}</td>
        `;
        scoresBody.appendChild(row);
    });
}

function recordScore(pokemonId, score) {
    const user = getCurrentUser();
    if (!user) return;
    
    user.scores = user.scores || [];
    user.scores.push({
        pokemonId,
        score,
        date: new Date().toISOString()
    });
    
    updateUser(user);
    updateLeaderboard();
}

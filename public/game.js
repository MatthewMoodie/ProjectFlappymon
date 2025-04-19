// Wrap in conditional to prevent redefinition
if (typeof FlappyBirdGame === 'undefined') {
    class FlappyBirdGame {
        constructor(canvasId, pokemonId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.pokemonId = pokemonId;
            this.pokemonSprite = null;
            this.gameOver = false;
            this.score = 0;
            this.highScore = this.getHighScore();

            this.bird = {
                x: 100,
                y: this.canvas.height / 2,
                width: 40,
                height: 30,
                velocity: 0,
                gravity: 0.11,
                jumpForce: -3.7
            };

            this.pipes = [];
            this.pipeWidth = 60;
            this.pipeGap = 190;
            this.pipeFrequency = 180;
            this.frameCount = 0;

            this.ground = {
                y: this.canvas.height - 50,
                height: 50
            };

            this.loadPokemonSprite();

            this.canvas.addEventListener('click', () => this.jump());
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') this.jump();
            });
        }

        getHighScore() {
            const user = getCurrentUser();
            if (!user || !user.scores) return 0;
            
            const pokemonScores = user.scores.filter(s => s.pokemonId === this.pokemonId);
            if (pokemonScores.length === 0) return 0;
            
            return Math.max(...pokemonScores.map(s => s.score));
        }

        async loadPokemonSprite() {
            try {
                const pokemon = window.allPokemon.find(p => {
                    const urlParts = p.url.split('/');
                    return parseInt(urlParts[urlParts.length - 2]) === this.pokemonId;
                });

                if (pokemon) {
                    const details = await fetchPokemonDetails(pokemon.url);
                    this.pokemonSprite = new Image();
                    this.pokemonSprite.src = details.sprite;
                }
            } catch (error) {
                console.error("Failed to load sprite:", error);
            }
        }

        jump() {
            if (this.gameOver) return;
            this.bird.velocity = this.bird.jumpForce;
        }

        update() {
            if (this.gameOver) return;

            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;

            if (this.bird.y + this.bird.height > this.ground.y || this.bird.y < 0) {
                this.endGame();
                return;
            }

            this.frameCount++;
            if (this.frameCount % this.pipeFrequency === 0) {
                const gapPosition = Math.random() * (this.canvas.height - this.pipeGap - this.ground.height - 100) + 50;
                this.pipes.push({
                    x: this.canvas.width,
                    topHeight: gapPosition,
                    bottomY: gapPosition + this.pipeGap,
                    passed: false
                });
            }

            for (let i = this.pipes.length - 1; i >= 0; i--) {
                this.pipes[i].x -= 2;

                if (
                    this.bird.x + this.bird.width > this.pipes[i].x &&
                    this.bird.x < this.pipes[i].x + this.pipeWidth &&
                    (this.bird.y < this.pipes[i].topHeight ||
                        this.bird.y + this.bird.height > this.pipes[i].bottomY)
                ) {
                    this.endGame();
                    return;
                }

                if (!this.pipes[i].passed && this.bird.x > this.pipes[i].x + this.pipeWidth) {
                    this.pipes[i].passed = true;
                    this.score++;
                }

                if (this.pipes[i].x + this.pipeWidth < 0) {
                    this.pipes.splice(i, 1);
                }
            }
        }

        draw() {
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#4CAF50';
            for (const pipe of this.pipes) {
                this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
                this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            }

            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(0, this.ground.y, this.canvas.width, this.ground.height);

            if (this.pokemonSprite) {
                this.ctx.drawImage(
                    this.pokemonSprite,
                    this.bird.x,
                    this.bird.y,
                    this.bird.width,
                    this.bird.height
                );
            } else {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
            }

            this.ctx.fillStyle = '#000';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Score: ${this.score}`, 20, 40);
            this.ctx.fillText(`High Score: ${this.highScore}`, 20, 70);
        }

        endGame() {
            this.gameOver = true;
        
            // Update high score if current score is higher
            if (this.score > this.highScore) {
                this.highScore = this.score;
            }
        
            // Update the display
            document.getElementById('final-score').textContent = `Score: ${this.score}`;
            document.getElementById('high-score').textContent = `High Score: ${this.highScore}`;
            document.getElementById('game-over').style.display = 'block';
            
            // Save the score - make sure this line is present
            saveScore(this.pokemonId, this.score);
            
            // Immediately update the score displays
            displayUserScores();
            updateLeaderboard();
        }

        loop() {
            this.update();
            this.draw();

            if (!this.gameOver) {
                requestAnimationFrame(() => this.loop());
            }
        }
    }
    window.FlappyBirdGame = FlappyBirdGame;
}

function startFlappyBirdGame(pokemonId) {
    try {
        if (!window.allPokemon || window.allPokemon.length === 0) {
            throw new Error("Pokemon data not loaded");
        }

        if (window.currentGame) {
            window.currentGame.gameOver = true;
        }

        window.currentGame = new FlappyBirdGame('game-canvas', pokemonId);
        window.currentGame.loop();
    } catch (error) {
        console.error("Failed to start game:", error);
        alert("Game failed to start. Please try again.");
    }
}
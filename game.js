class FlappyBirdGame {
    constructor(canvasId, pokemonId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pokemonId = pokemonId;
        this.pokemonSprite = null;
        this.gameOver = false;
        this.score = 0;
        
        // Game elements
        this.bird = {
            x: 100,
            y: this.canvas.height / 2,
            width: 40,
            height: 30,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -10
        };
        
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeFrequency = 120; // frames
        this.frameCount = 0;
        
        this.ground = {
            y: this.canvas.height - 50,
            height: 50
        };
        
        // Load Pokemon sprite
        this.loadPokemonSprite();
        
        // Event listeners
        this.canvas.addEventListener('click', () => this.jump());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.jump();
        });
    }
    
    async loadPokemonSprite() {
        const pokemon = allPokemon.find(p => {
            const urlParts = p.url.split('/');
            return parseInt(urlParts[urlParts.length - 2]) === this.pokemonId;
        });
        
        if (pokemon) {
            const details = await fetchPokemonDetails(pokemon.url);
            this.pokemonSprite = new Image();
            this.pokemonSprite.src = details.sprite;
        }
    }
    
    jump() {
        if (this.gameOver) return;
        this.bird.velocity = this.bird.jumpForce;
    }
    
    update() {
        if (this.gameOver) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Check collisions with ground and ceiling
        if (this.bird.y + this.bird.height > this.ground.y || this.bird.y < 0) {
            this.endGame();
            return;
        }
        
        // Generate pipes
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
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= 2;
            
            // Check collisions
            if (
                this.bird.x + this.bird.width > this.pipes[i].x &&
                this.bird.x < this.pipes[i].x + this.pipeWidth &&
                (this.bird.y < this.pipes[i].topHeight ||
                 this.bird.y + this.bird.height > this.pipes[i].bottomY)
            ) {
                this.endGame();
                return;
            }
            
            // Score point when passing a pipe
            if (!this.pipes[i].passed && this.bird.x > this.pipes[i].x + this.pipeWidth) {
                this.pipes[i].passed = true;
                this.score++;
            }
            
            // Remove off-screen pipes
            if (this.pipes[i].x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#4CAF50';
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
        }
        
        // Draw ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.ground.y, this.canvas.width, this.ground.height);
        
        // Draw bird (Pokemon)
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
        
        // Draw score
        this.ctx.fillStyle = '#000';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
    }
    
    endGame() {
        this.gameOver = true;
        document.getElementById('final-score').textContent = `Score: ${this.score}`;
        document.getElementById('game-over').style.display = 'block';
        recordScore(this.pokemonId, this.score);
    }
    
    loop() {
        this.update();
        this.draw();
        
        if (!this.gameOver) {
            requestAnimationFrame(() => this.loop());
        }
    }
}

function startFlappyBirdGame(pokemonId) {
    const game = new FlappyBirdGame('game-canvas', pokemonId);
    game.loop();
}

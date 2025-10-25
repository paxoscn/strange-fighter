import ConfigLoader from './ConfigLoader.js';
import Character from './Character.js';
import CharacterSelectionManager from './CharacterSelectionManager.js';
import InputHandler from './InputHandler.js';
import CollisionDetector from './CollisionDetector.js';
import Renderer from './Renderer.js';

class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Game state
        this.currentState = null;
        this.STATE = {
            CHARACTER_SELECTION: 'CHARACTER_SELECTION',
            BATTLE: 'BATTLE',
            VICTORY: 'VICTORY'
        };

        // Configuration data
        this.charactersData = null;
        this.backgroundsData = null;

        // Game objects
        this.player1 = null;
        this.player2 = null;
        this.currentBackground = null;

        // Managers
        this.selectionManager = null;
        this.inputHandler = null;
        this.renderer = null;

        // Knockback state
        this.knockbackState = {
            active: false,
            timer: 0,
            duration: 0,
            player1Target: 0,
            player2Target: 0,
            player1Start: 0,
            player2Start: 0
        };

        // Hit flash effect
        this.hitFlash = {
            active: false,
            timer: 0,
            duration: 100, // milliseconds
            target: null // which player was hit
        };

        // Image cache for preloading
        this.imageCache = {};

        // Game loop
        this.lastTimestamp = 0;
        this.isRunning = false;
    }

    async init() {
        try {
            // Load configuration files
            await this.loadConfigs();

            // Preload all images
            await this.preloadAllImages();

            // Initialize managers
            this.renderer = new Renderer(this.canvas);
            this.renderer.imageCache = this.imageCache; // Share image cache with renderer
            this.inputHandler = new InputHandler();
            this.inputHandler.init();
            this.selectionManager = new CharacterSelectionManager(this.charactersData);

            // Set initial state
            this.setState(this.STATE.CHARACTER_SELECTION);

            // Set up mouse click listener for character selection
            this.canvas.addEventListener('click', (event) => this.handleCanvasClick(event));

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.renderer = new Renderer(this.canvas);
            this.renderer.clear();
            this.renderer.drawText('游戏初始化失败: ' + error.message,
                this.canvas.width / 2,
                this.canvas.height / 2,
                { font: '24px Arial', color: '#FF0000' });
            throw error;
        }
    }

    async loadConfigs() {
        // Load characters and backgrounds configuration files
        this.charactersData = await ConfigLoader.loadCharacters('./characters.json');
        this.backgroundsData = await ConfigLoader.loadBackgrounds('./backgrounds.json');
    }

    async preloadAllImages() {
        const imageUrls = new Set();

        // Collect all character image URLs
        for (const [name, charData] of Object.entries(this.charactersData)) {
            // Add avatar URL
            if (charData.url) {
                imageUrls.add(charData.url);
            }

            // Add all state animation frame URLs
            if (charData.status) {
                for (const state of charData.status) {
                    if (state.imgs) {
                        for (const img of state.imgs) {
                            if (img.left_url) imageUrls.add(img.left_url);
                            if (img.right_url) imageUrls.add(img.right_url);
                        }
                    }
                }
            }
        }

        // Collect all background image URLs
        for (const bgData of Object.values(this.backgroundsData)) {
            if (bgData.url) {
                imageUrls.add(bgData.url);
            }
        }

        // Preload all images in parallel
        const loadPromises = Array.from(imageUrls).map(url => this.preloadImage(url));
        await Promise.all(loadPromises);

        console.log(`Preloaded ${imageUrls.size} images`);
    }

    async preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache[url] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${url}`);
                // Don't reject, just resolve with null to continue loading other images
                resolve(null);
            };
            img.src = url;
        });
    }

    setState(newState) {
        this.currentState = newState;
        console.log('Game state changed to:', newState);
    }

    handleCanvasClick(event) {
        // Only handle clicks in character selection state
        if (this.currentState !== this.STATE.CHARACTER_SELECTION) {
            return;
        }

        // Get click coordinates relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Determine which player is clicking (alternate between players)
        // First click is player 1, second is player 2, etc.
        let playerId;
        if (!this.selectionManager.player1Selection) {
            playerId = 1;
        } else if (!this.selectionManager.player2Selection) {
            playerId = 2;
        } else {
            // Both selected, allow either to change
            // Use a simple heuristic: left half = player 1, right half = player 2
            playerId = x < this.canvas.width / 2 ? 1 : 2;
        }

        // Handle the click
        this.selectionManager.handleClick(x, y, playerId, this.canvas.width);
    }

    startBattle() {
        // Get selected characters
        const selections = this.selectionManager.getSelectedCharacters();
        if (!selections) {
            console.error('Cannot start battle: selections not complete');
            return;
        }

        // Randomly select a background
        const backgroundNames = Object.keys(this.backgroundsData);
        const randomIndex = Math.floor(Math.random() * backgroundNames.length);
        const selectedBgName = backgroundNames[randomIndex];
        const selectedBgData = this.backgroundsData[selectedBgName];

        // Create background object with preloaded image
        this.currentBackground = {
            name: selectedBgName,
            image: this.imageCache[selectedBgData.url]
        };

        // Create Character instances
        const player1Data = {
            name: selections.player1.name,
            ...selections.player1.data
        };
        const player2Data = {
            name: selections.player2.name,
            ...selections.player2.data
        };

        this.player1 = new Character(player1Data, 1, true, this.canvas.width, this.canvas.height);
        this.player2 = new Character(player2Data, 2, false, this.canvas.width, this.canvas.height);

        // Switch to battle state
        this.setState(this.STATE.BATTLE);

        console.log('Battle started:', selections.player1.name, 'vs', selections.player2.name);
    }

    updateBattle(deltaTime) {
        // Don't process input during knockback
        if (!this.knockbackState.active) {
            // Get player actions from input handler
            const player1States = this.player1 ? Object.values(this.player1.states) : [];
            const player2States = this.player2 ? Object.values(this.player2.states) : [];

            const player1Actions = this.inputHandler.getPlayerActions('player1', player1States);
            const player2Actions = this.inputHandler.getPlayerActions('player2', player2States);

            // Process player 1 actions
            if (player1Actions.specialAttack) {
                // Trigger special attack with key sequence
                const keySequence = player1Actions.specialAttack.keys;
                this.player1.attack(keySequence);
            } else {
                if (player1Actions.moveLeft) {
                    this.player1.moveLeft();
                }
                if (player1Actions.moveRight) {
                    this.player1.moveRight();
                }
                if (player1Actions.attack) {
                    this.player1.attack();
                }
            }

            // Process player 2 actions
            if (player2Actions.specialAttack) {
                // Trigger special attack with key sequence
                const keySequence = player2Actions.specialAttack.keys;
                this.player2.attack(keySequence);
            } else {
                if (player2Actions.moveLeft) {
                    this.player2.moveLeft();
                }
                if (player2Actions.moveRight) {
                    this.player2.moveRight();
                }
                if (player2Actions.attack) {
                    this.player2.attack();
                }
            }
        }

        // Update both characters
        this.player1.update(deltaTime);
        this.player2.update(deltaTime);

        // Check for collisions (only if not in knockback)
        if (!this.knockbackState.active) {
            // Check if player 1 hits player 2
            if (CollisionDetector.checkAttackHit(this.player1, this.player2)) {
                this.handleHit(this.player1, this.player2);
            }

            // Check if player 2 hits player 1
            if (CollisionDetector.checkAttackHit(this.player2, this.player1)) {
                this.handleHit(this.player2, this.player1);
            }
        }

        // Update knockback state
        if (this.knockbackState.active) {
            this.updateKnockback(deltaTime);
        }

        // Update hit flash effect
        if (this.hitFlash.active) {
            this.hitFlash.timer += deltaTime;
            if (this.hitFlash.timer >= this.hitFlash.duration) {
                this.hitFlash.active = false;
                this.hitFlash.target = null;
            }
        }

        // Check for revival after knocked state
        this.checkRevival();

        // Check if either player is knocked out (two times knocked down)
        if (this.player1.isKnockedOut()) {
            this.endBattle(this.player2);
        } else if (this.player2.isKnockedOut()) {
            this.endBattle(this.player1);
        }
    }

    handleHit(attacker, defender) {
        // Apply damage
        const damage = attacker.currentState.power || 10;
        defender.takeDamage(damage);

        // Activate hit flash effect
        this.hitFlash.active = true;
        this.hitFlash.timer = 0;
        this.hitFlash.target = defender;

        // Calculate and apply knockback
        const knockback = CollisionDetector.calculateKnockback(attacker, defender);

        // Set knockback state
        this.knockbackState.active = true;
        this.knockbackState.timer = 0;
        this.knockbackState.duration = knockback.duration;
        this.knockbackState.player1Start = this.player1.position.x;
        this.knockbackState.player2Start = this.player2.position.x;
        this.knockbackState.player1Target = attacker === this.player1 ? knockback.attacker : knockback.defender;
        this.knockbackState.player2Target = attacker === this.player2 ? knockback.attacker : knockback.defender;

        // Mark characters as being knocked back
        this.player1.isKnockedBack = true;
        this.player2.isKnockedBack = true;

        console.log(`Hit! ${attacker.name} hit ${defender.name} for ${damage} damage`);
    }

    updateKnockback(deltaTime) {
        this.knockbackState.timer += deltaTime;

        // Calculate progress (0 to 1)
        let progress = Math.min(this.knockbackState.timer / this.knockbackState.duration, 1);

        // Apply easing function for smoother knockback (ease-out cubic)
        progress = 1 - Math.pow(1 - progress, 3);

        // Interpolate positions with easing
        this.player1.position.x = this.knockbackState.player1Start +
            (this.knockbackState.player1Target - this.knockbackState.player1Start) * progress;
        this.player2.position.x = this.knockbackState.player2Start +
            (this.knockbackState.player2Target - this.knockbackState.player2Start) * progress;

        // Check if knockback is complete
        if (this.knockbackState.timer >= this.knockbackState.duration) {
            this.knockbackState.active = false;
            this.player1.isKnockedBack = false;
            this.player2.isKnockedBack = false;

            // Return both characters to normal state if they're in attacked state
            if (this.player1.currentState.type === 'attacked') {
                this.player1.changeState('normal');
            }
            if (this.player2.currentState.type === 'attacked') {
                this.player2.changeState('normal');
            }
        }
    }

    checkRevival() {
        // Check if player 1 needs revival (first knockdown only)
        if (this.player1.currentState.type === 'knocked' &&
            this.player1.knockdownCount === 1 &&
            this.player1.currentHealthPoint === 0) {
            // Wait a brief moment before reviving
            if (this.player1.stateTimer > 2000) { // 2 seconds delay
                this.player1.revive();
                console.log(`${this.player1.name} revived!`);
            }
        }

        // Check if player 2 needs revival (first knockdown only)
        if (this.player2.currentState.type === 'knocked' &&
            this.player2.knockdownCount === 1 &&
            this.player2.currentHealthPoint === 0) {
            // Wait a brief moment before reviving
            if (this.player2.stateTimer > 2000) { // 2 seconds delay
                this.player2.revive();
                console.log(`${this.player2.name} revived!`);
            }
        }
    }

    endBattle(winner) {
        this.winner = winner;
        this.setState(this.STATE.VICTORY);
        console.log(`Battle ended! Winner: ${winner.name}`);
    }

    resetGame() {
        // Reset selection manager
        this.selectionManager.reset();

        // Clear players
        this.player1 = null;
        this.player2 = null;
        this.winner = null;
        this.currentBackground = null;

        // Reset knockback state
        this.knockbackState = {
            active: false,
            timer: 0,
            duration: 0,
            player1Target: 0,
            player2Target: 0,
            player1Start: 0,
            player2Start: 0
        };

        // Reset hit flash state
        this.hitFlash = {
            active: false,
            timer: 0,
            duration: 100,
            target: null
        };

        // Return to character selection
        this.setState(this.STATE.CHARACTER_SELECTION);

        console.log('Game reset');
    }

    update(deltaTime) {
        // Update input handler
        this.inputHandler.update(deltaTime);

        // Update based on current state
        switch (this.currentState) {
            case this.STATE.CHARACTER_SELECTION:
                // Check if spacebar is pressed and both players have selected
                if (this.inputHandler.isKeyPressed(' ') &&
                    this.selectionManager.isSelectionComplete()) {
                    this.startBattle();
                }
                break;

            case this.STATE.BATTLE:
                this.updateBattle(deltaTime);
                break;

            case this.STATE.VICTORY:
                // Check if spacebar is pressed to restart
                if (this.inputHandler.isKeyPressed(' ')) {
                    this.resetGame();
                }
                break;
        }
    }

    render() {
        // Clear canvas
        this.renderer.clear();

        // Render based on current state
        switch (this.currentState) {
            case this.STATE.CHARACTER_SELECTION:
                this.renderCharacterSelection();
                break;

            case this.STATE.BATTLE:
                this.renderBattle();
                break;

            case this.STATE.VICTORY:
                this.renderVictory();
                break;
        }
    }

    renderCharacterSelection() {
        // Draw character selection screen
        this.renderer.drawCharacterSelection(this.charactersData, {
            player1Selection: this.selectionManager.player1Selection,
            player2Selection: this.selectionManager.player2Selection
        });
    }

    renderBattle() {
        // Draw background
        this.renderer.drawBackground(this.currentBackground);

        // Draw characters with opponent position for correct facing direction
        this.renderer.drawCharacter(
            this.player1,
            this.hitFlash.active && this.hitFlash.target === this.player1,
            this.player2.position.x
        );
        this.renderer.drawCharacter(
            this.player2,
            this.hitFlash.active && this.hitFlash.target === this.player2,
            this.player1.position.x
        );

        // Draw health bars
        this.renderer.drawHealthBar(this.player1, 'left');
        this.renderer.drawHealthBar(this.player2, 'right');
    }

    renderVictory() {
        // Draw the final battle scene in background
        this.renderBattle();

        // Draw victory screen overlay
        this.renderer.drawVictoryScreen(this.winner.name);
    }

    startGameLoop() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.lastTimestamp = performance.now();

        const gameLoop = (timestamp) => {
            if (!this.isRunning) {
                return;
            }

            // Calculate delta time in milliseconds
            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;

            // Update and render
            this.update(deltaTime);
            this.render();

            // Continue loop
            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
        console.log('Game loop started');
    }

    stopGameLoop() {
        this.isRunning = false;
        console.log('Game loop stopped');
    }
}

export default GameManager;

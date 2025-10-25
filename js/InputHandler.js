class InputHandler {
    constructor() {
        this.keysPressed = new Set();
        this.keySequences = {
            player1: [],
            player2: []
        };
        this.sequenceTimer = {
            player1: 0,
            player2: 0
        };
        
        this.KEY_MAPPING = {
            player1: {
                moveLeft: 'a',
                moveRight: 's',
                attack: 'd'
            },
            player2: {
                moveLeft: 'k',
                moveRight: 'l',
                attack: 'j'
            },
            global: {
                start: ' '
            }
        };
    }

    init() {
        // Set up event listeners for keyboard input
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        // Prevent default behavior for game keys
        if (this.isGameKey(key)) {
            event.preventDefault();
        }
        
        // Add key to pressed set
        if (!this.keysPressed.has(key)) {
            this.keysPressed.add(key);
            
            // Add to key sequence for combo detection
            this.addToSequence(key);
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        
        // Remove key from pressed set
        this.keysPressed.delete(key);
    }
    
    isGameKey(key) {
        // Check if key is used in the game
        const p1Keys = Object.values(this.KEY_MAPPING.player1);
        const p2Keys = Object.values(this.KEY_MAPPING.player2);
        const globalKeys = Object.values(this.KEY_MAPPING.global);
        
        return p1Keys.includes(key) || p2Keys.includes(key) || globalKeys.includes(key);
    }
    
    addToSequence(key) {
        // Add key to player 1 sequence if it's a player 1 key
        if (Object.values(this.KEY_MAPPING.player1).includes(key)) {
            this.keySequences.player1.push(key);
            this.sequenceTimer.player1 = 0;
        }
        
        // Add key to player 2 sequence if it's a player 2 key
        if (Object.values(this.KEY_MAPPING.player2).includes(key)) {
            this.keySequences.player2.push(key);
            this.sequenceTimer.player2 = 0;
        }
    }

    update(deltaTime) {
        // Update sequence timers and clear old sequences
        for (const playerId of ['player1', 'player2']) {
            this.sequenceTimer[playerId] += deltaTime;
            
            // Clear sequence if more than 500ms have passed
            if (this.sequenceTimer[playerId] > 500) {
                this.keySequences[playerId] = [];
                this.sequenceTimer[playerId] = 0;
            }
        }
    }

    checkKeySequence(playerId, targetSequence) {
        const sequence = this.keySequences[playerId];
        const timer = this.sequenceTimer[playerId];
        
        // If timer expired, sequence is invalid
        if (timer > 500) {
            return false;
        }
        
        // Normalize the sequence to relative directions
        const normalizedSequence = this.normalizeSequence(sequence, playerId);
        
        // Check if normalized sequence matches target
        return this.matchSequence(normalizedSequence, targetSequence);
    }

    normalizeSequence(sequence, playerId) {
        // Convert absolute movement keys to relative directions (B=backward, F=forward)
        const normalized = [];
        const mapping = this.KEY_MAPPING[playerId];
        
        for (const key of sequence) {
            if (key === mapping.moveLeft) {
                // Player 1 is on left side, so left is backward (B)
                // Player 2 is on right side, so left is forward (F)
                normalized.push(playerId === 'player1' ? 'B' : 'F');
            } else if (key === mapping.moveRight) {
                // Player 1 is on left side, so right is forward (F)
                // Player 2 is on right side, so right is backward (B)
                normalized.push(playerId === 'player1' ? 'F' : 'B');
            } else if (key === mapping.attack) {
                normalized.push('A');
            } else {
                // Keep other keys as-is
                normalized.push(key.toUpperCase());
            }
        }
        
        return normalized;
    }
    
    matchSequence(sequence, targetSequence) {
        // Check if the sequence ends with the target sequence
        if (sequence.length < targetSequence.length) {
            return false;
        }
        
        const startIndex = sequence.length - targetSequence.length;
        for (let i = 0; i < targetSequence.length; i++) {
            if (sequence[startIndex + i] !== targetSequence[i]) {
                return false;
            }
        }
        
        return true;
    }

    getPlayerActions(playerId, characterStates) {
        // Returns an object with the player's current actions
        const actions = {
            moveLeft: false,
            moveRight: false,
            attack: false,
            specialAttack: null  // Will contain the matching state if a special move is detected
        };
        
        const mapping = this.KEY_MAPPING[playerId];
        
        // Check for special attacks first (combo moves)
        if (characterStates && characterStates.length > 0) {
            for (const state of characterStates) {
                // Skip non-attacking states or states without key sequences
                if (state.type !== 'attacking' || !state.keys || state.keys.length === 0) {
                    continue;
                }
                
                // Check if the key sequence matches this special move
                if (this.checkKeySequence(playerId, state.keys)) {
                    actions.specialAttack = state;
                    // Clear the sequence after successful match
                    this.keySequences[playerId] = [];
                    return actions;
                }
            }
        }
        
        // Check basic actions
        if (this.keysPressed.has(mapping.moveLeft)) {
            actions.moveLeft = true;
        }
        
        if (this.keysPressed.has(mapping.moveRight)) {
            actions.moveRight = true;
        }
        
        if (this.keysPressed.has(mapping.attack)) {
            actions.attack = true;
        }
        
        return actions;
    }

    isKeyPressed(key) {
        return this.keysPressed.has(key);
    }
}

export default InputHandler;

import CharacterState from './CharacterState.js';

class Character {
    constructor(characterData, playerId, isLeftSide, canvasWidth, canvasHeight) {
        this.name = characterData.name || 'Unknown';
        this.maxHealthPoint = characterData.point;
        this.currentHealthPoint = characterData.point;
        this.knockdownCount = 0;
        this.playerId = playerId;
        this.isLeftSide = isLeftSide;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Position initialization
        this.position = {
            x: isLeftSide ? 100 : canvasWidth - 100,
            y: canvasHeight - 200
        };
        
        // State management
        this.states = {};
        this.currentState = null;
        this.stateTimer = 0;
        this.animationTimer = 0;
        
        // Knockback management
        this.isKnockedBack = false;
        this.knockbackTarget = null;
        
        // Load all states from character data
        for (const stateData of characterData.status) {
            const state = new CharacterState(stateData);
            this.states[state.type] = state;
            
            // Also store attacking states by their key sequence
            if (state.type === 'attacking' && state.keys.length > 0) {
                const keyString = state.keys.join(',');
                this.states[keyString] = state;
            }
        }
        
        // Set initial state to normal
        if (this.states.normal) {
            this.currentState = this.states.normal;
        } else {
            throw new Error(`Character ${this.name} must have a normal state`);
        }
    }

    update(deltaTime) {
        // Update state timer
        this.stateTimer += deltaTime;
        
        // Update animation timer
        this.animationTimer += deltaTime;
        
        // Check for state auto-recovery
        if (this.currentState.type === 'attacking' || this.currentState.type === 'attacked') {
            if (this.currentState.isAnimationComplete(this.animationTimer)) {
                this.changeState('normal');
            }
        }
    }

    changeState(stateName) {
        // Find the state by name or type
        let newState = this.states[stateName];
        
        if (!newState) {
            console.warn(`State ${stateName} not found for character ${this.name}`);
            return;
        }
        
        // Change to new state
        this.currentState = newState;
        this.stateTimer = 0;
        this.animationTimer = 0;
    }

    moveLeft() {
        // Disable movement during knocked state or knockback
        if (this.currentState.type === 'knocked' || this.isKnockedBack) {
            return;
        }
        
        const moveSpeed = 5;
        this.position.x -= moveSpeed;
        
        // Boundary check - prevent moving off left edge
        if (this.position.x < 0) {
            this.position.x = 0;
        }
    }

    moveRight() {
        // Disable movement during knocked state or knockback
        if (this.currentState.type === 'knocked' || this.isKnockedBack) {
            return;
        }
        
        const moveSpeed = 5;
        this.position.x += moveSpeed;
        
        // Boundary check - prevent moving off right edge
        if (this.position.x > this.canvasWidth) {
            this.position.x = this.canvasWidth;
        }
    }

    attack(keySequence = null) {
        // Disable attack during knocked state or knockback
        if (this.currentState.type === 'knocked' || this.isKnockedBack) {
            return;
        }
        
        // If a key sequence is provided, try to find matching special attack
        if (keySequence) {
            const keyString = keySequence.join(',');
            const specialState = this.states[keyString];
            if (specialState && specialState.type === 'attacking') {
                this.changeState(keyString);
                return;
            }
        }
        
        // Default to basic attacking state
        if (this.states.attacking) {
            this.changeState('attacking');
        }
    }

    takeDamage(damage) {
        // Reduce health
        this.currentHealthPoint -= damage;
        
        // Check if health dropped to zero or below
        if (this.currentHealthPoint <= 0) {
            this.currentHealthPoint = 0;
            this.knockdownCount++;
            this.changeState('knocked');
        } else {
            // Change to attacked state
            this.changeState('attacked');
        }
    }

    getHitBox() {
        if (!this.currentState.hitBox) {
            return null;
        }
        
        const hitBox = this.currentState.hitBox;
        
        // Return absolute coordinates based on character position and facing direction
        return {
            x: this.position.x + (this.isLeftSide ? hitBox.x : -hitBox.x - hitBox.w),
            y: this.position.y + hitBox.y,
            w: hitBox.w,
            h: hitBox.h
        };
    }

    getAttackBox() {
        if (!this.currentState.attackBox) {
            return null;
        }
        
        const attackBox = this.currentState.attackBox;
        
        // Return absolute coordinates based on character position and facing direction
        return {
            x: this.position.x + (this.isLeftSide ? attackBox.x : -attackBox.x - attackBox.w),
            y: this.position.y + attackBox.y,
            w: attackBox.w,
            h: attackBox.h
        };
    }

    getCurrentImage() {
        const frameIndex = this.currentState.getCurrentFrame(this.animationTimer);
        
        if (frameIndex === null || frameIndex >= this.currentState.images.length) {
            return null;
        }
        
        const frame = this.currentState.images[frameIndex];
        
        // Return the appropriate image URL based on character facing direction
        return this.isLeftSide ? frame.left_url : frame.right_url;
    }

    revive() {
        // Restore health to maximum
        this.currentHealthPoint = this.maxHealthPoint;
        
        // Return to normal state
        this.changeState('normal');
    }

    isKnockedOut() {
        // Character is knocked out if they've been knocked down twice
        return this.knockdownCount >= 2;
    }
}

export default Character;

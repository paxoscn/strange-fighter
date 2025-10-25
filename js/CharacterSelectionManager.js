class CharacterSelectionManager {
    constructor(characters) {
        this.availableCharacters = characters;
        this.player1Selection = null;
        this.player2Selection = null;
    }

    /**
     * Handle mouse click on character selection screen
     * @param {number} x - Click x coordinate
     * @param {number} y - Click y coordinate
     * @param {number} playerId - Player ID (1 or 2)
     * @param {number} canvasWidth - Canvas width for layout calculation
     */
    handleClick(x, y, playerId, canvasWidth) {
        const characterArray = Object.entries(this.availableCharacters);
        const columns = Math.min(4, characterArray.length);
        const avatarSize = 120;
        const spacing = 20;
        const startX = (canvasWidth - (columns * (avatarSize + spacing) - spacing)) / 2;
        const startY = 150;
        
        // Check which character was clicked
        for (let i = 0; i < characterArray.length; i++) {
            const [name] = characterArray[i];
            const col = i % columns;
            const row = Math.floor(i / columns);
            const charX = startX + col * (avatarSize + spacing);
            const charY = startY + row * (avatarSize + spacing);
            
            // Check if click is within this character's avatar
            if (x >= charX && x <= charX + avatarSize &&
                y >= charY && y <= charY + avatarSize) {
                
                // Handle selection based on player ID
                if (playerId === 1) {
                    // If clicking already selected character, deselect it
                    if (this.player1Selection === name) {
                        this.player1Selection = null;
                    } else {
                        this.player1Selection = name;
                    }
                } else if (playerId === 2) {
                    // If clicking already selected character, deselect it
                    if (this.player2Selection === name) {
                        this.player2Selection = null;
                    } else {
                        this.player2Selection = name;
                    }
                }
                
                return true; // Click was handled
            }
        }
        
        return false; // Click was not on any character
    }

    /**
     * Check if both players have completed their selections
     * @returns {boolean} True if both players have selected characters
     */
    isSelectionComplete() {
        return this.player1Selection !== null && this.player2Selection !== null;
    }

    /**
     * Get the selected character data for both players
     * @returns {Object} Object containing player1 and player2 character data
     */
    getSelectedCharacters() {
        if (!this.isSelectionComplete()) {
            return null;
        }
        
        return {
            player1: {
                name: this.player1Selection,
                data: this.availableCharacters[this.player1Selection]
            },
            player2: {
                name: this.player2Selection,
                data: this.availableCharacters[this.player2Selection]
            }
        };
    }

    /**
     * Reset all selections to initial state
     */
    reset() {
        this.player1Selection = null;
        this.player2Selection = null;
    }
}

export default CharacterSelectionManager;

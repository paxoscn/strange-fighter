import GameManager from './GameManager.js';

// Entry point
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('gameCanvas');
    const gameManager = new GameManager(canvas);
    
    try {
        await gameManager.init();
        // Start the game loop after successful initialization
        gameManager.startGameLoop();
    } catch (error) {
        console.error('Failed to start game:', error);
    }
});

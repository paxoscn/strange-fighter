import GameManager from './GameManager.js';

// Entry point
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('gameCanvas');
    const gameManager = new GameManager(canvas);
    
    // Expose gameManager to window for debugging
    window.gameManager = gameManager;
    
    try {
        await gameManager.init();
        // Start the game loop after successful initialization
        gameManager.startGameLoop();
        console.log('Game started successfully. Access gameManager via window.gameManager for debugging.');
    } catch (error) {
        console.error('Failed to start game:', error);
    }
});

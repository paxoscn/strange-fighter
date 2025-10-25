class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground(background) {
        if (background && background.image) {
            this.ctx.drawImage(background.image, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawCharacter(character, isFlashing = false) {
        if (!character) return;
        
        const imageUrl = character.getCurrentImage();
        if (!imageUrl) return;
        
        // Use the game manager's image cache instead of creating a new one
        // This assumes images are preloaded by GameManager
        const img = this.getImageFromCache(imageUrl);
        
        // Only draw if image is loaded
        if (img && img.complete && img.naturalWidth > 0) {
            this.ctx.save();
            
            // Apply flash effect if character was just hit
            if (isFlashing) {
                this.ctx.globalAlpha = 0.5;
                this.ctx.filter = 'brightness(2)';
            }
            
            // Calculate y position to align image bottom with canvas bottom
            const yPos = this.canvas.height - img.height;
            
            // Apply horizontal flip for right-side characters if needed
            if (!character.isLeftSide) {
                this.ctx.scale(-1, 1);
                this.ctx.drawImage(img, -character.position.x - img.width, yPos);
            } else {
                this.ctx.drawImage(img, character.position.x, yPos);
            }
            
            this.ctx.restore();
        }
    }
    
    getImageFromCache(url) {
        // Try to get from local cache first
        if (!this.imageCache) {
            this.imageCache = {};
        }
        
        if (this.imageCache[url]) {
            return this.imageCache[url];
        }
        
        // Create new image if not in cache
        const img = new Image();
        img.src = url;
        this.imageCache[url] = img;
        return img;
    }

    drawHealthBar(character, position) {
        if (!character) return;
        
        const barWidth = 200;
        const barHeight = 20;
        const x = position === 'left' ? 20 : this.canvas.width - barWidth - 20;
        const y = 20;
        
        // Draw background (empty health bar) with gradient
        const bgGradient = this.ctx.createLinearGradient(x, y, x, y + barHeight);
        bgGradient.addColorStop(0, '#1a1a1a');
        bgGradient.addColorStop(1, '#333333');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw current health with gradient
        const healthPercentage = Math.max(0, character.currentHealthPoint / character.maxHealthPoint);
        const currentBarWidth = barWidth * healthPercentage;
        
        if (currentBarWidth > 0) {
            const healthGradient = this.ctx.createLinearGradient(x, y, x, y + barHeight);
            
            // Color based on health percentage with smooth gradients
            if (healthPercentage > 0.5) {
                healthGradient.addColorStop(0, '#00FF00'); // Bright green
                healthGradient.addColorStop(1, '#00CC00'); // Dark green
            } else if (healthPercentage > 0.25) {
                healthGradient.addColorStop(0, '#FFFF00'); // Bright yellow
                healthGradient.addColorStop(1, '#CCCC00'); // Dark yellow
            } else {
                healthGradient.addColorStop(0, '#FF0000'); // Bright red
                healthGradient.addColorStop(1, '#CC0000'); // Dark red
            }
            
            this.ctx.fillStyle = healthGradient;
            this.ctx.fillRect(x, y, currentBarWidth, barHeight);
        }
        
        // Draw border with glow effect
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Draw health text with shadow
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        const healthText = `${Math.max(0, character.currentHealthPoint)} / ${character.maxHealthPoint}`;
        this.drawText(healthText, x + barWidth / 2, y + barHeight + 15, {
            font: 'bold 16px Arial',
            color: '#FFFFFF',
            align: 'center',
            baseline: 'top'
        });
        
        // Draw character name with shadow
        this.drawText(character.name, x + barWidth / 2, y - 10, {
            font: 'bold 18px Arial',
            color: '#FFFFFF',
            align: 'center',
            baseline: 'bottom'
        });
        
        // Draw knockdown indicator (lives remaining)
        const livesRemaining = 2 - character.knockdownCount;
        const lifeIconSize = 12;
        const lifeIconSpacing = 5;
        const lifeIconStartX = x + barWidth / 2 - (livesRemaining * (lifeIconSize + lifeIconSpacing)) / 2;
        
        for (let i = 0; i < livesRemaining; i++) {
            const iconX = lifeIconStartX + i * (lifeIconSize + lifeIconSpacing);
            const iconY = y + barHeight + 35;
            
            // Draw heart icon
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(iconX, iconY, lifeIconSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    drawCharacterSelection(characters, selections) {
        if (!characters) return;
        
        // Draw title
        this.drawText('选择你的角色', this.canvas.width / 2, 50, {
            font: '36px Arial',
            color: '#FFFFFF',
            align: 'center',
            baseline: 'middle'
        });
        
        // Draw instruction
        this.drawText('双方选择完成后按空格键开始游戏', this.canvas.width / 2, 100, {
            font: '20px Arial',
            color: '#CCCCCC',
            align: 'center',
            baseline: 'middle'
        });
        
        // Draw character avatars in a grid
        const characterArray = Object.entries(characters);
        const columns = Math.min(4, characterArray.length);
        const avatarSize = 120;
        const spacing = 20;
        const startX = (this.canvas.width - (columns * (avatarSize + spacing) - spacing)) / 2;
        const startY = 150;
        
        characterArray.forEach(([name, charData], index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = startX + col * (avatarSize + spacing);
            const y = startY + row * (avatarSize + spacing);
            
            // Draw avatar background
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(x, y, avatarSize, avatarSize);
            
            // Draw selection highlight
            if (selections.player1Selection === name) {
                this.ctx.strokeStyle = '#00FF00';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(x - 2, y - 2, avatarSize + 4, avatarSize + 4);
                
                // Draw "P1" label
                this.drawText('P1', x + avatarSize / 2, y - 15, {
                    font: '20px Arial',
                    color: '#00FF00',
                    align: 'center',
                    baseline: 'bottom'
                });
            }
            
            if (selections.player2Selection === name) {
                this.ctx.strokeStyle = '#0000FF';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(x - 2, y - 2, avatarSize + 4, avatarSize + 4);
                
                // Draw "P2" label
                this.drawText('P2', x + avatarSize / 2, y - 15, {
                    font: '20px Arial',
                    color: '#0000FF',
                    align: 'center',
                    baseline: 'bottom'
                });
            }
            
            // Draw avatar image if available
            if (charData.url) {
                if (!this.imageCache) {
                    this.imageCache = {};
                }
                
                let img = this.imageCache[charData.url];
                if (!img) {
                    img = new Image();
                    img.src = charData.url;
                    this.imageCache[charData.url] = img;
                }
                
                if (img.complete && img.naturalWidth > 0) {
                    this.ctx.drawImage(img, x, y, avatarSize, avatarSize);
                }
            }
            
            // Draw character name
            this.drawText(name, x + avatarSize / 2, y + avatarSize + 15, {
                font: '16px Arial',
                color: '#FFFFFF',
                align: 'center',
                baseline: 'top'
            });
        });
    }

    drawVictoryScreen(winnerName) {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw victory message
        this.drawText('胜利!', this.canvas.width / 2, this.canvas.height / 2 - 50, {
            font: '72px Arial',
            color: '#FFD700',
            align: 'center',
            baseline: 'middle'
        });
        
        // Draw winner name
        this.drawText(`${winnerName} 获胜!`, this.canvas.width / 2, this.canvas.height / 2 + 30, {
            font: '36px Arial',
            color: '#FFFFFF',
            align: 'center',
            baseline: 'middle'
        });
        
        // Draw restart instruction
        this.drawText('按空格键返回角色选择', this.canvas.width / 2, this.canvas.height / 2 + 100, {
            font: '24px Arial',
            color: '#CCCCCC',
            align: 'center',
            baseline: 'middle'
        });
    }

    drawText(text, x, y, options = {}) {
        const {
            font = '24px Arial',
            color = '#FFFFFF',
            align = 'center',
            baseline = 'middle'
        } = options;

        this.ctx.save();
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
}

export default Renderer;

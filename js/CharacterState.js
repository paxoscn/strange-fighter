class CharacterState {
    constructor(stateData) {
        this.keys = stateData.keys || [];
        this.images = stateData.imgs || [];
        this.hitBox = stateData.block || null;
        this.headInfo = stateData.head || null; // 头像位置信息
        this.type = stateData.type || 'normal';
        this.power = stateData.power || 0;
        this.attackBox = stateData.attack || null;
        this.duration = stateData.duration || 0;
    }

    getCurrentFrame(timer) {
        if (this.images.length === 0) {
            return null;
        }

        let accumulatedTime = 0;
        for (let i = 0; i < this.images.length; i++) {
            accumulatedTime += this.images[i].duration;
            if (timer < accumulatedTime) {
                return i;
            }
        }

        // If timer exceeds total duration, return last frame
        return this.images.length - 1;
    }

    isAnimationComplete(timer) {
        if (this.images.length === 0) {
            return true;
        }

        const totalDuration = this.getTotalDuration();
        return timer >= totalDuration;
    }

    getTotalDuration() {
        return this.images.reduce((total, img) => total + img.duration, 0);
    }
}

export default CharacterState;

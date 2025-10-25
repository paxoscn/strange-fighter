class CollisionDetector {
    /**
     * Check if two rectangular boxes overlap
     * @param {Object} box1 - First box with properties {x, y, w, h}
     * @param {Object} box2 - Second box with properties {x, y, w, h}
     * @returns {boolean} - True if boxes overlap, false otherwise
     */
    static checkCollision(box1, box2) {
        if (!box1 || !box2) {
            return false;
        }

        // Check if boxes do NOT overlap (using AABB collision detection)
        // If any of these conditions is true, boxes don't overlap
        const noOverlap = (
            box1.x + box1.w < box2.x ||  // box1 is to the left of box2
            box1.x > box2.x + box2.w ||  // box1 is to the right of box2
            box1.y + box1.h < box2.y ||  // box1 is above box2
            box1.y > box2.y + box2.h     // box1 is below box2
        );

        // Return the opposite - if they don't NOT overlap, they DO overlap
        return !noOverlap;
    }

    /**
     * Check if an attacker's attack box hits a defender's hit box
     * @param {Character} attacker - The attacking character
     * @param {Character} defender - The defending character
     * @returns {boolean} - True if attack hits, false otherwise
     */
    static checkAttackHit(attacker, defender) {
        // Only check collision if attacker is in attacking state
        if (attacker.currentState.type !== 'attacking') {
            return false;
        }

        // Get attack box from attacker
        const attackBox = attacker.getAttackBox();
        if (!attackBox) {
            return false;
        }

        // Get hit box from defender
        const hitBox = defender.getHitBox();
        if (!hitBox) {
            return false;
        }

        // Check if boxes overlap
        return this.checkCollision(attackBox, hitBox);
    }

    /**
     * Calculate knockback effect for both characters after a hit
     * @param {Character} attacker - The attacking character
     * @param {Character} defender - The defending character
     * @returns {Object} - Object containing duration and target positions for both characters
     */
    static calculateKnockback(attacker, defender) {
        // Adjusted for better gameplay feel
        const attackerKnockback = 30; // Attacker pushed back less
        const defenderKnockback = 70; // Defender pushed back more
        const knockbackDuration = 250; // Slightly faster for smoother gameplay

        let attackerTargetX;
        let defenderTargetX;

        // Determine knockback direction based on relative positions
        if (attacker.position.x < defender.position.x) {
            // Attacker is on the left, push both apart
            attackerTargetX = attacker.position.x - attackerKnockback;
            defenderTargetX = defender.position.x + defenderKnockback;
        } else {
            // Attacker is on the right, push both apart
            attackerTargetX = attacker.position.x + attackerKnockback;
            defenderTargetX = defender.position.x - defenderKnockback;
        }

        // Apply boundary constraints
        attackerTargetX = Math.max(0, Math.min(attackerTargetX, attacker.canvasWidth));
        defenderTargetX = Math.max(0, Math.min(defenderTargetX, defender.canvasWidth));

        return {
            duration: knockbackDuration,
            attacker: attackerTargetX,
            defender: defenderTargetX
        };
    }
}

export default CollisionDetector;

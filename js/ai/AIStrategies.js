// AI Strategies for different difficulty levels
const AIStrategies = {
    // Helper functions for color priorities
    _colorValues: {
        BLACK: 0,
        RED: 1,
        ORANGE: 2,
        YELLOW: 3,
        GREEN: 4,
        BLUE: 5,
        PURPLE: 6,
        WHITE: 7
    },
    
    _getColorName: function(colorValue) {
        const colors = ['BLACK', 'RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'WHITE'];
        return colors[colorValue] || 'UNKNOWN';
    },
    
    _getColorValue: function(colorName) {
        return this._colorValues[colorName.toUpperCase()] || 0;
    },
    
    _canDoLethalDamage: function(card, playerLife) {
        // Check if this card can do lethal damage in a direct attack
        return card.color.value >= playerLife;
    },
    
    _getColorPriority: function(opponentColor) {
        // Define color priority based on opponent's color
        // Returns array of colors in order of priority (high to low)
        const colorName = typeof opponentColor === 'string' ? 
            opponentColor : this._getColorName(opponentColor);
            
        switch(colorName.toUpperCase()) {
            case 'RED':
                return ['GREEN', 'YELLOW', 'BLUE', 'PURPLE', 'ORANGE', 'RED'];
            case 'ORANGE':
                return ['GREEN', 'BLUE', 'PURPLE', 'YELLOW', 'ORANGE', 'RED'];
            case 'YELLOW':
                return ['PURPLE', 'GREEN', 'RED', 'ORANGE', 'BLUE', 'YELLOW'];
            case 'GREEN':
                return ['RED', 'YELLOW', 'ORANGE', 'BLUE', 'PURPLE', 'GREEN'];
            case 'BLUE':
                return ['YELLOW', 'ORANGE', 'RED', 'GREEN', 'BLUE', 'PURPLE'];
            case 'PURPLE':
                return ['YELLOW', 'GREEN', 'ORANGE', 'RED', 'BLUE', 'PURPLE'];
            default:
                return ['GREEN', 'YELLOW', 'ORANGE', 'BLUE', 'RED', 'PURPLE'];
        }
    },
    
    _getNoChampionPriority: function(isFirstTurn, aiLife) {
        if (isFirstTurn) {
            // Prioritize inner ring on first turn (GREEN and YELLOW)
            return ['GREEN', 'YELLOW', 'BLUE', 'ORANGE', 'PURPLE', 'RED'];
        } else if (aiLife >= 6) {
            // Prioritize maximum damage if AI has enough life
            return ['RED', 'PURPLE', 'ORANGE', 'BLUE', 'GREEN', 'YELLOW'];
        } else {
            // Prioritize safe damage (inner ring) if AI is low on life
            return ['GREEN', 'YELLOW', 'BLUE', 'ORANGE', 'PURPLE', 'RED'];
        }
    },
    
    _prioritizeCards: function(aiHand, priorityOrder) {
        // Convert priority order to score map (higher score = higher priority)
        const priorityScores = {};
        priorityOrder.forEach((color, index) => {
            // Reverse the index so higher priority has higher score
            priorityScores[color] = priorityOrder.length - index;
        });
        
        // Score each card based on priority
        return aiHand.map((card, index) => {
            const cardColorName = card.color.name.toUpperCase();
            const priorityScore = priorityScores[cardColorName] || 0;
            
            return {
                index,
                card,
                priorityScore
            };
        }).sort((a, b) => {
            // Sort by priority score (high to low)
            return b.priorityScore - a.priorityScore;
        });
    },
    
    _duplicateColorExists: function(aiHand, colorName) {
        // Check if there are multiple cards of the same color
        const count = aiHand.filter(card => 
            card.color.name.toUpperCase() === colorName.toUpperCase()).length;
        return count > 1;
    },
    
    // Easy AI - Plays random cards and always attacks
    Easy: {
        selectCardToPlay: function(aiHand, playerChampionZone, aiChampionZone, playerLife, aiLife, isFirstTurn) {
            // Always play a random card if possible
            if (aiHand.length > 0) {
                // Check for lethal damage first (even Easy AI is smart enough for this)
                for (let i = 0; i < aiHand.length; i++) {
                    if (AIStrategies._canDoLethalDamage(aiHand[i], playerLife)) {
                        console.log('[AI-Easy] Found lethal damage card');
                        return i;
                    }
                }
                
                const randomIndex = Math.floor(Math.random() * aiHand.length);
                return randomIndex;
            }
            return -1; // No card to play
        },
        
        shouldAttack: function(aiChampion, playerChampion) {
            // Always attack if able
            return true;
        }
    },
    
    // Intermediate AI - Smarter decisions based on color matchups
    Intermediate: {
        selectCardToPlay: function(aiHand, playerChampionZone, aiChampionZone, playerLife, aiLife, isFirstTurn) {
            // Check for lethal damage first (regardless of whether we already have a champion)
            for (let i = 0; i < aiHand.length; i++) {
                if (AIStrategies._canDoLethalDamage(aiHand[i], playerLife)) {
                    console.log('[AI-Intermediate] Found lethal damage card');
                    return i;
                }
            }
            
            // Check if we should replace our current champion (same color replacement rule)
            if (aiChampionZone.length > 0 && playerChampionZone.length > 0) {
                const currentChampion = aiChampionZone[aiChampionZone.length - 1];
                const playerChampion = playerChampionZone[playerChampionZone.length - 1];
                
                // If current champion is the same color as player's champion
                if (currentChampion.color.name.toUpperCase() === playerChampion.color.name.toUpperCase()) {
                    console.log('[AI-Intermediate] Current champion same color as player, checking for better card');
                    
                    // Check if we have any card that could beat the player's champion
                    for (let i = 0; i < aiHand.length; i++) {
                        const card = aiHand[i];
                        // If this card has higher color value, it can beat the opponent
                        if (card.color.value > playerChampion.color.value) {
                            console.log('[AI-Intermediate] Found better card to replace same-color champion');
                            return i;
                        }
                    }
                }
            }
            
            // Only play a card if there's no champion or the champion was defeated
            if (aiChampionZone.length === 0) {
                // If player has a champion, try to play a card that counters it
                if (playerChampionZone.length > 0) {
                    const playerChampion = playerChampionZone[playerChampionZone.length - 1];
                    const playerColorName = playerChampion.color.name;
                    
                    // Get color priority based on opponent's color
                    const priorityOrder = AIStrategies._getColorPriority(playerColorName);
                    const prioritizedCards = AIStrategies._prioritizeCards(aiHand, priorityOrder);
                    
                    console.log(`[AI-Intermediate] Color priorities against ${playerColorName}:`, priorityOrder);
                    console.log('[AI-Intermediate] Prioritized cards:', prioritizedCards.map(pc => 
                        `${pc.card.name} (${pc.card.color.name}) - Score: ${pc.priorityScore}`));
                    
                    // Return the highest priority card
                    if (prioritizedCards.length > 0) {
                        return prioritizedCards[0].index;
                    }
                } else {
                    // No player champion - use special priority
                    const noChamptionPriority = AIStrategies._getNoChampionPriority(isFirstTurn, aiLife);
                    const prioritizedCards = AIStrategies._prioritizeCards(aiHand, noChamptionPriority);
                    
                    console.log(`[AI-Intermediate] No champion priorities:`, noChamptionPriority);
                    
                    // Return highest priority card
                    if (prioritizedCards.length > 0) {
                        return prioritizedCards[0].index;
                    }
                }
                
                // Fallback to a random card if no good option found
                if (aiHand.length > 0) {
                    return Math.floor(Math.random() * aiHand.length);
                }
            }
            
            return -1; // Don't play a card
        },
        
        shouldAttack: function(aiChampion, playerChampion) {
            // Always attack if able
            return true;
        }
    },
    
    // Hard AI - More complex strategy with better decision making
    Hard: {
        selectCardToPlay: function(aiHand, playerChampionZone, aiChampionZone, playerLife, aiLife, isFirstTurn) {
            // Check for lethal damage first (regardless of whether we already have a champion)
            for (let i = 0; i < aiHand.length; i++) {
                if (AIStrategies._canDoLethalDamage(aiHand[i], playerLife)) {
                    console.log('[AI-Hard] Found lethal damage card');
                    return i;
                }
            }
            
            // Check if we should replace our current champion
            const shouldReplace = aiChampionZone.length > 0 ? 
                this._shouldReplaceChampion(
                    aiChampionZone[aiChampionZone.length - 1], 
                    playerChampionZone.length > 0 ? playerChampionZone[playerChampionZone.length - 1] : null,
                    aiHand,
                    playerLife
                ) : false;
            
            if (aiChampionZone.length === 0 || shouldReplace) {
                // If player has a champion, use advanced color priority
                if (playerChampionZone.length > 0) {
                    const playerChampion = playerChampionZone[playerChampionZone.length - 1];
                    const playerColorName = playerChampion.color.name;
                    
                    // Get color priority based on opponent's color
                    const priorityOrder = AIStrategies._getColorPriority(playerColorName);
                    
                    // Score each card based on multiple factors
                    const scoredCards = aiHand.map((card, index) => {
                        const cardColorName = card.color.name.toUpperCase();
                        
                        // Base score from priority list
                        let score = (priorityOrder.indexOf(cardColorName) !== -1) 
                            ? (priorityOrder.length - priorityOrder.indexOf(cardColorName)) * 10 
                            : 0;
                        
                        // Bonus for cards with effects
                        if (card.currentEffects && card.currentEffects.length > 0 && 
                            card.currentEffects[0] !== 'NONE') {
                            score += 15;
                        }
                        
                        // Bonus for cards that have higher color values than opponent
                        if (card.color.value > playerChampion.color.value) {
                            score += (card.color.value - playerChampion.color.value) * 8;
                        }
                        
                        // Bonus for duplicate colors (better to use a duplicate if possible)
                        if (AIStrategies._duplicateColorExists(aiHand, cardColorName)) {
                            score += 5;
                        }
                        
                        return { index, score, card };
                    });
                    
                    // Sort by score (highest first)
                    scoredCards.sort((a, b) => b.score - a.score);
                    
                    console.log(`[AI-Hard] Color priorities against ${playerColorName}:`, priorityOrder);
                    console.log('[AI-Hard] Scored cards:', scoredCards.map(sc => 
                        `${sc.card.name} (${sc.card.color.name}) - Score: ${sc.score}`));
                    
                    // Return the index of the best card
                    if (scoredCards.length > 0) {
                        return scoredCards[0].index;
                    }
                } else {
                    // No player champion - use special priority based on situation
                    const noChamptionPriority = AIStrategies._getNoChampionPriority(isFirstTurn, aiLife);
                    
                    // Score cards with additional factors
                    const scoredCards = aiHand.map((card, index) => {
                        const cardColorName = card.color.name.toUpperCase();
                        
                        // Base score from priority list
                        let score = (noChamptionPriority.indexOf(cardColorName) !== -1) 
                            ? (noChamptionPriority.length - noChamptionPriority.indexOf(cardColorName)) * 10 
                            : 0;
                        
                        // If not first turn and AI life is good, prioritize damage
                        if (!isFirstTurn && aiLife >= 6) {
                            score += card.color.value * 5; // More damage, higher score
                        }
                        
                        // If AI life is low, prioritize inner ring colors
                        if (aiLife < 6) {
                            if (cardColorName === 'GREEN' || cardColorName === 'YELLOW') {
                                score += 20; // Big bonus for inner ring when low on life
                            }
                        }
                        
                        // Bonus for cards with effects
                        if (card.currentEffects && card.currentEffects.length > 0 && 
                            card.currentEffects[0] !== 'NONE') {
                            score += 10;
                        }
                        
                        return { index, score, card };
                    });
                    
                    // Sort by score (highest first)
                    scoredCards.sort((a, b) => b.score - a.score);
                    
                    console.log(`[AI-Hard] No champion priorities:`, noChamptionPriority);
                    console.log('[AI-Hard] Scored cards:', scoredCards.map(sc => 
                        `${sc.card.name} (${sc.card.color.name}) - Score: ${sc.score}`));
                    
                    // Return highest score card
                    if (scoredCards.length > 0) {
                        return scoredCards[0].index;
                    }
                }
            }
            
            return -1; // Don't play a card
        },
        
        shouldAttack: function(aiChampion, playerChampion) {
            // Always direct attack if player has no champion
            if (!playerChampion) {
                return true;
            }
            
            // ONLY don't attack if same color on hard mode
            if (aiChampion.color.name.toUpperCase() === playerChampion.color.name.toUpperCase()) {
                console.log('[AI-Hard] Same color, choosing not to attack');
                return false;
            }
            
            // In ALL other cases, attack
            return true;
        },
        
        // Helper method to decide if current champion should be replaced
        _shouldReplaceChampion: function(currentChampion, playerChampion, aiHand, playerLife) {
            // Don't replace if hand is empty
            if (aiHand.length === 0) {
                return false;
            }
            
            // Check if we have a card that could do lethal damage
            for (let i = 0; i < aiHand.length; i++) {
                if (AIStrategies._canDoLethalDamage(aiHand[i], playerLife)) {
                    console.log('[AI-Hard] Replacing champion for lethal damage');
                    return true;
                }
            }
            
            // If player has a champion, check if we have a better match
            if (playerChampion) {
                const currentColorName = currentChampion.color.name.toUpperCase();
                const playerColorName = playerChampion.color.name.toUpperCase();
                
                // If current champion is same color as player's champion, replace it
                // if we have any card in hand that could defeat the player's champion
                if (currentColorName === playerColorName) {
                    console.log('[AI-Hard] Current champion same color as player, checking for better card');
                    
                    // Check if we have any card that could beat the player's champion
                    for (let i = 0; i < aiHand.length; i++) {
                        const card = aiHand[i];
                        // If this card has higher color value, it can beat the opponent
                        if (card.color.value > playerChampion.color.value) {
                            console.log('[AI-Hard] Found better card to replace same-color champion');
                            return true;
                        }
                    }
                }
                
                // Get color priority for this opponent
                const priorityOrder = AIStrategies._getColorPriority(playerColorName);
                
                // If current champion is in bottom 2 of priority, consider replacing
                if (priorityOrder.indexOf(currentColorName) >= priorityOrder.length - 2) {
                    // Check if we have any card with better priority
                    for (let i = 0; i < aiHand.length; i++) {
                        const cardColorName = aiHand[i].color.name.toUpperCase();
                        // If this card has higher priority than current champion
                        if (priorityOrder.indexOf(cardColorName) < priorityOrder.indexOf(currentColorName)) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        }
    },
    
    // Get the appropriate strategy based on difficulty
    getStrategy: function(difficulty) {
        switch(difficulty?.toLowerCase()) {
            case 'medium':
                return this.Intermediate;
            case 'hard':
                return this.Hard;
            case 'easy':
            default:
                return this.Easy;
        }
    }
};

// Make AIStrategies available globally
window.AIStrategies = AIStrategies; 
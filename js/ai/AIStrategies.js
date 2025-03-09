// AI Strategies for different difficulty levels
const AIStrategies = {
    // Easy AI - Plays random cards and always attacks
    Easy: {
        selectCardToPlay: function(aiHand, playerChampionZone, aiChampionZone) {
            // Always play a random card if possible
            if (aiHand.length > 0) {
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
        selectCardToPlay: function(aiHand, playerChampionZone, aiChampionZone) {
            // Only play a card if there's no champion or the champion was defeated
            if (aiChampionZone.length === 0) {
                // If player has a champion, try to play a card that counters it
                if (playerChampionZone.length > 0) {
                    const playerChampion = playerChampionZone[playerChampionZone.length - 1];
                    const playerColor = playerChampion.color.value;
                    
                    // Sort cards by their effectiveness against player's champion
                    const scoredCards = aiHand.map((card, index) => {
                        let score = 0;
                        const cardColor = card.color.value;
                        
                        // Higher score for colors that counter the player's color
                        if (cardColor > playerColor) {
                            score += 5 + (cardColor - playerColor); // More difference = better
                        } else if (cardColor === playerColor) {
                            score += 2; // Same color is okay (both will be defeated)
                        } else {
                            score += 1; // Weaker color is a last resort
                        }
                        
                        // Bonus for cards with effects
                        if (card.currentEffects && card.currentEffects.length > 0 && 
                            card.currentEffects[0] !== 'NONE') {
                            score += 2;
                        }
                        
                        return { index, score };
                    });
                    
                    // Sort by score (highest first)
                    scoredCards.sort((a, b) => b.score - a.score);
                    
                    // Return the index of the best card
                    if (scoredCards.length > 0) {
                        return scoredCards[0].index;
                    }
                } else {
                    // No player champion - play card with highest color value for direct attack
                    const bestCard = aiHand.reduce((best, card, index) => {
                        if (!best || card.color.value > aiHand[best].color.value) {
                            return index;
                        }
                        return best;
                    }, null);
                    
                    if (bestCard !== null) {
                        return bestCard;
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
        selectCardToPlay: function(aiHand, playerChampionZone, aiChampionZone) {
            // Calculate if we should replace our current champion
            const shouldReplace = aiChampionZone.length > 0 ? 
                this._shouldReplaceChampion(aiChampionZone[aiChampionZone.length - 1], 
                    playerChampionZone.length > 0 ? playerChampionZone[playerChampionZone.length - 1] : null,
                    aiHand) : false;
            
            if (aiChampionZone.length === 0 || shouldReplace) {
                // If player has a champion, try to play an optimal counter
                if (playerChampionZone.length > 0) {
                    const playerChampion = playerChampionZone[playerChampionZone.length - 1];
                    const playerColor = playerChampion.color.value;
                    
                    // Score each card based on multiple factors
                    const scoredCards = aiHand.map((card, index) => {
                        let score = 0;
                        const cardColor = card.color.value;
                        
                        // Color counter scoring
                        if (cardColor > playerColor) {
                            // Prefer optimal color difference (not too high, not too low)
                            const diff = cardColor - playerColor;
                            if (diff === 1) score += 8; // Perfect counter
                            else if (diff === 2) score += 6; // Good counter
                            else score += 4; // Overkill but still good
                        } else if (cardColor === playerColor) {
                            score += 3; // Trading champions is okay
                        } else {
                            // Unfavorable matchup, but may still be worth it for effects
                            score += 1;
                        }
                        
                        // Effects scoring
                        if (card.currentEffects && card.currentEffects.length > 0 && 
                            card.currentEffects[0] !== 'NONE') {
                            score += 3; // Having effects is valuable
                        }
                        
                        // Strategic scoring
                        if (!playerChampion && cardColor >= 4) {
                            score += 2; // High value for direct attacks
                        }
                        
                        return { index, score };
                    });
                    
                    // Sort by score (highest first)
                    scoredCards.sort((a, b) => b.score - a.score);
                    
                    // Return the index of the best card
                    if (scoredCards.length > 0) {
                        return scoredCards[0].index;
                    }
                } else {
                    // No player champion - strategic direct attack card selection
                    const scoredCards = aiHand.map((card, index) => {
                        let score = card.color.value * 2; // High color = high damage
                        
                        // Effects bonus
                        if (card.currentEffects && card.currentEffects.length > 0 && 
                            card.currentEffects[0] !== 'NONE') {
                            score += 2;
                        }
                        
                        return { index, score };
                    });
                    
                    scoredCards.sort((a, b) => b.score - a.score);
                    
                    if (scoredCards.length > 0) {
                        return scoredCards[0].index;
                    }
                }
            }
            
            return -1; // Don't play a card
        },
        
        shouldAttack: function(aiChampion, playerChampion) {
            // Don't attack if it would be disadvantageous
            if (playerChampion) {
                const aiColor = aiChampion.color.value;
                const playerColor = playerChampion.color.value;
                
                // Don't attack if player's card has higher color and difference is significant
                if (playerColor > aiColor && (playerColor - aiColor) >= 2) {
                    return false;
                }
                
                // Don't attack if colors are equal and AI has a valuable champion
                if (playerColor === aiColor && aiColor >= 5) {
                    return false;
                }
            }
            
            // Always direct attack if player has no champion
            if (!playerChampion) {
                return true;
            }
            
            // In most other cases, attack
            return true;
        },
        
        // Helper method to decide if current champion should be replaced
        _shouldReplaceChampion: function(currentChampion, playerChampion, aiHand) {
            // Don't replace if hand is empty
            if (aiHand.length === 0) {
                return false;
            }
            
            // Find the best card in hand
            const bestCardIndex = this.selectCardToPlay(aiHand, playerChampion ? [playerChampion] : [], []);
            if (bestCardIndex === -1) {
                return false;
            }
            
            const bestCard = aiHand[bestCardIndex];
            
            // Replace if current champion is at disadvantage against player champion
            if (playerChampion) {
                const currentColor = currentChampion.color.value;
                const playerColor = playerChampion.color.value;
                const bestCardColor = bestCard.color.value;
                
                // Replace if current card is weaker and new card is stronger
                if (currentColor < playerColor && bestCardColor > playerColor) {
                    return true;
                }
                
                // Replace if current card is same color but new card is stronger
                if (currentColor === playerColor && bestCardColor > playerColor) {
                    return true;
                }
            }
            
            // Replace if the new card has significantly higher color value
            if (bestCard.color.value > currentChampion.color.value + 2) {
                return true;
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
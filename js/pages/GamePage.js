const GamePage = {
    init(container) {
        console.log('Initializing Game Page');
        
        // Get game settings and player data
        const gameSettings = gameStorage.getGameSettings();
        const playerData = gameStorage.getUserData();
        const activeDeck = gameStorage.getActiveDeck();
        
        console.log('Game Settings:', gameSettings);
        
        if (!activeDeck) {
            alert('No active deck selected!');
            router.navigate(Routes.DECKS);
            return;
        }
        
        // Load AI strategies script if needed
        if (!window.AIStrategies) {
            const script = document.createElement('script');
            script.src = 'js/ai/AIStrategies.js';
            document.head.appendChild(script);
        }
        
        // Add shake animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
        
        // Initialize game state
        this.state = {
            playerLife: 15,
            aiLife: 15,
            playerHand: [],
            aiHand: [],
            playerDeck: activeDeck.cards.map(card => this.initializeCard(card)),
            aiDeck: this.generateAIDeck(),
            playerChampionZone: [],
            aiChampionZone: [],
            playerTombPile: [],
            aiTombPile: [],
            currentPhase: null,
            isPlayerTurn: Math.random() < 0.5,
            gameEnded: false,
            selectedCard: null,
            stackedEffects: [],
            firstTurn: true,
            aiDifficulty: gameSettings.aiDifficulty || 'easy'
        };
        
        // Render initial game state
        this.render(container);
        
        // Start the game
        this.startGame();
    },
    
    generateAIDeck() {
        // Generate a deck with the first 10 cards from the database
        const allCards = CardDatabase.getAllCards();
        const aiDeck = [];
        for (let i = 0; i < 10 && i < allCards.length; i++) {
            aiDeck.push(this.initializeCard(allCards[i]));
        }
        return aiDeck;
    },
    
    initializeCard(cardData) {
        // Debug log to see exact card data format
        console.log('Initializing card - Raw Data:', cardData);

        // Map of numeric values to CardColor enum
        const colorMap = [
            CardColor.BLACK,   // 0
            CardColor.RED,     // 1
            CardColor.ORANGE,  // 2
            CardColor.YELLOW,  // 3
            CardColor.GREEN,   // 4
            CardColor.BLUE,    // 5
            CardColor.PURPLE,  // 6
            CardColor.WHITE    // 7
        ];

        // Get the color value
        let colorValue;
        
        // If it's a CardColor enum value (from database)
        if (cardData.color && typeof cardData.color === 'object' && cardData.color.hasOwnProperty('value')) {
            colorValue = cardData.color.value;
        }
        // If we have baseColor
        else if (cardData.baseColor !== undefined) {
            colorValue = typeof cardData.baseColor === 'object' ? 
                cardData.baseColor.value : 
                Number(cardData.baseColor);
        }
        // If it's a direct number
        else if (typeof cardData.color === 'number' || (typeof cardData.color === 'string' && !isNaN(cardData.color))) {
            colorValue = Number(cardData.color);
        }
        // Fallback to BLACK (0)
        else {
            colorValue = 0;
        }

        // Ensure color value is within bounds
        colorValue = Math.max(0, Math.min(7, colorValue));
        
        // Get the CardColor enum object
        const color = colorMap[colorValue];

        // Ensure proper image path
        const imageNumber = cardData.imageNumber !== undefined ? cardData.imageNumber : 
                          cardData.id ? cardData.id : 
                          'default';
        
        const imagePath = imageNumber === 'default' ? 
            './images/cards/default.png' : 
            `./images/cards/${imageNumber}.png`;

        // Handle effects data
        let effects = [];
        let effectDescriptions = [];

        // Check all possible locations for effects data
        if (cardData.currentEffects && cardData.currentEffectDescriptions) {
            effects = cardData.currentEffects;
            effectDescriptions = cardData.currentEffectDescriptions;
        } else if (cardData.effects && cardData.effectDescriptions) {
            effects = cardData.effects;
            effectDescriptions = cardData.effectDescriptions;
        } else if (cardData.baseEffects && cardData.baseEffectDescriptions) {
            effects = cardData.baseEffects;
            effectDescriptions = cardData.baseEffectDescriptions;
        } else if (Array.isArray(cardData.effects)) {
            effects = cardData.effects;
            effectDescriptions = cardData.effects.map(effect => effect.description || '');
        }
        
        // Create the card data with proper effects handling
        const initializedCard = {
            ...cardData,
            id: cardData.id || GameUtils.generateUniqueId(),
            color: color,
            baseColor: color,
            name: cardData.name || 'Unknown Card',
            imagePath: imagePath,
            effects: effects,
            effectDescriptions: effectDescriptions,
            currentEffects: effects,
            currentEffectDescriptions: effectDescriptions,
            imageNumber: imageNumber
        };

        // Log the initialized card
        console.log('Card initialized with effects:', {
            name: initializedCard.name,
            effects: initializedCard.effects,
            effectDescriptions: initializedCard.effectDescriptions,
            currentEffects: initializedCard.currentEffects,
            currentEffectDescriptions: initializedCard.currentEffectDescriptions
        });

        return initializedCard;
    },
    
    startGame() {
        console.log('[Game] Starting new game');
        
        // Deep clone and log initial deck states
        console.log('[Game] Player Deck before shuffle:', this.state.playerDeck.map(card => ({
            name: card.name,
            color: {
                name: card.color.name,
                value: card.color.value,
                class: card.color.class
            },
            effects: card.effects
        })));
        
        console.log('[Game] AI Deck before shuffle:', this.state.aiDeck.map(card => ({
            name: card.name,
            color: {
                name: card.color.name,
                value: card.color.value,
                class: card.color.class
            },
            effects: card.effects
        })));
        
        // Deep clone cards before shuffling
        this.state.playerDeck = GameUtils.shuffleArray(
            this.state.playerDeck.map(card => ({
                ...card,
                color: { ...card.color },
                effects: [...card.effects],
                baseColor: card.baseColor ? { ...card.baseColor } : undefined
            }))
        );
        
        this.state.aiDeck = GameUtils.shuffleArray(
            this.state.aiDeck.map(card => ({
                ...card,
                color: { ...card.color },
                effects: [...card.effects],
                baseColor: card.baseColor ? { ...card.baseColor } : undefined
            }))
        );
        
        // Log shuffled deck states
        console.log('[Game] Player Deck after shuffle:', this.state.playerDeck.map(card => ({
            name: card.name,
            color: {
                name: card.color.name,
                value: card.color.value,
                class: card.color.class
            },
            effects: card.effects
        })));
        
        console.log('[Game] AI Deck after shuffle:', this.state.aiDeck.map(card => ({
            name: card.name,
            color: {
                name: card.color.name,
                value: card.color.value,
                class: card.color.class
            },
            effects: card.effects
        })));
        
        // Show starting player animation
        const startingPlayerName = this.state.isPlayerTurn ? 'Player' : 'AI';
        console.log(`[Game] ${startingPlayerName} starts the game`);
        
        // Create and show the starting player modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay starting-player-modal';
        modal.innerHTML = `
            <div class="modal starting-player-content">
                <div class="starting-player-header">
                    <h2>Game Start!</h2>
                </div>
                <div class="starting-player-body">
                    <div class="starting-player-avatar">
                        <img src="${this.state.isPlayerTurn ? 
                            (gameStorage.getUserData().avatar || './images/default-avatar.png') : 
                            (gameStorage.getGameSettings().aiAvatar || './images/ai/basic.jpg')}" 
                            alt="${startingPlayerName}" class="avatar">
                    </div>
                    <div class="starting-player-text">
                        <h3>${startingPlayerName} goes first!</h3>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove the modal after animation
        setTimeout(() => {
            modal.classList.add('fade-out');
            setTimeout(() => {
                modal.remove();
                // Draw starting hands after modal is removed
                this.drawStartingHands();
            }, 500);
        }, 2000);
    },
    
    async drawStartingHands() {
        console.log('[Game] Drawing starting hands');
        
        const drawCard = async (player, delay) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (player === 'player') {
                        const card = this.state.playerDeck.pop();
                        if (card) {
                            console.log(`[Player] Drew card: ${card.name} (Color: ${card.color.name}, Effects: ${card.effects.join(', ')})`);
                            const cardElement = document.createElement('div');
                            cardElement.className = 'card drawing';
                            cardElement.style.backgroundImage = `url(${card.imagePath})`;
                            document.querySelector('.player-hand').appendChild(cardElement);
                            
                            // Remove drawing class after animation
                            setTimeout(() => {
                                cardElement.classList.remove('drawing');
                                this.state.playerHand.push(card);
                                this.updateUI();
                            }, 400);
                        }
                    } else {
                        const card = this.state.aiDeck.pop();
                        if (card) {
                            console.log(`[AI] Drew card: ${card.name} (Color: ${card.color.name}, Effects: ${card.effects.join(', ')})`);
                            const cardElement = document.createElement('div');
                            cardElement.className = 'card card-back drawing';
                            document.querySelector('.ai-hand').appendChild(cardElement);
                            
                            // Remove drawing class after animation
                            setTimeout(() => {
                                cardElement.classList.remove('drawing');
                                this.state.aiHand.push(card);
                                this.updateUI();
                            }, 400);
                        }
                    }
                    resolve();
                }, delay);
            });
        };

        // Draw 3 cards alternately for each player
        for (let i = 0; i < 3; i++) {
            await drawCard('player', 400);
            await drawCard('ai', 400);
        }
        
        // Log final hands
        console.log('[Game] Final Player Hand:', this.state.playerHand.map(card => ({
            name: card.name,
            color: card.color.name,
            effects: card.effects
        })));
        
        console.log('[Game] Final AI Hand:', this.state.aiHand.map(card => ({
            name: card.name,
            color: card.color.name,
            effects: card.effects
        })));
        
        // Start first turn after all cards are drawn
        setTimeout(() => {
            this.startTurn();
        }, 500);
    },
    
    startTurn() {
        if (this.state.gameEnded) return;
        
        const currentPlayer = this.state.isPlayerTurn ? 'player' : 'ai';
        this.state.currentPhase = 'DRAW';
        console.log(`[${currentPlayer.toUpperCase()}] Starting Draw Phase`);
        this.updateUI();
        
        if (this.state.isPlayerTurn) {
            if (this.state.playerDeck.length > 0) {
                this.drawCard('player');
            } else {
                // If no cards to draw, go directly to champion phase
                this.state.currentPhase = 'CHAMPION';
                this.updateUI();
            }
        } else {
            this.handleAITurn();
        }
    },
    
    drawCard(player) {
        const isPlayer = player === 'player';
        const deck = isPlayer ? this.state.playerDeck : this.state.aiDeck;
        const hand = isPlayer ? this.state.playerHand : this.state.aiHand;
        
        if (deck.length > 0) {
            const card = deck.pop();
            hand.push(card);
            console.log(`[${isPlayer ? 'Player' : 'AI'}] Drew card: ${card.name} (Color: ${card.color.name}, Effects: ${card.effects.join(', ')})`);
            
            const handContainer = document.querySelector(`.${isPlayer ? 'player' : 'ai'}-hand`);
            if (handContainer) {
                const cardElement = document.createElement('div');
                cardElement.className = `card drawing ${!isPlayer ? 'card-back' : ''}`;
                if (isPlayer) {
                    cardElement.style.backgroundImage = `url(${card.imagePath})`;
                }
                handContainer.appendChild(cardElement);
                
                setTimeout(() => {
                    cardElement.classList.remove('drawing');
                    this.updateUI();
                    
                    // Only transition phase for player's turn after draw animation
                    if (isPlayer) {
                        this.state.currentPhase = 'CHAMPION';
                        console.log('[Player] Starting Champion Phase');
                        this.updateUI();
                    }
                }, 400);
            }
        }
    },
    
    playCard(cardIndex) {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== 'CHAMPION') return;
        
        const card = this.state.playerHand[cardIndex];
        this.state.playerHand.splice(cardIndex, 1);
        this.state.playerChampionZone.push(card);
        
        // Add any effects from the card to the stacked effects
        if (card.effects && card.effects.length > 0) {
            this.state.stackedEffects.push(...card.effects);
        }
        
        this.updateUI();
    },
    
    updateLifeTotal(player, newLife) {
        const lifeElement = document.querySelector(`.${player}-life`);
        const playerInfo = lifeElement.closest('.player-info');
        
        // Check if player is losing life and apply shake animation
        if (newLife < this.state[`${player}Life`]) {
            playerInfo.classList.add('shake-animation');
            setTimeout(() => {
                playerInfo.classList.remove('shake-animation');
            }, 500);
        }
        
        // Update the life total
        this.state[`${player}Life`] = newLife;
        lifeElement.textContent = newLife;
        
        // Update the color gradient based on life total
        let color;
        if (newLife >= 7) color = 'var(--card-white)';
        else if (newLife === 6) color = 'var(--card-purple)';
        else if (newLife === 5) color = 'var(--card-blue)';
        else if (newLife === 4) color = 'var(--card-green)';
        else if (newLife === 3) color = 'var(--card-yellow)';
        else if (newLife === 2) color = 'var(--card-orange)';
        else if (newLife === 1) color = 'var(--card-red)';
        else color = 'var(--card-black)';
        
        playerInfo.style.setProperty('--life-color', color);
        playerInfo.style.background = `radial-gradient(circle at center, ${color} 0%, var(--bg-tertiary) 70%)`;
        
        // Check for game over
        if (newLife <= 0) {
            this.endGame(player === 'player' ? GameResult.AI_WIN : GameResult.PLAYER_WIN);
        }
    },
    
    handleCombat(attackingCard, defendingCard) {
        console.log(`Combat: ${attackingCard.name} (Color: ${attackingCard.color.value}) vs ${defendingCard.name} (Color: ${defendingCard.color.value})`);
        
        // Create and play attack animation
        this.playAttackAnimation(this.state.isPlayerTurn);
        
        // Get current color values
        const attackerColorValue = attackingCard.color.value;
        const defenderColorValue = defendingCard.color.value;
        
        // Delay the combat resolution for animation
        setTimeout(() => {
            // If same color, both are defeated
            if (attackerColorValue === defenderColorValue) {
                console.log('Same color - both cards defeated!');
                this.moveToTomb(attackingCard, this.state.isPlayerTurn);
                this.moveToTomb(defendingCard, !this.state.isPlayerTurn);
            }
            // If attacker has higher color value
            else if (attackerColorValue > defenderColorValue) {
                const difference = attackerColorValue - defenderColorValue;
                const newDefenderValue = defenderColorValue - difference;
                console.log(`Defender loses ${difference} color points (${defenderColorValue} -> ${newDefenderValue})`);
                
                // If defender goes black (0 or less), it's defeated
                if (newDefenderValue <= 0) {
                    console.log('Defender turned black - defeated!');
                    this.moveToTomb(defendingCard, !this.state.isPlayerTurn);
                    this.updateLifeTotal(this.state.isPlayerTurn ? 'ai' : 'player', this.state.isPlayerTurn ? 
                        this.state.aiLife + newDefenderValue - 1 : this.state.playerLife + newDefenderValue - 1);
                } else {
                    // Update defender's color
                    defendingCard.color = this.getColorForValue(newDefenderValue);
                    // Update the visual representation
                    this.updateChampionZone(this.state.isPlayerTurn ? 'ai' : 'player');
                }
            }
            // If defender has higher color value
            else {
                const difference = defenderColorValue - attackerColorValue;
                const newDefenderValue = defenderColorValue + difference;
                console.log(`Defender gains ${difference} color points (${defenderColorValue} -> ${newDefenderValue})`);
                
                // If defender goes white (7 or more), it's defeated
                if (newDefenderValue >= 7) {
                    console.log('Defender turned white - defeated!');
                    this.moveToTomb(defendingCard, !this.state.isPlayerTurn);
                    this.updateLifeTotal(this.state.isPlayerTurn ? 'ai' : 'player', this.state.isPlayerTurn ? 
                        this.state.aiLife - newDefenderValue + 6 : this.state.playerLife - newDefenderValue + 6);
                } else {
                    // Update defender's color
                    defendingCard.color = this.getColorForValue(newDefenderValue);
                    // Update the visual representation
                    this.updateChampionZone(this.state.isPlayerTurn ? 'ai' : 'player');
                }
            }
            
            // Clear any stacked effects
            this.state.stackedEffects = [];
            
            // End combat phase after attack
            this.state.currentPhase = 'END';
            this.updateUI();
            
            // End turn after a short delay
            setTimeout(() => {
                this.endTurn();
            }, 1000);
        }, 1000); // Wait for attack animation
    },
    
    // Add new method for attack animation
    playAttackAnimation(isPlayerAttacking) {
        const attackerZone = isPlayerAttacking ? '.player-champion-zone' : '.ai-champion-zone';
        const defenderZone = isPlayerAttacking ? '.ai-champion-zone' : '.player-champion-zone';
        
        const attackerCard = document.querySelector(`${attackerZone} .card`);
        const defenderCard = document.querySelector(`${defenderZone} .card`);
        
        if (attackerCard && defenderCard) {
            // Add animation classes
            attackerCard.style.transition = 'transform 0.5s ease-in-out';
            
            // Animate attacker moving forward
            attackerCard.style.transform = isPlayerAttacking ? 'translateY(-50px)' : 'translateY(50px)';
            
            // Shake defender card
            defenderCard.classList.add('shake-animation');
            
            // Reset positions after animation
            setTimeout(() => {
                attackerCard.style.transform = '';
                defenderCard.classList.remove('shake-animation');
            }, 500);
        }
    },
    
    handleDirectAttack(attackingCard) {
        const damage = attackingCard.color.value;
        console.log(`Direct attack with ${attackingCard.name} (Color: ${damage})`);
        
        // Play attack animation
        this.playDirectAttackAnimation(this.state.isPlayerTurn);
        
        // Delay the damage application for animation
        setTimeout(() => {
            if (this.state.isPlayerTurn) {
                const newAiLife = this.state.aiLife - damage;
                console.log(`AI life reduced by ${damage} (${this.state.aiLife} -> ${newAiLife})`);
                this.updateLifeTotal('ai', newAiLife);
            } else {
                const newPlayerLife = this.state.playerLife - damage;
                console.log(`Player life reduced by ${damage} (${this.state.playerLife} -> ${newPlayerLife})`);
                this.updateLifeTotal('player', newPlayerLife);
            }
            
            // End combat phase after attack
            this.state.currentPhase = 'END';
            this.updateUI();
            
            // End turn after a short delay
            setTimeout(() => {
                this.endTurn();
            }, 1000);
        }, 1000); // Wait for attack animation
    },
    
    // Add new method for direct attack animation
    playDirectAttackAnimation(isPlayerAttacking) {
        const attackerZone = isPlayerAttacking ? '.player-champion-zone' : '.ai-champion-zone';
        const defenderInfo = isPlayerAttacking ? '.ai-info' : '.player-info';
        
        const attackerCard = document.querySelector(`${attackerZone} .card`);
        const defenderElement = document.querySelector(defenderInfo);
        
        if (attackerCard && defenderElement) {
            // Add animation classes
            attackerCard.style.transition = 'transform 0.5s ease-in-out';
            
            // Animate attacker moving toward opponent
            attackerCard.style.transform = isPlayerAttacking ? 'translateY(-100px)' : 'translateY(100px)';
            
            // Reset positions after animation
            setTimeout(() => {
                attackerCard.style.transform = '';
            }, 300);
        }
    },
    
    // Helper method to get CardColor enum for a value
    getColorForValue(value) {
        // Ensure value is within bounds
        value = Math.max(0, Math.min(7, value));
        
        // Map of numeric values to CardColor enum
        const colorMap = [
            CardColor.BLACK,   // 0
            CardColor.RED,     // 1
            CardColor.ORANGE,  // 2
            CardColor.YELLOW,  // 3
            CardColor.GREEN,   // 4
            CardColor.BLUE,    // 5
            CardColor.PURPLE,  // 6
            CardColor.WHITE    // 7
        ];
        
        return colorMap[value];
    },
    
    moveToTomb(card, isPlayer) {
        console.log(`Moving ${card.name} to ${isPlayer ? 'player' : 'AI'}'s tomb`);
        
        if (isPlayer) {
            // Check if this is the top card before modifying the champion zone
            const isTopCard = this.state.playerChampionZone.length > 0 && 
                this.state.playerChampionZone[this.state.playerChampionZone.length - 1].id === card.id;
                
            if (isTopCard) {
                // Move all cards to tomb
                this.state.playerTombPile.push(...this.state.playerChampionZone);
                this.state.playerChampionZone = [];
            }
        } else {
            // Check if this is the top card before modifying the champion zone
            const isTopCard = this.state.aiChampionZone.length > 0 && 
                this.state.aiChampionZone[this.state.aiChampionZone.length - 1].id === card.id;
                
            if (isTopCard) {
                // Move all cards to tomb
                this.state.aiTombPile.push(...this.state.aiChampionZone);
                this.state.aiChampionZone = [];
            }
        }
        
        // Update zone counts and UI
        this.updateUI();
    },
    
    endTurn() {
        console.log(`[${this.state.isPlayerTurn ? 'Player' : 'AI'}] Ending turn`);
        
        // Reset any turn-specific state
        if (this.state.firstTurn) {
            this.state.firstTurn = false;
        }
        
        // Switch players
        this.state.isPlayerTurn = !this.state.isPlayerTurn;
        
        // Start next turn
        setTimeout(() => {
            // Start the next turn properly using startTurn
            this.startTurn();
        }, 500);
    },
    
    handleAITurn() {
        if (this.state.isPlayerTurn) return;
        
        console.log(`[AI] Taking turn with difficulty: ${this.state.aiDifficulty}`);
        
        // Get the appropriate AI strategy based on difficulty
        const strategy = window.AIStrategies ? 
            window.AIStrategies.getStrategy(this.state.aiDifficulty) :
            null;
        
        // Draw Phase
        if (this.state.aiDeck.length > 0) {
            this.drawCard('ai');
        }
        
        // Wait for draw animation to complete
        setTimeout(() => {
            // Champion Phase
            this.state.currentPhase = 'CHAMPION';
            this.updateUI();
            
            if (this.state.aiHand.length > 0) {
                let cardIndex = -1;
                
                // Use strategy if available, otherwise fall back to random
                if (strategy) {
                    cardIndex = strategy.selectCardToPlay(
                        this.state.aiHand, 
                        this.state.playerChampionZone, 
                        this.state.aiChampionZone
                    );
                } else {
                    // Default random strategy
                    cardIndex = Math.floor(Math.random() * this.state.aiHand.length);
                }
                
                // Play the selected card if one was chosen
                if (cardIndex >= 0 && cardIndex < this.state.aiHand.length) {
                    const card = this.state.aiHand[cardIndex];
                    this.state.aiHand.splice(cardIndex, 1);
                    this.state.aiChampionZone.push(card);
                    console.log(`[AI] Playing card: ${card.name} (Color: ${card.color.name})`);
                    this.updateUI();
                } else {
                    console.log('[AI] Choosing not to play a card');
                }
            }
            
            // Combat Phase
            setTimeout(() => {
                this.state.currentPhase = 'COMBAT';
                this.updateUI();
                
                if (!this.state.firstTurn && this.state.aiChampionZone.length > 0) {
                    this.handleAICombat(strategy);
                } else {
                    console.log('[AI] Skips combat on first turn');
                    this.endTurn();
                }
            }, 1000);
        }, 1000);
    },
    
    handleAICombat(strategy) {
        // If AI has no champions, skip combat
        if (this.state.aiChampionZone.length === 0) {
            console.log('[AI] Has no champions to attack with');
            return;
        }
        
        // Get the top card of the AI's champion zone
        const attacker = this.state.aiChampionZone[this.state.aiChampionZone.length - 1];
        console.log(`[AI] Considering attack with ${attacker.name} (Color: ${attacker.color.value})`);
        
        // If player has a champion, decide whether to attack it
        if (this.state.playerChampionZone.length > 0) {
            const defender = this.state.playerChampionZone[this.state.playerChampionZone.length - 1];
            
            // Check if AI should attack based on strategy
            let shouldAttack = true;
            
            if (strategy) {
                shouldAttack = strategy.shouldAttack(attacker, defender);
                console.log(`[AI] Strategy decision to attack: ${shouldAttack}`);
            }
            
            if (shouldAttack) {
                console.log(`[AI] Attacking player's ${defender.name} (Color: ${defender.color.value})`);
                this.handleCombat(attacker, defender);
            } else {
                console.log(`[AI] Strategically choosing not to attack`);
                this.endTurn();
            }
        } else {
            // Always direct attack if no defenders
            console.log(`[AI] Direct attacking player with ${attacker.name}`);
            this.handleDirectAttack(attacker);
        }
    },
    
    endGame(result) {
        this.state.gameEnded = true;
        gameStorage.updateGameStats(result);
        
        // Show game over message
        const gameOverMessage = document.createElement('div');
        gameOverMessage.className = 'game-over-message';
        gameOverMessage.innerHTML = `
            <h2>${result === GameResult.PLAYER_WIN ? 'Victory!' : result === GameResult.AI_WIN ? 'Defeat!' : 'Draw!'}</h2>
            <button class="btn btn-primary" onclick="router.navigate('${Routes.HOME}')">
                Return to Menu
            </button>
        `;
        
        document.querySelector('.game-container').appendChild(gameOverMessage);
    },
    
    updateUI() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;
        
        // Update life totals
        document.querySelector('.player-life').textContent = this.state.playerLife;
        document.querySelector('.ai-life').textContent = this.state.aiLife;
        
        // Update hands
        this.updateHand('player');
        this.updateHand('ai');
        
        // Update champion zones
        this.updateChampionZone('player');
        this.updateChampionZone('ai');
        
        // Log the current phase
        console.log(`[Phase] ${this.state.isPlayerTurn ? 'Player' : 'AI'}'s ${this.state.currentPhase} Phase`);
        
        // Update next phase button
        const nextPhaseBtn = document.querySelector('.next-phase-btn');
        if (nextPhaseBtn) {
            // Button is only clickable during player's Champion and Combat phases
            // Except during first turn where Combat phase is auto-skipped
            const isClickable = this.state.isPlayerTurn && 
                (this.state.currentPhase === 'CHAMPION' || 
                 (this.state.currentPhase === 'COMBAT' && !this.state.firstTurn));
            
            nextPhaseBtn.disabled = !isClickable;
            nextPhaseBtn.style.opacity = isClickable ? '1' : '0.6';
            nextPhaseBtn.style.cursor = isClickable ? 'pointer' : 'default';
            
            // Update button text
            if (this.state.currentPhase) {
                let buttonText;
                if (this.state.isPlayerTurn) {
                    switch (this.state.currentPhase) {
                        case 'DRAW':
                            buttonText = "Draw Phase";
                            break;
                        case 'CHAMPION':
                            buttonText = "End Champion Phase";
                            break;
                        case 'COMBAT':
                            buttonText = this.state.firstTurn ? "Skipping Combat (First Turn)" : "End Combat Phase";
                            // Auto-skip combat on first turn
                            if (this.state.firstTurn) {
                                setTimeout(() => {
                                    this.endTurn();
                                }, 1500);
                            }
                            break;
                        default:
                            buttonText = "End Turn";
                    }
                } else {
                    switch (this.state.currentPhase) {
                        case 'DRAW':
                            buttonText = "AI Draw Phase";
                            break;
                        case 'CHAMPION':
                            buttonText = "AI Champion Phase";
                            break;
                        case 'COMBAT':
                            buttonText = "AI Combat Phase";
                            break;
                        default:
                            buttonText = "AI Turn";
                    }
                }
                nextPhaseBtn.textContent = buttonText;
            }
        }
        
        // Update deck counts
        document.querySelector('.player-deck-count').textContent = this.state.playerDeck.length;
        document.querySelector('.ai-deck-count').textContent = this.state.aiDeck.length;
        
        // Update tomb pile counts
        document.querySelector('.player-tomb-count').textContent = this.state.playerTombPile.length;
        document.querySelector('.ai-tomb-count').textContent = this.state.aiTombPile.length;
        
        // Update hand counts
        document.querySelector('.ai-hand-count').textContent = this.state.aiHand.length;
    },
    
    updateHand(player) {
        const handContainer = document.querySelector(`.${player}-hand`);
        if (!handContainer) return;
        
        const hand = this.state[`${player}Hand`];
        
        handContainer.innerHTML = hand.map((card, index) => {
            // Debug log for card effects
            console.log(`Card in hand: ${card.name}`, {
                effects: card.effects,
                effectDescriptions: card.effectDescriptions,
                currentEffects: card.currentEffects,
                currentEffectDescriptions: card.currentEffectDescriptions
            });

            return `
                <div class="card ${player === 'ai' ? 'card-back' : ''}" 
                     ${player === 'player' ? `style="background-image: url(${card.imagePath})"` : ''}
                     data-card-index="${index}"
                     data-card-color="${card.color.name.toLowerCase()}">
                    ${player === 'player' ? `
                        <div class="card-glow glow-${card.color.name.toLowerCase()}"></div>
                        <div class="info-window">
                            <div class="info-header">
                                <h3>${card.name}</h3>
                                <div class="color-indicator ${card.color.name.toLowerCase()}">
                                    ${card.color.name}
                                </div>
                            </div>
                            <div class="card-layer">
                                <div class="card-effects">
                                    ${(card.effects && card.effects.length > 0) ? 
                                        card.effects.map((effect, effectIndex) => `
                                            <div class="effect">
                                                <span class="effect-name">${effect}</span>
                                                <span class="effect-description">${card.effectDescriptions[effectIndex] || ''}</span>
                                            </div>
                                        `).join('') : 
                                        '<div class="effect"><span class="effect-description">No effect</span></div>'
                                    }
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },
    
    updateChampionZone(player) {
        const zoneContainer = document.querySelector(`.${player}-champion-zone`);
        if (!zoneContainer) return;
        
        const championZone = this.state[`${player}ChampionZone`];
        
        // Remove all glow classes first
        zoneContainer.classList.remove('has-champion', 'glow-black', 'glow-red', 'glow-orange', 'glow-yellow', 'glow-green', 'glow-blue', 'glow-purple', 'glow-white');
        
        if (championZone.length > 0) {
            const topCard = championZone[championZone.length - 1];
            const colorClass = topCard.color.name.toLowerCase();
            
            // Collect all effects from the stack
            const allEffects = [];
            const allEffectDescriptions = [];
            championZone.forEach(card => {
                if (card.effects && card.effects.length > 0) {
                    card.effects.forEach((effect, index) => {
                        allEffects.push(effect);
                        allEffectDescriptions.push(card.effectDescriptions[index] || '');
                    });
                }
            });

            // Update the top card's current effects to include all stacked effects
            topCard.currentEffects = allEffects;
            topCard.currentEffectDescriptions = allEffectDescriptions;
            
            // Debug log for champion card effects
            console.log(`Champion card: ${topCard.name}`, {
                effects: topCard.effects,
                effectDescriptions: topCard.effectDescriptions,
                currentEffects: topCard.currentEffects,
                currentEffectDescriptions: topCard.currentEffectDescriptions,
                allStackedEffects: allEffects
            });
            
            // Add glow classes
            zoneContainer.classList.add('has-champion', `glow-${colorClass}`);
            
            zoneContainer.innerHTML = `
                <div class="card" style="background-image: url(${topCard.imagePath})"
                     data-card-id="${topCard.id}"
                     data-card-color="${colorClass}">
                    <div class="card-glow glow-${colorClass}"></div>
                    <div class="info-window">
                        <div class="info-header">
                            <h3>${topCard.name}</h3>
                            <div class="color-indicator ${colorClass}">
                                ${topCard.color.name}
                            </div>
                        </div>
                        <div class="card-effects">
                            ${(allEffects.length > 0) ? 
                                allEffects.map((effect, effectIndex) => `
                                    <div class="effect">
                                        <span class="effect-name">${effect}</span>
                                        <span class="effect-description">${allEffectDescriptions[effectIndex] || ''}</span>
                                    </div>
                                `).join('') : 
                                '<div class="effect"><span class="effect-description">No effect</span></div>'
                            }
                        </div>
                    </div>
                </div>
            `;
        } else {
            zoneContainer.innerHTML = '';
        }
    },
    
    handleChampionClick(card, isPlayer) {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== 'COMBAT' || this.state.firstTurn) return;
        
        // Can only use player's champion to attack
        if (!isPlayer) return;
        
        // If AI has a champion, attack it directly
        if (this.state.aiChampionZone.length > 0) {
            const aiCard = this.state.aiChampionZone[this.state.aiChampionZone.length - 1];
            this.handleCombat(card, aiCard);
        } else {
            // If AI has no champion, perform direct attack
            this.handleDirectAttack(card);
        }
    },
    
    handleOpponentChampionClick(card) {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== 'COMBAT' || !this.state.selectedCard) return;
        
        // Remove attackable indicator
        const aiChampion = document.querySelector('.ai-champion-zone .card');
        if (aiChampion) {
            aiChampion.style.cursor = '';
            aiChampion.classList.remove('attackable');
        }
        
        // Handle combat between selected card and opponent's card
        this.handleCombat(this.state.selectedCard, card);
        this.state.selectedCard = null;
        
        // Remove selection visual
        const championCards = document.querySelectorAll('.champion-zone .card');
        championCards.forEach(cardElement => cardElement.classList.remove('selected'));
    },
    
    handleOpponentDirectAttack() {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== 'COMBAT' || !this.state.selectedCard) return;
        if (this.state.aiChampionZone.length > 0) return; // Can't direct attack if opponent has a champion
        
        this.handleDirectAttack(this.state.selectedCard);
        this.state.selectedCard = null;
        
        // Remove selection visual
        const championCards = document.querySelectorAll('.champion-zone .card');
        championCards.forEach(cardElement => cardElement.classList.remove('selected'));
    },
    
    render(container) {
        console.log('Rendering game page');
        
        const gameSettings = gameStorage.getGameSettings();
        const playerData = gameStorage.getUserData();
        
        // Get the correct AI avatar based on difficulty
        let aiAvatar = './images/ai/basic.jpg'; // Default
        if (this.state.aiDifficulty === 'medium') {
            aiAvatar = './images/ai/intermediate.jpg';
        } else if (this.state.aiDifficulty === 'hard') {
            aiAvatar = './images/ai/hard.jpg';
        }
        
        const aiName = gameSettings.aiName || 
            (this.state.aiDifficulty === 'hard' ? 'Master AI' : 
             this.state.aiDifficulty === 'medium' ? 'Tactical AI' : 'Novice AI');
        
        container.innerHTML = `
            <div class="game-container">
                <div class="game-board">
                    <!-- AI Info -->
                    <div class="player-info ai-info">
                        <img src="${aiAvatar}" alt="AI" class="avatar">
                        <div class="player-details">
                            <div class="player-name">${aiName}</div>
                            <div class="life-total ai-life">${this.state.aiLife}</div>
                        </div>
                    </div>
                    
                    <!-- AI Section -->
                    <div class="game-zones ai-zones">
                        <div class="deck-zone" title="AI's Deck">
                            <div class="card card-back"></div>
                            <span class="zone-count ai-deck-count">${this.state.aiDeck.length}</span>
                        </div>
                        
                        <div class="hand-zone">
                            <div class="ai-hand"></div>
                            <span class="zone-count ai-hand-count">${this.state.aiHand.length}</span>
                        </div>
                        
                        <div class="tomb-zone" title="AI's Tomb">
                            <div class="card card-back"></div>
                            <span class="zone-count ai-tomb-count">${this.state.aiTombPile.length}</span>
                        </div>
                    </div>
                    
                    <!-- Champion Zones -->
                    <div class="champion-zones">
                        <div class="champion-zone ai-champion-zone"></div>
                        <div class="champion-zone player-champion-zone"></div>
                    </div>
                    
                    <!-- Center Section -->
                    <div class="center-section">
                        <button class="btn btn-primary next-phase-btn">
                            Starting Game...
                        </button>
                    </div>
                    
                    <!-- Player Section -->
                    <div class="game-zones player-zones">
                        <div class="tomb-zone" title="Your Tomb">
                            <div class="card card-back"></div>
                            <span class="zone-count player-tomb-count">${this.state.playerTombPile.length}</span>
                        </div>
                        
                        <div class="hand-zone">
                            <div class="player-hand"></div>
                        </div>
                        
                        <div class="deck-zone" title="Your Deck">
                            <div class="card card-back"></div>
                            <span class="zone-count player-deck-count">${this.state.playerDeck.length}</span>
                        </div>
                    </div>
                    
                    <!-- Player Info -->
                    <div class="player-info player-info">
                        <img src="${playerData.avatar || './images/default-avatar.png'}" alt="Player" class="avatar">
                        <div class="player-details">
                            <div class="player-name">${playerData.name || 'Player'}</div>
                            <div class="life-total player-life">${this.state.playerLife}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize life total displays
        this.updateLifeTotal('player', this.state.playerLife);
        this.updateLifeTotal('ai', this.state.aiLife);
        
        this.attachEventListeners(container);
    },
    
    attachEventListeners(container) {
        // Card click handlers for champion phase
        container.addEventListener('click', (e) => {
            const cardElement = e.target.closest('.card');
            if (!cardElement) return;
            
            // Handle card clicks based on location and phase
            if (cardElement.closest('.player-hand') && this.state.isPlayerTurn && this.state.currentPhase === 'CHAMPION') {
                const cardIndex = Array.from(cardElement.parentNode.children).indexOf(cardElement);
                this.playCard(cardIndex);
            } else if (cardElement.closest('.player-champion-zone') && this.state.isPlayerTurn && this.state.currentPhase === 'COMBAT' && !this.state.firstTurn) {
                const card = this.state.playerChampionZone[this.state.playerChampionZone.length - 1];
                if (card && this.state.playerChampionZone.length > 0) {
                    this.handleChampionClick(card, true);
                }
            } else if (cardElement.closest('.ai-champion-zone') && this.state.selectedCard && this.state.aiChampionZone.length > 0 && this.state.isPlayerTurn && this.state.currentPhase === 'COMBAT') {
                // Get the top card of AI's champion zone
                const card = this.state.aiChampionZone[this.state.aiChampionZone.length - 1];
                if (card) {
                    this.handleOpponentChampionClick(card);
                }
            }
        });
        
        // Direct attack handler
        container.addEventListener('click', (e) => {
            if (e.target.closest('.ai-info') && this.state.selectedCard && this.state.aiChampionZone.length === 0 && !this.state.firstTurn && this.state.isPlayerTurn && this.state.currentPhase === 'COMBAT') {
                this.handleOpponentDirectAttack();
            }
        });
        
        // Tomb pile click handlers
        container.querySelectorAll('.tomb-zone').forEach(tombZone => {
            tombZone.addEventListener('click', () => {
                const isPlayer = tombZone.closest('.player-zones') !== null;
                const tombPile = isPlayer ? this.state.playerTombPile : this.state.aiTombPile;
                
                if (tombPile.length > 0) {
                    this.showTombPileModal(tombPile);
                }
            });
        });
        
        // Next phase button
        const nextPhaseBtn = container.querySelector('.next-phase-btn');
        if (nextPhaseBtn) {
            nextPhaseBtn.addEventListener('click', () => {
                if (!this.state.isPlayerTurn) return;
                
                console.log(`[Player] Ending ${this.state.currentPhase} phase`);
                this.nextPhase();
            });
        }
    },
    
    showTombPileModal(tombPile) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        // Determine if this is the player's or AI's tomb pile
        const isPlayerTomb = tombPile === this.state.playerTombPile;
        
        modal.innerHTML = `
            <div class="modal tomb-pile-modal">
                <div class="modal-header">
                    <h3>${isPlayerTomb ? 'Your' : 'AI\'s'} Tomb Pile (${tombPile.length} cards)</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tomb-pile-grid">
                        ${tombPile.map(card => `
                            <div class="card" style="background-image: url(${card.imagePath})">
                                <div class="card-glow glow-${card.color.name.toLowerCase()}"></div>
                                <div class="info-window">
                                    <div class="info-header">
                                        <h3>${card.name}</h3>
                                        <div class="color-indicator ${card.color.name.toLowerCase()}">
                                            ${card.color.name}
                                        </div>
                                    </div>
                                    <div class="card-layer">
                                        <div class="card-effects">
                                            ${card.currentEffects && card.currentEffects.length > 0 ? 
                                                card.currentEffects.map((effect, effectIndex) => `
                                                    <div class="effect">
                                                        <span class="effect-name">${effect}</span>
                                                        <span class="effect-description">${card.currentEffectDescriptions ? card.currentEffectDescriptions[effectIndex] || '' : ''}</span>
                                                    </div>
                                                `).join('') : 
                                                '<div class="effect"><span class="effect-description">No effect</span></div>'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },
    
    nextPhase() {
        if (!this.state.isPlayerTurn) {
            console.log(`[AI] Ending ${this.state.currentPhase} Phase`);
            
            switch (this.state.currentPhase) {
                case 'DRAW':
                    this.state.currentPhase = 'CHAMPION';
                    break;
                case 'CHAMPION':
                    this.state.currentPhase = 'COMBAT';
                    this.state.stackedEffects = [];
                    break;
                case 'COMBAT':
                    this.endTurn();
                    return;
            }
            
            console.log(`[AI] Starting ${this.state.currentPhase} Phase`);
            this.updateUI();
        } else {
            console.log(`[Player] Ending ${this.state.currentPhase} Phase`);
            
            switch (this.state.currentPhase) {
                case 'DRAW':
                    this.state.currentPhase = 'CHAMPION';
                    break;
                case 'CHAMPION':
                    this.state.currentPhase = 'COMBAT';
                    this.state.stackedEffects = [];
                    break;
                case 'COMBAT':
                    this.endTurn();
                    return;
            }
            
            console.log(`[Player] Starting ${this.state.currentPhase} Phase`);
            this.updateUI();
        }
    }
};

// Make the page handler available globally
window.GamePage = GamePage; 
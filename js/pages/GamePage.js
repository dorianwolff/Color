const GamePage = {
    init(container) {
        console.log('Initializing Game Page');
        
        // Get game settings and player data
        const gameSettings = gameStorage.getGameSettings();
        const playerData = gameStorage.getUserData();
        const activeDeck = gameStorage.getActiveDeck();
        
        if (!activeDeck) {
            alert('No active deck selected!');
            router.navigate(Routes.DECKS);
            return;
        }
        
        // Initialize game state
        this.state = {
            playerLife: 7,
            aiLife: 7,
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
            firstTurn: true
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
        // Ensure each card has a proper color object
        const colorValue = typeof cardData.color === 'number' ? cardData.color : 
                          cardData.color?.value || Math.floor(Math.random() * 6) + 1;
        
        return {
            ...cardData,
            color: CardColor.fromValue(colorValue),
            name: cardData.name || 'Unknown Card',
            description: cardData.description || '',
            // Use relative path for images
            imagePath: cardData.imageNumber ? `./images/cards/${cardData.imageNumber}.png` : './images/cards/default.png',
            effects: cardData.effects || []
        };
    },
    
    startGame() {
        console.log('[Game] Starting new game');
        // Get game settings and player data
        const gameSettings = gameStorage.getGameSettings();
        const playerData = gameStorage.getUserData();
        
        // Clear any existing state
        this.state.playerHand = [];
        this.state.aiHand = [];
        this.updateUI();

        // Determine starting player
        this.state.isPlayerTurn = Math.random() < 0.5;
        const startingPlayer = this.state.isPlayerTurn ? 'Player' : 'AI';
        console.log(`[Game] ${startingPlayer} goes first`);
        
        // Show starting animation sequence
        const centerSection = document.querySelector('.center-section');
        const startingPlayerImg = document.createElement('div');
        startingPlayerImg.className = 'starting-player-animation';
        startingPlayerImg.innerHTML = `
            <img src="${this.state.isPlayerTurn ? (playerData?.avatar || './images/default-avatar.png') : (gameSettings?.aiAvatar || './images/ai/basic.jpg')}" 
                 alt="${startingPlayer}" class="avatar">
            <div class="starting-text">${startingPlayer} goes first!</div>
        `;
        centerSection.appendChild(startingPlayerImg);
        
        setTimeout(() => {
            startingPlayerImg.remove();
            // Step 2: Draw animation for starting hands
            this.drawStartingHands().then(() => {
                // Step 3: Start the game
                setTimeout(() => {
                    this.state.currentPhase = GamePhase.DRAW;
                    this.updateUI();
                    if (!this.state.isPlayerTurn) {
                        setTimeout(() => this.handleAITurn(), 500);
                    } else {
                        // If it's player's turn, automatically draw a card
                        this.drawCard('player');
                    }
                }, 500);
            });
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
                            console.log(`[Player] Drew card: ${card.name}`);
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
                            console.log(`[AI] Drew card: ${card.name}`);
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
    },
    
    startTurn() {
        if (this.state.gameEnded) return;
        
        const currentPlayer = this.state.isPlayerTurn ? 'player' : 'ai';
        this.state.currentPhase = GamePhase.DRAW;
        
        // Skip draw if deck is empty
        if (this.state[`${currentPlayer}Deck`].length > 0) {
            this.drawCard(currentPlayer);
        }
        
        // Update UI
        this.updateUI();
        
        // If AI's turn, handle it automatically
        if (!this.state.isPlayerTurn) {
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
            console.log(`[${isPlayer ? 'Player' : 'AI'}] Drew card: ${card.name}`);
            
            // Create visual card draw animation
            const handContainer = document.querySelector(`.${isPlayer ? 'player' : 'ai'}-hand`);
            if (handContainer) {
                const cardElement = document.createElement('div');
                cardElement.className = `card drawing ${!isPlayer ? 'card-back' : ''}`;
                if (isPlayer) {
                    cardElement.style.backgroundImage = `url(${card.imagePath})`;
                }
                handContainer.appendChild(cardElement);
                
                // Remove drawing class after animation
                setTimeout(() => {
                    cardElement.classList.remove('drawing');
                    if (isPlayer && this.state.currentPhase === GamePhase.DRAW) {
                        // Automatically transition to champion phase after drawing
                        setTimeout(() => {
                            this.state.currentPhase = GamePhase.CHAMPION;
                            console.log('[Player] Starting Champion phase');
                            this.updateUI();
                        }, 500);
                    }
                }, 400);
            }
        }
        
        this.updateUI();
    },
    
    playCard(cardIndex) {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== GamePhase.CHAMPION) return;
        
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
        console.log(`Combat: ${attackingCard.name} (${attackingCard.power}) vs ${defendingCard.name} (${defendingCard.power})`);
        
        // Apply any stacked effects
        const attackerPower = this.calculatePower(attackingCard);
        const defenderPower = this.calculatePower(defendingCard);
        
        console.log(`After effects: Attacker (${attackerPower}) vs Defender (${defenderPower})`);
        
        // Determine combat result
        if (attackerPower > defenderPower) {
            // Attacker wins
            console.log(`${attackingCard.name} wins combat!`);
            this.moveToTomb(defendingCard, false); // Move AI's card to tomb
            this.handleDirectAttack(attackingCard); // Deal damage to AI
        } else if (defenderPower > attackerPower) {
            // Defender wins
            console.log(`${defendingCard.name} wins combat!`);
            this.moveToTomb(attackingCard, true); // Move player's card to tomb
        } else {
            // Draw - both cards are destroyed
            console.log('Combat results in a draw - both champions destroyed!');
            this.moveToTomb(attackingCard, true);
            this.moveToTomb(defendingCard, false);
        }
        
        // Clear any stacked effects
        this.state.stackedEffects = [];
        
        // Update the display
        this.updateDisplay();
    },
    
    calculatePower(card) {
        let totalPower = card.power;
        
        // Apply stacked effects
        this.state.stackedEffects.forEach(effect => {
            if (effect.targetCard.id === card.id) {
                switch (effect.type) {
                    case CardColor.RED:
                        totalPower += 2;
                        break;
                    case CardColor.BLUE:
                        totalPower -= 1;
                        break;
                    case CardColor.GREEN:
                        totalPower += 1;
                        break;
                    // Add other color effects as needed
                }
            }
        });
        
        return Math.max(0, totalPower); // Power can't go below 0
    },
    
    handleDirectAttack(attackingCard) {
        const damage = attackingCard.color.value;
        console.log(`Direct attack with ${attackingCard.name} for ${damage} damage!`);
        
        if (this.state.isPlayerTurn) {
            this.state.aiLife -= damage;
            console.log(`AI life reduced to ${this.state.aiLife}`);
            this.updateLifeTotal('ai', this.state.aiLife);
        } else {
            this.state.playerLife -= damage;
            console.log(`Player life reduced to ${this.state.playerLife}`);
            this.updateLifeTotal('player', this.state.playerLife);
        }
        
        // Check for game end
        if (this.state.aiLife <= 0) {
            this.endGame(GameResult.PLAYER_WIN);
        } else if (this.state.playerLife <= 0) {
            this.endGame(GameResult.AI_WIN);
        }
    },
    
    moveToTomb(card, isPlayer) {
        console.log(`Moving ${card.name} to ${isPlayer ? 'player' : 'AI'}'s tomb`);
        
        if (isPlayer) {
            // Remove from player's champion zone
            this.state.playerChampionZone = this.state.playerChampionZone.filter(c => c.id !== card.id);
            this.state.playerTombPile.push(card);
        } else {
            // Remove from AI's champion zone
            this.state.aiChampionZone = this.state.aiChampionZone.filter(c => c.id !== card.id);
            this.state.aiTombPile.push(card);
        }
        
        // Update zone counts
        this.updateZoneCount(`${isPlayer ? 'player' : 'ai'}-tomb-count`, isPlayer ? this.state.playerTombPile.length : this.state.aiTombPile.length);
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
            this.state.currentPhase = GamePhase.DRAW;
            console.log(`[${this.state.isPlayerTurn ? 'Player' : 'AI'}] Starting turn`);
            
            // Draw a card for the new turn
            const currentPlayer = this.state.isPlayerTurn ? 'player' : 'ai';
            if (this.state[`${currentPlayer}Deck`].length > 0) {
                this.drawCard(currentPlayer);
            }
            
            this.updateUI();
            
            // If it's AI's turn, handle it
            if (!this.state.isPlayerTurn) {
                setTimeout(() => this.handleAITurn(), 500);
            }
        }, 500);
    },
    
    handleAITurn() {
        if (this.state.isPlayerTurn) return;
        console.log('AI turn starting');
        
        // Draw phase
        setTimeout(() => {
            if (this.state.currentPhase === GamePhase.DRAW) {
                console.log('AI Draw Phase');
                // Draw a card if possible
                if (this.state[`aiDeck`].length > 0) {
                    this.drawCard('ai');
                }
                this.nextPhase();
            }
        }, 500);
        
        // Champion phase
        setTimeout(() => {
            if (this.state.currentPhase === GamePhase.CHAMPION) {
                console.log('AI Champion Phase');
                // Play a random card from hand if possible
                if (this.state.aiHand.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.state.aiHand.length);
                    const card = this.state.aiHand[randomIndex];
                    this.state.aiHand.splice(randomIndex, 1);
                    this.state.aiChampionZone.push(card);
                }
                this.nextPhase();
            }
        }, 2000);
        
        // Combat phase
        setTimeout(() => {
            if (this.state.currentPhase === GamePhase.COMBAT) {
                console.log('AI Combat Phase');
                if (!this.state.firstTurn) {
                    this.handleAICombat();
                } else {
                    console.log('AI skips combat on first turn');
                }
                this.nextPhase();
            }
        }, 3500);
        
        // End phase
        setTimeout(() => {
            if (this.state.currentPhase === GamePhase.END) {
                console.log('AI End Phase');
                this.endTurn();
            }
        }, 5000);
    },
    
    handleAICombat() {
        // If AI has no champions, skip combat
        if (this.state.aiChampionZone.length === 0) {
            console.log('AI has no champions to attack with');
            return;
        }
        
        // For each AI champion, try to attack
        this.state.aiChampionZone.forEach(attacker => {
            console.log(`AI considering attack with ${attacker.name}`);
            
            if (this.state.playerChampionZone.length > 0) {
                // Find the best target based on power comparison
                let bestTarget = null;
                let bestOutcome = -Infinity;
                
                this.state.playerChampionZone.forEach(defender => {
                    const attackerPower = this.calculatePower(attacker);
                    const defenderPower = this.calculatePower(defender);
                    const outcome = attackerPower - defenderPower;
                    
                    if (outcome > bestOutcome) {
                        bestOutcome = outcome;
                        bestTarget = defender;
                    }
                });
                
                if (bestTarget) {
                    console.log(`AI attacks ${bestTarget.name} with ${attacker.name}`);
                    this.handleCombat(attacker, bestTarget);
                }
            } else {
                // Direct attack if no defenders
                console.log(`AI direct attacks with ${attacker.name}`);
                this.handleDirectAttack(attacker);
            }
        });
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
        console.log(`[Phase] ${this.state.isPlayerTurn ? 'Player' : 'AI'}'s ${this.state.currentPhase || 'Starting...'} Phase`);
        
        // Update next phase button
        const nextPhaseBtn = document.querySelector('.next-phase-btn');
        if (nextPhaseBtn) {
            // Only show the button during player's champion and combat phases
            nextPhaseBtn.style.display = this.state.isPlayerTurn && 
                (this.state.currentPhase === GamePhase.CHAMPION || this.state.currentPhase === GamePhase.COMBAT) ? 'block' : 'none';
            if (this.state.currentPhase) {
                nextPhaseBtn.textContent = `End ${this.state.currentPhase} Phase`;
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
        
        handContainer.innerHTML = hand.map((card, index) => `
            <div class="card ${player === 'ai' ? 'card-back' : ''}" 
                 ${player === 'player' ? `style="background-image: url(${card.imagePath})"` : ''}
                 data-card-index="${index}">
                ${player === 'player' ? `
                    <div class="card-glow glow-${card.color.class}"></div>
                    <div class="card-effects">
                        <div class="effect-name">${card.name}</div>
                        <div class="effect-description">${card.description || 'No effect'}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    },
    
    updateChampionZone(player) {
        const zoneContainer = document.querySelector(`.${player}-champion-zone`);
        if (!zoneContainer) return;
        
        const championZone = this.state[`${player}ChampionZone`];
        
        if (championZone.length > 0) {
            const card = championZone[championZone.length - 1];
            zoneContainer.innerHTML = `
                <div class="card" style="background-image: url(${card.imagePath})">
                    <div class="card-glow glow-${card.color.class}"></div>
                    <div class="card-effects">
                        <div class="effect-name">${card.name}</div>
                        <div class="effect-description">${card.description || 'No effect'}</div>
                        ${this.state.stackedEffects.length > 0 ? `
                            <div class="stacked-effects">
                                <div class="effects-title">Stacked Effects:</div>
                                ${this.state.stackedEffects.map(effect => `
                                    <div class="stacked-effect">${effect.description}</div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            zoneContainer.innerHTML = '';
        }
    },
    
    handleChampionClick(card, isPlayer) {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== GamePhase.COMBAT) return;
        
        // Can only use player's champion to attack
        if (!isPlayer) return;
        
        // Store the selected card for combat
        this.state.selectedCard = card;
        
        // Add visual indicator for selected card
        const championCards = document.querySelectorAll('.champion-zone .card');
        championCards.forEach(cardElement => cardElement.classList.remove('selected'));
        
        const selectedElement = document.querySelector(`.player-champion-zone .card[data-card-id="${card.id}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    },
    
    handleOpponentChampionClick(card) {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== GamePhase.COMBAT || !this.state.selectedCard) return;
        
        // Handle combat between selected card and opponent's card
        this.handleCombat(this.state.selectedCard, card);
        this.state.selectedCard = null;
        
        // Remove selection visual
        const championCards = document.querySelectorAll('.champion-zone .card');
        championCards.forEach(cardElement => cardElement.classList.remove('selected'));
    },
    
    handleOpponentDirectAttack() {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== GamePhase.COMBAT || !this.state.selectedCard) return;
        if (this.state.aiChampionZone.length > 0) return; // Can't direct attack if opponent has a champion
        
        this.handleDirectAttack(this.state.selectedCard);
        this.state.selectedCard = null;
        
        // Remove selection visual
        const championCards = document.querySelectorAll('.champion-zone .card');
        championCards.forEach(cardElement => cardElement.classList.remove('selected'));
    },
    
    render(container) {
        const gameSettings = gameStorage.getGameSettings();
        const playerData = gameStorage.getUserData();
        
        container.innerHTML = `
            <div class="game-container">
                <div class="game-board">
                    <!-- AI Info -->
                    <div class="player-info ai-info">
                        <img src="${gameSettings.aiAvatar || './images/ai/basic.jpg'}" alt="AI" class="avatar">
                        <div class="player-details">
                            <div class="player-name">${gameSettings.aiName || 'AI'}</div>
                            <div class="life-total ai-life">7</div>
                        </div>
                    </div>
                    
                    <!-- AI Section -->
                    <div class="game-zones ai-zones">
                        <div class="deck-zone" title="AI's Deck">
                            <div class="card card-back"></div>
                            <span class="zone-count ai-deck-count">0</span>
                        </div>
                        
                        <div class="hand-zone">
                            <div class="ai-hand"></div>
                            <span class="zone-count ai-hand-count">0</span>
                        </div>
                        
                        <div class="tomb-zone" title="AI's Tomb">
                            <div class="card card-back"></div>
                            <span class="zone-count ai-tomb-count">0</span>
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
                            End Phase
                        </button>
                    </div>
                    
                    <!-- Player Section -->
                    <div class="game-zones player-zones">
                        <div class="tomb-zone" title="Your Tomb">
                            <div class="card card-back"></div>
                            <span class="zone-count player-tomb-count">0</span>
                        </div>
                        
                        <div class="hand-zone">
                            <div class="player-hand"></div>
                        </div>
                        
                        <div class="deck-zone" title="Your Deck">
                            <div class="card card-back"></div>
                            <span class="zone-count player-deck-count">0</span>
                        </div>
                    </div>
                    
                    <!-- Player Info -->
                    <div class="player-info player-info">
                        <img src="${playerData.avatar || './images/default-avatar.png'}" alt="Player" class="avatar">
                        <div class="player-details">
                            <div class="player-name">${playerData.name || 'Player'}</div>
                            <div class="life-total player-life">7</div>
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
            if (cardElement.closest('.player-hand') && this.state.isPlayerTurn && this.state.currentPhase === GamePhase.CHAMPION) {
                const cardIndex = Array.from(cardElement.parentNode.children).indexOf(cardElement);
                this.playCard(cardIndex);
            } else if (cardElement.closest('.player-champion-zone') && this.state.isPlayerTurn && this.state.currentPhase === GamePhase.COMBAT) {
                const cardId = cardElement.dataset.cardId;
                const card = this.state.playerChampionZone.find(c => c.id === cardId);
                if (card) this.handleChampionClick(card, true);
            } else if (cardElement.closest('.ai-champion-zone') && this.state.selectedCard) {
                const cardId = cardElement.dataset.cardId;
                const card = this.state.aiChampionZone.find(c => c.id === cardId);
                if (card) this.handleOpponentChampionClick(card);
            }
        });
        
        // Direct attack handler
        container.addEventListener('click', (e) => {
            if (e.target.closest('.ai-info') && this.state.selectedCard && this.state.aiChampionZone.length === 0) {
                this.handleOpponentDirectAttack();
            }
        });
        
        // Tomb pile click handlers
        container.querySelectorAll('.tomb-zone').forEach(tombZone => {
            tombZone.addEventListener('click', () => {
                const isPlayer = tombZone.closest('.player-section:not(.ai-section)');
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
                
                switch (this.state.currentPhase) {
                    case GamePhase.DRAW:
                        this.state.currentPhase = GamePhase.CHAMPION;
                        console.log('[Player] Starting Champion phase');
                        break;
                    case GamePhase.CHAMPION:
                        // Clear stacked effects when leaving champion phase
                        this.state.stackedEffects = [];
                        this.state.currentPhase = GamePhase.COMBAT;
                        console.log('[Player] Starting Combat phase');
                        break;
                    case GamePhase.COMBAT:
                        this.state.currentPhase = GamePhase.END;
                        console.log('[Player] Starting End phase');
                        this.endTurn();
                        break;
                }
                
                this.updateUI();
            });
        }
    },
    
    showTombPileModal(tombPile) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal tomb-pile-modal">
                <div class="modal-header">
                    <h3>Tomb Pile (${tombPile.length} cards)</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tomb-pile-grid">
                        ${tombPile.map(card => `
                            <div class="card" style="background-image: url(${card.imagePath})">
                                <div class="card-glow glow-${card.color.class}"></div>
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
            console.log(`[AI] Ending ${this.state.currentPhase} phase`);
            
            switch (this.state.currentPhase) {
                case GamePhase.DRAW:
                    this.state.currentPhase = GamePhase.CHAMPION;
                    console.log('[AI] Starting Champion phase');
                    break;
                case GamePhase.CHAMPION:
                    this.state.stackedEffects = [];
                    this.state.currentPhase = GamePhase.COMBAT;
                    console.log('[AI] Starting Combat phase');
                    break;
                case GamePhase.COMBAT:
                    this.state.currentPhase = GamePhase.END;
                    console.log('[AI] Starting End phase');
                    break;
            }
            
            this.updateUI();
        }
    }
};

// Make the page handler available globally
window.GamePage = GamePage; 
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
            stackedEffects: []
        };
        
        // Render initial game state
        this.render(container);
        
        // Start the game
        this.startGame();
    },
    
    generateAIDeck() {
        // For now, generate a random deck for the AI
        const allCards = CardDatabase.getAllCards();
        const aiDeck = [];
        while (aiDeck.length < 10) {
            const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
            aiDeck.push(this.initializeCard(randomCard));
        }
        return aiDeck;
    },
    
    initializeCard(cardData) {
        // Ensure each card has a proper color object
        const colorValue = typeof cardData.color === 'number' ? cardData.color : 
                          cardData.color?.value || Math.floor(Math.random() * 6) + 1; // Random color 1-6 if none specified
        
        return {
            ...cardData,
            color: CardColor.fromValue(colorValue),
            name: cardData.name || 'Unknown Card',
            description: cardData.description || '',
            imagePath: cardData.imagePath || 'images/cards/default.jpg',
            effects: cardData.effects || []
        };
    },
    
    startGame() {
        // Draw initial hands
        for (let i = 0; i < 3; i++) {
            this.drawCard('player');
            this.drawCard('ai');
        }
        
        // Start first turn
        this.startTurn();
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
        const deck = this.state[`${player}Deck`];
        const hand = this.state[`${player}Hand`];
        
        if (deck.length > 0) {
            const card = deck.pop();
            hand.push(card);
        }
        
        this.updateUI();
    },
    
    playCard(cardIndex) {
        if (!this.state.isPlayerTurn || this.state.currentPhase !== GamePhase.PLAY) return;
        
        const card = this.state.playerHand[cardIndex];
        this.state.playerHand.splice(cardIndex, 1);
        this.state.playerChampionZone.push(card);
        
        // If no cards left in hand, move to combat phase
        if (this.state.playerHand.length === 0) {
            this.state.currentPhase = GamePhase.COMBAT;
        }
        
        this.updateUI();
    },
    
    handleCombat(attackingCard, defendingCard) {
        const attackerColor = attackingCard.color;
        const defenderColor = defendingCard.color;
        
        if (attackerColor === defenderColor) {
            // Both cards are defeated
            return { result: 'BOTH_DEFEATED' };
        }
        
        const difference = Math.abs(attackerColor - defenderColor);
        const newColor = attackerColor > defenderColor ? 
            defenderColor - difference : 
            defenderColor + difference;
            
        return {
            result: 'COLOR_CHANGE',
            newColor: CardColor.fromValue(newColor)
        };
    },
    
    handleAITurn() {
        // Draw phase is handled in startTurn
        
        // Play phase - play a random card
        if (this.state.aiHand.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.state.aiHand.length);
            const card = this.state.aiHand[randomIndex];
            this.state.aiHand.splice(randomIndex, 1);
            this.state.aiChampionZone.push(card);
        }
        
        // Combat phase
        if (this.state.aiChampionZone.length > 0) {
            const attackingCard = this.state.aiChampionZone[this.state.aiChampionZone.length - 1];
            
            if (this.state.playerChampionZone.length > 0) {
                const defendingCard = this.state.playerChampionZone[this.state.playerChampionZone.length - 1];
                const result = this.handleCombat(attackingCard, defendingCard);
                
                if (result.result === 'BOTH_DEFEATED') {
                    this.state.aiTombPile.push(attackingCard);
                    this.state.playerTombPile.push(defendingCard);
                    this.state.aiChampionZone.pop();
                    this.state.playerChampionZone.pop();
                } else {
                    defendingCard.color = result.newColor;
                    if (defendingCard.color === CardColor.BLACK || defendingCard.color === CardColor.WHITE) {
                        this.state.playerTombPile.push(defendingCard);
                        this.state.playerChampionZone.pop();
                    }
                }
            } else {
                // Direct attack
                this.state.playerLife -= attackingCard.color;
                if (this.state.playerLife <= 0) {
                    this.endGame(GameResult.AI_WIN);
                }
            }
        }
        
        // End turn
        this.state.isPlayerTurn = true;
        this.startTurn();
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
        
        // Update phase indicator
        document.querySelector('.phase-indicator').textContent = 
            `${this.state.isPlayerTurn ? 'Your' : 'Opponent\'s'} Turn - ${this.state.currentPhase} Phase`;
        
        // Show/hide next phase button
        const nextPhaseBtn = document.querySelector('.next-phase-btn');
        if (nextPhaseBtn) {
            nextPhaseBtn.style.display = this.state.isPlayerTurn ? 'block' : 'none';
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
    
    render(container) {
        const gameSettings = gameStorage.getGameSettings();
        const playerData = gameStorage.getUserData();
        
        container.innerHTML = `
            <div class="game-container">
                <div class="game-board">
                    <!-- AI Section -->
                    <div class="player-section ai-section">
                        <div class="player-info">
                            <img src="${gameSettings.aiAvatar}" alt="AI" class="avatar">
                            <div class="player-details">
                                <div class="player-name">${gameSettings.aiName}</div>
                                <div class="life-total ai-life">7</div>
                            </div>
                        </div>
                        
                        <div class="game-zones">
                            <div class="deck-zone" title="AI's Deck">
                                <div class="card card-back"></div>
                                <span class="zone-count ai-deck-count">0</span>
                            </div>
                            
                            <div class="hand-zone">
                                <div class="ai-hand"></div>
                                <span class="zone-count ai-hand-count">0</span>
                            </div>
                            
                            <div class="champion-zone">
                                <div class="ai-champion-zone"></div>
                            </div>
                            
                            <div class="tomb-zone" title="AI's Tomb">
                                <div class="card card-back"></div>
                                <span class="zone-count ai-tomb-count">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Center Section -->
                    <div class="center-section">
                        <div class="phase-indicator">Waiting to start...</div>
                        <button class="btn btn-primary next-phase-btn" style="display: none;">
                            Next Phase
                        </button>
                    </div>
                    
                    <!-- Player Section -->
                    <div class="player-section">
                        <div class="game-zones">
                            <div class="deck-zone" title="Your Deck">
                                <div class="card card-back"></div>
                                <span class="zone-count player-deck-count">0</span>
                            </div>
                            
                            <div class="hand-zone">
                                <div class="player-hand"></div>
                            </div>
                            
                            <div class="champion-zone">
                                <div class="player-champion-zone"></div>
                            </div>
                            
                            <div class="tomb-zone" title="Your Tomb">
                                <div class="card card-back"></div>
                                <span class="zone-count player-tomb-count">0</span>
                            </div>
                        </div>
                        
                        <div class="player-info">
                            <img src="${playerData.avatar}" alt="Player" class="avatar">
                            <div class="player-details">
                                <div class="player-name">${playerData.name}</div>
                                <div class="life-total player-life">7</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners(container);
    },
    
    attachEventListeners(container) {
        // Card click handlers
        container.addEventListener('click', (e) => {
            const cardElement = e.target.closest('.player-hand .card');
            if (cardElement && this.state.isPlayerTurn) {
                const cardIndex = Array.from(cardElement.parentNode.children).indexOf(cardElement);
                this.playCard(cardIndex);
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
                
                switch (this.state.currentPhase) {
                    case GamePhase.PLAY:
                        this.state.currentPhase = GamePhase.COMBAT;
                        break;
                    case GamePhase.COMBAT:
                        this.state.isPlayerTurn = false;
                        this.startTurn();
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
    }
};

// Make the page handler available globally
window.GamePage = GamePage; 
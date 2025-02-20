class Player {
    constructor(name, avatar, deck) {
        this.name = name;
        this.avatar = avatar;
        this.life = GAME_CONSTANTS.STARTING_LIFE;
        this.deck = deck.clone();
        this.hand = [];
        this.championZone = [];
        this.tombPile = [];
    }
    
    // Initialize the player for a new game
    initialize() {
        this.life = GAME_CONSTANTS.STARTING_LIFE;
        this.deck.reset();
        this.deck.shuffle();
        this.hand = [];
        this.championZone = [];
        this.tombPile = [];
    }
    
    // Draw a card from the deck
    drawCard() {
        if (this.deck.getSize() === 0) {
            return null;
        }
        
        const card = this.deck.drawCard();
        if (card) {
            this.hand.push(card);
            gameEvents.emit(GameEvents.CARD_DRAWN, {
                player: this.name,
                card: card
            });
        }
        return card;
    }
    
    // Draw multiple cards
    drawCards(count) {
        const drawnCards = [];
        for (let i = 0; i < count; i++) {
            const card = this.drawCard();
            if (card) {
                drawnCards.push(card);
            }
        }
        return drawnCards;
    }
    
    // Play a card from hand
    playCard(cardId) {
        const cardIndex = this.hand.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            throw new Error('Card not found in hand');
        }
        
        const card = this.hand.splice(cardIndex, 1)[0];
        this.championZone.push(card);
        
        gameEvents.emit(GameEvents.CARD_PLAYED, {
            player: this.name,
            card: card
        });
        
        return card;
    }
    
    // Move a card to the tomb pile
    moveToTomb(card) {
        const zoneIndex = this.championZone.findIndex(c => c.id === card.id);
        if (zoneIndex !== -1) {
            this.championZone.splice(zoneIndex, 1);
            this.tombPile.push(card);
        }
    }
    
    // Change life total
    changeLife(amount) {
        this.life = Math.max(CardColor.BLACK, Math.min(CardColor.WHITE, this.life + amount));
        
        gameEvents.emit(GameEvents.LIFE_CHANGED, {
            player: this.name,
            life: this.life
        });
        
        return this.life;
    }
    
    // Check if the player has lost
    hasLost() {
        return this.life <= CardColor.BLACK;
    }
    
    // Get the number of cards in hand
    getHandSize() {
        return this.hand.length;
    }
    
    // Get the number of cards in deck
    getDeckSize() {
        return this.deck.getSize();
    }
    
    // Get the number of cards in tomb
    getTombSize() {
        return this.tombPile.length;
    }
    
    // Create HTML element for player info
    toHTML(options = {}) {
        const {
            showHand = false,
            showDeck = true,
            showTomb = true,
            isOpponent = false
        } = options;
        
        const playerElement = document.createElement('div');
        playerElement.className = `player-info${isOpponent ? ' opponent' : ''}`;
        
        // Avatar and life
        const infoSection = document.createElement('div');
        infoSection.className = 'player-info-section';
        
        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar';
        avatarImg.src = this.avatar;
        avatarImg.alt = this.name;
        
        const nameElement = document.createElement('div');
        nameElement.className = 'player-name';
        nameElement.textContent = this.name;
        
        const lifeElement = document.createElement('div');
        lifeElement.className = 'life-total';
        lifeElement.textContent = this.life;
        lifeElement.style.color = CardColor.toCSS(this.life);
        
        infoSection.appendChild(avatarImg);
        infoSection.appendChild(nameElement);
        infoSection.appendChild(lifeElement);
        
        playerElement.appendChild(infoSection);
        
        // Game zones
        const zonesSection = document.createElement('div');
        zonesSection.className = 'player-zones';
        
        if (showDeck) {
            const deckZone = document.createElement('div');
            deckZone.className = 'card-zone deck-zone';
            deckZone.setAttribute('data-count', this.getDeckSize());
            
            if (this.getDeckSize() > 0) {
                const topCard = document.createElement('img');
                topCard.src = 'images/back.png';
                topCard.alt = 'Deck';
                deckZone.appendChild(topCard);
            }
            
            zonesSection.appendChild(deckZone);
        }
        
        // Champion zone
        const championZone = document.createElement('div');
        championZone.className = 'card-zone champion-zone';
        
        if (this.championZone.length > 0) {
            const championCard = this.championZone[this.championZone.length - 1];
            championZone.appendChild(championCard.toHTML({
                showBack: isOpponent,
                showEffects: !isOpponent
            }));
        }
        
        zonesSection.appendChild(championZone);
        
        if (showTomb) {
            const tombZone = document.createElement('div');
            tombZone.className = 'card-zone tomb-zone';
            tombZone.setAttribute('data-count', this.getTombSize());
            
            if (this.getTombSize() > 0) {
                const topCard = this.tombPile[this.tombPile.length - 1];
                tombZone.appendChild(topCard.toHTML({ showEffects: true }));
            }
            
            zonesSection.appendChild(tombZone);
        }
        
        playerElement.appendChild(zonesSection);
        
        // Hand
        if (showHand) {
            const handElement = document.createElement('div');
            handElement.className = 'hand-area';
            
            this.hand.forEach(card => {
                handElement.appendChild(card.toHTML({
                    showBack: isOpponent,
                    showEffects: !isOpponent,
                    isPlayable: !isOpponent
                }));
            });
            
            playerElement.appendChild(handElement);
        }
        
        return playerElement;
    }
}

// Export the Player class
window.Player = Player; 
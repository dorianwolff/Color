class Deck {
    constructor(name = 'New Deck') {
        this.id = GameUtils.generateUniqueId();
        this.name = name;
        this.cards = [];
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
    }
    
    // Add a card to the deck
    addCard(card) {
        if (this.cards.length >= GAME_CONSTANTS.DECK_SIZE) {
            throw new Error(ErrorMessages.INVALID_DECK_SIZE);
        }
        
        this.cards.push(card.clone());
        this.updatedAt = Date.now();
    }
    
    // Remove a card from the deck
    removeCard(cardId) {
        const index = this.cards.findIndex(card => card.id === cardId);
        if (index !== -1) {
            this.cards.splice(index, 1);
            this.updatedAt = Date.now();
        }
    }
    
    // Get the number of cards in the deck
    getSize() {
        return this.cards.length;
    }
    
    // Check if the deck is valid
    isValid() {
        return this.cards.length === GAME_CONSTANTS.DECK_SIZE;
    }
    
    // Shuffle the deck
    shuffle() {
        this.cards = GameUtils.shuffleArray([...this.cards]);
    }
    
    // Draw a card from the deck
    drawCard() {
        if (this.cards.length === 0) {
            return null;
        }
        return this.cards.pop();
    }
    
    // Reset all cards in the deck to their base state
    reset() {
        this.cards.forEach(card => card.reset());
    }
    
    // Get a copy of the deck for gameplay
    clone() {
        const clonedDeck = new Deck(this.name);
        clonedDeck.id = this.id;
        clonedDeck.cards = this.cards.map(card => card.clone());
        clonedDeck.createdAt = this.createdAt;
        clonedDeck.updatedAt = this.updatedAt;
        return clonedDeck;
    }
    
    // Get deck data for storage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            cards: this.cards.map(card => card.toJSON()),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    
    // Create a deck from stored data
    static fromJSON(data) {
        const deck = new Deck(data.name);
        deck.id = data.id;
        deck.cards = data.cards.map(cardData => Card.fromJSON(cardData));
        deck.createdAt = data.createdAt;
        deck.updatedAt = data.updatedAt;
        return deck;
    }
    
    // Create HTML element for deck preview
    toHTML(options = {}) {
        const {
            showCardCount = true,
            isSelectable = false,
            isEditable = false,
            isDeletable = false,
            onSelect = null,
            onEdit = null,
            onDelete = null
        } = options;
        
        const deckElement = document.createElement('div');
        deckElement.className = 'deck-preview card';
        
        const header = document.createElement('div');
        header.className = 'deck-preview-header';
        
        const title = document.createElement('h3');
        title.textContent = this.name;
        header.appendChild(title);
        
        if (showCardCount) {
            const cardCount = document.createElement('span');
            cardCount.className = 'deck-card-count';
            cardCount.textContent = `${this.cards.length}/${GAME_CONSTANTS.DECK_SIZE} cards`;
            header.appendChild(cardCount);
        }
        
        const actions = document.createElement('div');
        actions.className = 'deck-actions';
        
        if (isSelectable) {
            const selectButton = document.createElement('button');
            selectButton.className = 'btn btn-primary';
            selectButton.textContent = 'Select';
            selectButton.addEventListener('click', () => onSelect?.(this));
            actions.appendChild(selectButton);
        }
        
        if (isEditable) {
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-secondary';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => onEdit?.(this));
            actions.appendChild(editButton);
        }
        
        if (isDeletable) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-secondary';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this deck?')) {
                    onDelete?.(this);
                }
            });
            actions.appendChild(deleteButton);
        }
        
        header.appendChild(actions);
        deckElement.appendChild(header);
        
        // Preview first few cards
        const cardPreview = document.createElement('div');
        cardPreview.className = 'deck-card-preview';
        
        const previewCards = this.cards.slice(0, 3);
        previewCards.forEach(card => {
            const miniCard = card.toHTML({ showEffects: false });
            miniCard.style.transform = 'scale(0.5)';
            cardPreview.appendChild(miniCard);
        });
        
        deckElement.appendChild(cardPreview);
        
        return deckElement;
    }
}

// Export the Deck class
window.Deck = Deck; 
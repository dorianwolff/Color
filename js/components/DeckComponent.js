class DeckComponent {
    constructor(deck, options = {}) {
        this.deck = deck;
        this.options = {
            isActive: false,
            isEditable: false,
            isSelectable: false,
            isDeletable: false,
            showCardCount: true,
            onSelect: null,
            onEdit: null,
            onDelete: null,
            onCardClick: null,
            ...options
        };
        
        this.element = this.render();
        this.setupEventListeners();
    }
    
    render() {
        const element = document.createElement('div');
        element.className = `deck-preview ${this.options.isActive ? 'active' : ''}`;
        
        // Header section
        const header = this.createHeader();
        element.appendChild(header);
        
        // Cards preview section
        const cardsPreview = this.createCardsPreview();
        element.appendChild(cardsPreview);
        
        // Actions section
        const actions = this.createActions();
        element.appendChild(actions);
        
        // Active indicator
        if (this.options.isActive) {
            const activeIndicator = document.createElement('div');
            activeIndicator.className = 'active-indicator';
            activeIndicator.innerHTML = '<span>Active</span>';
            element.appendChild(activeIndicator);
        }
        
        return element;
    }
    
    createHeader() {
        const header = document.createElement('div');
        header.className = 'deck-preview-header';
        
        // Deck name
        const title = document.createElement('h3');
        title.textContent = this.deck.name;
        header.appendChild(title);
        
        // Card count
        if (this.options.showCardCount) {
            const cardCount = document.createElement('span');
            cardCount.className = 'deck-card-count';
            cardCount.textContent = `${this.deck.cards.length}/10 cards`;
            header.appendChild(cardCount);
        }
        
        return header;
    }
    
    createCardsPreview() {
        const preview = document.createElement('div');
        preview.className = 'deck-card-preview';
        
        // Show first few cards
        const previewCards = this.deck.cards.slice(0, 3);
        previewCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'preview-card';
            cardElement.style.backgroundImage = `url(${card.imagePath})`;
            preview.appendChild(cardElement);
        });
        
        return preview;
    }
    
    createActions() {
        const actions = document.createElement('div');
        actions.className = 'deck-actions';
        
        if (this.options.isSelectable) {
            const selectButton = document.createElement('button');
            selectButton.className = 'btn btn-primary';
            selectButton.textContent = 'Set Active';
            selectButton.onclick = () => this.options.onSelect?.(this.deck);
            actions.appendChild(selectButton);
        }
        
        if (this.options.isEditable) {
            const editButton = document.createElement('button');
            editButton.className = 'btn';
            editButton.textContent = 'Edit';
            editButton.onclick = () => this.options.onEdit?.(this.deck);
            actions.appendChild(editButton);
        }
        
        if (this.options.isDeletable) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger';
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => this.options.onDelete?.(this.deck);
            actions.appendChild(deleteButton);
        }
        
        return actions;
    }
    
    setupEventListeners() {
        // Add any additional event listeners here
    }
    
    // Update deck state
    update(deck, options = {}) {
        this.deck = deck;
        this.options = { ...this.options, ...options };
        
        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
        
        this.setupEventListeners();
    }
    
    // Get the DOM element
    getElement() {
        return this.element;
    }
    
    // Get color distribution
    getColorDistribution() {
        const distribution = new Array(8).fill(0); // 8 colors (0-7)
        this.deck.cards.forEach(card => {
            distribution[card.baseColor]++;
        });
        return distribution;
    }
    
    // Get average color value
    getAverageColor() {
        if (this.deck.cards.length === 0) return 0;
        const sum = this.deck.cards.reduce((acc, card) => acc + card.baseColor, 0);
        return (sum / this.deck.cards.length).toFixed(1);
    }
    
    // Check if the deck is valid
    isValid() {
        return this.deck.isValid();
    }
}

// Export the DeckComponent class
window.DeckComponent = DeckComponent; 
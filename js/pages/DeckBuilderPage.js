class DeckBuilderPage {
    constructor() {
        this.deck = new Deck();
        this.allCards = CardDatabase.getAllCards();
        this.filteredCards = [...this.allCards];
        this.colorFilter = null;
        this.searchQuery = '';
    }

    static init(container, params = {}) {
        const page = new DeckBuilderPage();
        
        if (params.deckId) {
            // If editing an existing deck
            const savedDeck = gameStorage.getDeck(params.deckId);
            if (savedDeck) {
                page.deck = savedDeck;
                page.persistDeckState();
            }
        } else {
            // Check if we're returning to an in-progress deck build
            const persistedDeck = localStorage.getItem('currentDeckBuilderState');
            if (persistedDeck) {
                try {
                    const deckData = JSON.parse(persistedDeck);
                    page.deck = new Deck(deckData.name);
                    page.deck.id = deckData.id;
                    // Create new Card instances from the persisted data
                    page.deck.cards = deckData.cards.map(cardData => 
                        new Card(
                            cardData.name,
                            CardColor[cardData.baseColor.name.toUpperCase()],
                            cardData.imageNumber,
                            cardData.baseEffects,
                            cardData.baseEffectDescriptions
                        )
                    );
                } catch (error) {
                    console.error('Error loading persisted deck:', error);
                    localStorage.removeItem('currentDeckBuilderState');
                }
            }
        }
        
        page.render(container);
        page.attachEventListeners();
    }

    render(container) {
        container.innerHTML = `
            <div class="deck-builder">
                <div class="deck-builder-header">
                    <h1>Deck Builder</h1>
                    <div class="deck-actions">
                        <button class="btn btn-primary" id="save-deck">Save Deck</button>
                        <button class="btn" id="view-all-decks">View All Decks</button>
                    </div>
                </div>
                
                <div class="deck-builder-content">
                    <div class="deck-builder-sidebar">
                        <div class="deck-info">
                            <input type="text" class="input" id="deck-name" placeholder="Deck Name" value="${this.deck.name || ''}">
                            <div class="deck-stats">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>Cards: ${this.deck.cards.length}/10</span>
                                    ${this.deck.cards.length > 0 ? '<button class="btn btn-danger" id="remove-all-cards">Remove All</button>' : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div class="deck-preview" id="deck-preview">
                            ${this.renderDeckCards()}
                        </div>
                    </div>
                    
                    <div class="card-browser">
                        <div class="card-filters">
                            <input type="text" 
                                   class="input search-bar" 
                                   id="card-search" 
                                   placeholder="Search cards..."
                                   value="${this.searchQuery}">
                            <select class="input" id="color-filter">
                                <option value="">All Colors</option>
                                <option value="BLACK">Black</option>
                                <option value="RED">Red</option>
                                <option value="ORANGE">Orange</option>
                                <option value="YELLOW">Yellow</option>
                                <option value="GREEN">Green</option>
                                <option value="BLUE">Blue</option>
                                <option value="PURPLE">Purple</option>
                                <option value="WHITE">White</option>
                            </select>
                        </div>
                        
                        <div class="available-cards" id="available-cards">
                            ${this.renderAvailableCards()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for remove all button after rendering
        const removeAllBtn = document.getElementById('remove-all-cards');
        if (removeAllBtn) {
            removeAllBtn.onclick = () => {
                if (confirm('Are you sure you want to remove all cards from the deck?')) {
                    this.deck.cards = [];
                    this.updateUI();
                }
            };
        }
    }

    renderDeckCards() {
        return this.deck.cards.map(card => this.renderCard(card, true)).join('');
    }

    renderAvailableCards() {
        return this.filteredCards.map(card => this.renderCard(card, false)).join('');
    }

    getCardColorCSS(card) {
        const colorName = card.getColorName().toLowerCase();
        return `var(--card-${colorName})`;
    }

    renderCard(card, inDeck) {
        const cardCount = this.deck.cards.filter(c => c.id === card.id).length;
        const disabled = !inDeck && cardCount >= 2;
        const colorCSS = this.getCardColorCSS(card);
        
        return `
            <div class="card ${disabled ? 'disabled' : ''}" 
                 data-card-id="${card.id}" 
                 data-in-deck="${inDeck}"
                 style="border-color: ${colorCSS}">
                <div class="card-image">
                    <img src="${card.imagePath}" alt="${card.name}">
                </div>
                <div class="card-tooltip">
                    <div class="card-tooltip-header">
                        <span class="card-tooltip-name">${card.name}</span>
                        <span class="card-tooltip-color" style="color: ${colorCSS}">${card.getColorName()}</span>
                    </div>
                    <div class="card-tooltip-effect">
                        <div class="card-tooltip-effect-title">${card.baseEffects[0] || 'No Effect'}</div>
                        <div class="card-tooltip-effect-desc">${card.baseEffectDescriptions[0] || 'No effect description available.'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Color filter
        const colorFilter = document.getElementById('color-filter');
        colorFilter.addEventListener('change', (e) => {
            this.colorFilter = e.target.value;
            this.updateFilteredCards();
        });

        // Search input
        const searchInput = document.getElementById('card-search');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.updateFilteredCards();
        });

        // Save deck
        document.getElementById('save-deck').addEventListener('click', () => this.saveDeck());

        // View all decks
        document.getElementById('view-all-decks').addEventListener('click', () => {
            router.navigate(Routes.DECKS);
        });

        // Card clicking in available cards
        document.getElementById('available-cards').addEventListener('click', (e) => {
            const cardElement = e.target.closest('.card');
            if (!cardElement || cardElement.classList.contains('disabled')) return;
            
            const cardId = cardElement.dataset.cardId;
            const card = this.allCards.find(c => c.id === cardId);
            
            if (card && this.deck.cards.length < 10) {
                this.deck.addCard(card);
                this.updateUI();
            }
        });

        // Card clicking in deck preview
        document.getElementById('deck-preview').addEventListener('click', (e) => {
            const cardElement = e.target.closest('.card');
            if (!cardElement) return;
            
            const cardId = cardElement.dataset.cardId;
            const cardIndex = this.deck.cards.findIndex(c => c.id === cardId);
            
            if (cardIndex !== -1) {
                this.deck.cards.splice(cardIndex, 1);
                this.updateUI();
            }
        });

        // Add tooltip positioning logic
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const cardRect = card.getBoundingClientRect();
                const tooltip = card.querySelector('.card-tooltip');
                if (!tooltip) return;

                // Remove all position classes
                card.classList.remove('tooltip-left', 'tooltip-right', 'tooltip-top', 'tooltip-bottom');

                // Get the container (either deck-preview or available-cards)
                const container = card.closest('.deck-preview') || card.closest('.available-cards');
                if (!container) return;

                const containerRect = container.getBoundingClientRect();
                const tooltipWidth = 250; // Width from CSS

                // Calculate space available on both sides within the container
                const spaceOnRight = containerRect.right - cardRect.right;
                const spaceOnLeft = cardRect.left - containerRect.left;

                // Position tooltip on the side with more space
                if (spaceOnRight >= spaceOnLeft) {
                    // Default position (right) - no class needed
                    tooltip.style.left = 'calc(100% + 8px)';
                    tooltip.style.right = 'auto';
                } else {
                    card.classList.add('tooltip-left');
                    tooltip.style.right = 'calc(100% + 8px)';
                    tooltip.style.left = 'auto';
                }
            });
        });
    }

    updateFilteredCards() {
        this.filteredCards = [...this.allCards];
        
        // Apply search filter
        if (this.searchQuery) {
            this.filteredCards = this.filteredCards.filter(card => 
                card.name.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // Apply color filter
        if (this.colorFilter) {
            this.filteredCards = this.filteredCards.filter(card => 
                card.baseColor.name.toUpperCase() === this.colorFilter
            );
        }
        
        const availableCardsContainer = document.getElementById('available-cards');
        availableCardsContainer.innerHTML = this.renderAvailableCards();
    }

    updateUI() {
        // Update deck preview
        const deckPreview = document.getElementById('deck-preview');
        deckPreview.innerHTML = this.renderDeckCards();
        
        // Update deck stats
        const deckStats = document.querySelector('.deck-stats');
        deckStats.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Cards: ${this.deck.cards.length}/10</span>
                ${this.deck.cards.length > 0 ? '<button class="btn btn-danger" id="remove-all-cards">Remove All</button>' : ''}
            </div>
        `;
        
        // Update available cards (to reflect any changes in card limits)
        const availableCards = document.getElementById('available-cards');
        availableCards.innerHTML = this.renderAvailableCards();
        
        // Persist current deck state
        this.persistDeckState();
        
        // Add event listener for remove all button
        const removeAllBtn = document.getElementById('remove-all-cards');
        if (removeAllBtn) {
            removeAllBtn.onclick = () => {
                if (confirm('Are you sure you want to remove all cards from the deck?')) {
                    this.deck.cards = [];
                    this.updateUI();
                }
            };
        }

        // Reattach tooltip positioning logic for all cards
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const cardRect = card.getBoundingClientRect();
                const tooltip = card.querySelector('.card-tooltip');
                if (!tooltip) return;

                // Remove all position classes
                card.classList.remove('tooltip-left', 'tooltip-right', 'tooltip-top', 'tooltip-bottom');

                // Get the container (either deck-preview or available-cards)
                const container = card.closest('.deck-preview') || card.closest('.available-cards');
                if (!container) return;

                const containerRect = container.getBoundingClientRect();
                const tooltipWidth = 250; // Width from CSS

                // Calculate space available on both sides within the container
                const spaceOnRight = containerRect.right - cardRect.right;
                const spaceOnLeft = cardRect.left - containerRect.left;

                // Position tooltip on the side with more space
                if (spaceOnRight >= spaceOnLeft) {
                    // Default position (right) - no class needed
                    tooltip.style.left = 'calc(100% + 8px)';
                    tooltip.style.right = 'auto';
                } else {
                    card.classList.add('tooltip-left');
                    tooltip.style.right = 'calc(100% + 8px)';
                    tooltip.style.left = 'auto';
                }
            });
        });
    }

    persistDeckState() {
        const deckState = {
            id: this.deck.id,
            name: this.deck.name,
            cards: this.deck.cards.map(card => ({
                id: card.id,
                name: card.name,
                baseColor: card.baseColor,
                imageNumber: card.imageNumber,
                baseEffects: card.baseEffects,
                baseEffectDescriptions: card.baseEffectDescriptions
            }))
        };
        localStorage.setItem('currentDeckBuilderState', JSON.stringify(deckState));
    }

    saveDeck() {
        if (this.deck.cards.length !== 10) {
            alert('A deck must contain exactly 10 cards.');
            return;
        }

        const deckName = document.getElementById('deck-name').value.trim();
        if (!deckName) {
            alert('Please give your deck a name.');
            return;
        }

        this.deck.name = deckName;
        gameStorage.saveDeck(this.deck);
        // Clear the persisted deck state when saving and exiting
        localStorage.removeItem('currentDeckBuilderState');
        router.navigate(Routes.DECKS);
    }
}

// Export the page
window.DeckBuilderPage = DeckBuilderPage;

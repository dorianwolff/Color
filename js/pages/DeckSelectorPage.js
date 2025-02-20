class DeckSelectorPage {
    static init(container) {
        const decks = gameStorage.getAllDecks();
        const settings = gameStorage.getSettings();
        
        // If there's only one deck and no active deck, set it as active
        if (decks.length === 1 && !settings.activeDeckId) {
            gameStorage.setActiveDeck(decks[0].id);
        }
        
        const activeDeckId = gameStorage.getSettings().activeDeckId;
        
        container.innerHTML = `
            <div class="decks-page">
                <header class="page-header">
                    <div class="header-content">
                        <div class="header-left">
                            <button class="btn" id="back-to-menu-btn">
                                <span class="icon">←</span>
                                Back to Menu
                            </button>
                        </div>
                        <h2>Your Decks</h2>
                        <button class="btn btn-primary" id="create-deck-btn">
                            <span class="icon">➕</span>
                            Create New Deck
                        </button>
                    </div>
                </header>
                
                <div class="decks-grid" id="decks-container">
                    ${this.renderDecksList(decks, activeDeckId)}
                </div>
                
                ${decks.length === 0 ? this.renderEmptyState() : ''}
            </div>
        `;

        // Attach event listeners
        this.setupEventListeners(container, decks, activeDeckId);
    }
    
    static renderDecksList(decks, activeDeckId) {
        if (decks.length === 0) {
            return '';
        }
        
        return decks
            .map(deck => `
                <div class="deck-preview ${deck.id === activeDeckId ? 'active' : ''}" data-deck-id="${deck.id}">
                    <div class="deck-preview-header">
                        <h3>${deck.name}</h3>
                        <span class="deck-card-count">${deck.cards.length}/10 cards</span>
                    </div>
                    
                    <div class="deck-card-preview">
                        ${deck.cards.slice(0, 3).map(card => `
                            <div class="preview-card" style="background-image: url(${card.imagePath})"></div>
                        `).join('')}
                    </div>
                    
                    <div class="deck-actions">
                        ${deck.id !== activeDeckId ? `
                            <button class="btn btn-primary set-active-btn" data-deck-id="${deck.id}">Set Active</button>
                        ` : ''}
                        <button class="btn edit-deck-btn" data-deck-id="${deck.id}">Edit</button>
                        <button class="btn btn-danger delete-deck-btn" data-deck-id="${deck.id}">Delete</button>
                    </div>
                    
                    ${deck.id === activeDeckId ? `
                        <div class="active-indicator">
                            <span>Active</span>
                        </div>
                    ` : ''}
                </div>
            `)
            .join('');
    }
    
    static renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-content">
                    <span class="icon">🎴</span>
                    <h3>No Decks Yet</h3>
                    <p>Create your first deck to start playing!</p>
                    <button class="btn btn-primary" id="create-deck-empty-btn">
                        Create New Deck
                    </button>
                </div>
            </div>
        `;
    }
    
    static setupEventListeners(container, decks, activeDeckId) {
        // Back to menu button
        container.querySelector('#back-to-menu-btn').onclick = () => {
            router.navigate(Routes.HOME);
        };

        // Create deck buttons
        container.querySelectorAll('#create-deck-btn, #create-deck-empty-btn').forEach(btn => {
            btn.onclick = () => router.navigate(Routes.DECK_BUILDER);
        });

        // Set active buttons
        container.querySelectorAll('.set-active-btn').forEach(btn => {
            btn.onclick = () => {
                const deckId = btn.dataset.deckId;
                const deck = decks.find(d => d.id === deckId);
                if (deck) {
                    this.handleSelectDeck(deck);
                }
            };
        });

        // Edit buttons
        container.querySelectorAll('.edit-deck-btn').forEach(btn => {
            btn.onclick = () => {
                const deckId = btn.dataset.deckId;
                const deck = decks.find(d => d.id === deckId);
                if (deck) {
                    this.handleEditDeck(deck);
                }
            };
        });

        // Delete buttons
        container.querySelectorAll('.delete-deck-btn').forEach(btn => {
            btn.onclick = () => {
                const deckId = btn.dataset.deckId;
                const deck = decks.find(d => d.id === deckId);
                if (deck) {
                    this.handleDeleteDeck(deck);
                }
            };
        });
    }
    
    static handleSelectDeck(deck) {
        gameStorage.setActiveDeck(deck.id);
        this.refreshPage();
    }
    
    static handleEditDeck(deck) {
        router.navigate(Routes.DECK_BUILDER, { deckId: deck.id });
    }
    
    static handleDeleteDeck(deck) {
        const isActive = gameStorage.getSettings().activeDeckId === deck.id;
        const message = isActive 
            ? 'This is your active deck. Are you sure you want to delete it? This action cannot be undone.'
            : 'Are you sure you want to delete this deck? This action cannot be undone.';
            
        if (confirm(message)) {
            gameStorage.deleteDeck(deck.id);
            this.refreshPage();
        }
    }
    
    static refreshPage() {
        const container = document.getElementById('main-content');
        this.init(container);
    }
}

// Register the deck selector page
router.register(Routes.DECKS, DeckSelectorPage); 
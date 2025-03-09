// Define the AI Selector Page class
const AISelectorPage = {
    init(container) {
        console.log('Initializing AI Selector Page');
        const activeDeck = gameStorage.getActiveDeck();
        console.log('Active Deck:', activeDeck);
        
        const aiOpponents = [
            {
                id: 'easy',
                name: 'Novice AI',
                description: 'A beginner-friendly AI that plays basic strategies.',
                icon: '🤖',
                difficulty: 'EASY',
                style: 'Balanced',
                avatar: 'images/ai/basic.jpg'
            },
            {
                id: 'medium',
                name: 'Tactical AI',
                description: 'An intermediate AI that employs tactical card combinations.',
                icon: '🎯',
                difficulty: 'MEDIUM',
                style: 'Aggressive',
                avatar: 'images/ai/intermediate.jpg'
            },
            {
                id: 'hard',
                name: 'Master AI',
                description: 'An advanced AI that uses complex strategies and card synergies.',
                icon: '⚔️',
                difficulty: 'HARD',
                style: 'Strategic',
                avatar: 'images/ai/hard.jpg'
            }
        ];

        container.innerHTML = `
            <div class="ai-selector-page">
                <div class="page-header">
                    <div class="header-content">
                        <div class="header-left">
                            <button class="btn" id="back-btn">
                                <span class="icon">←</span>
                                Back to Menu
                            </button>
                        </div>
                        <h2>Select Opponent</h2>
                        <div class="header-right"></div>
                    </div>
                </div>

                <div class="ai-selection-content">
                    <div class="content-wrapper">
                        <aside class="active-deck-section">
                            <h3>Playing with:</h3>
                            <div class="active-deck-preview">
                                ${this.renderActiveDeck(activeDeck)}
                            </div>
                        </aside>

                        <main class="ai-opponents-section">
                            <div class="difficulty-filters">
                                <button class="btn filter-btn active" data-difficulty="all">All</button>
                                <button class="btn filter-btn" data-difficulty="easy">Easy</button>
                                <button class="btn filter-btn" data-difficulty="medium">Medium</button>
                                <button class="btn filter-btn" data-difficulty="hard">Hard</button>
                            </div>

                            <div class="ai-opponents-grid">
                                ${aiOpponents.map(ai => `
                                    <div class="ai-opponent-card" data-ai-id="${ai.id}" data-difficulty="${ai.difficulty.toLowerCase()}">
                                        <div class="ai-opponent-header">
                                            <div class="ai-opponent-icon">
                                                <span class="icon">${ai.icon}</span>
                                            </div>
                                            <div class="difficulty-badge ${ai.difficulty.toLowerCase()}">
                                                ${ai.difficulty}
                                            </div>
                                        </div>
                                        
                                        <div class="ai-opponent-info">
                                            <h3>${ai.name}</h3>
                                            <p class="ai-description">${ai.description}</p>
                                            <div class="ai-stats">
                                                <div class="ai-stat">
                                                    <span class="stat-label">Play Style</span>
                                                    <span class="stat-value">${ai.style}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button class="btn btn-primary select-ai-btn">
                                            Battle This Opponent
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;

        console.log('AI Selector Page HTML rendered');
        this.attachEventListeners(container);
        console.log('Event listeners attached');
    },

    renderActiveDeck(deck) {
        if (!deck) {
            return `
                <div class="no-active-deck">
                    <span class="icon">⚠️</span>
                    <h4>No Active Deck Selected</h4>
                    <p>Please select or create a deck first</p>
                    <button class="btn btn-primary" onclick="router.navigate('${Routes.DECKS}')">
                        Select Deck
                    </button>
                </div>
            `;
        }

        return `
            <div class="deck-preview active">
                <div class="deck-preview-header">
                    <h3>${deck.name}</h3>
                    <span class="deck-card-count">${deck.cards.length}/10 cards</span>
                </div>
                <div class="deck-card-preview">
                    ${deck.cards.slice(0, 3).map(card => `
                        <div class="preview-card" style="background-image: url(${card.imagePath})"></div>
                    `).join('')}
                </div>
                <button class="btn" onclick="router.navigate('${Routes.DECK_BUILDER}', { deckId: '${deck.id}' })">
                    Edit Deck
                </button>
            </div>
        `;
    },

    attachEventListeners(container) {
        // Back button
        container.querySelector('#back-btn').onclick = () => {
            router.navigate(Routes.HOME);
        };

        // Difficulty filters
        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => {
                // Update active filter
                container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter AI opponents
                const difficulty = btn.dataset.difficulty;
                const cards = container.querySelectorAll('.ai-opponent-card');
                cards.forEach(card => {
                    if (difficulty === 'all' || card.dataset.difficulty === difficulty) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            };
        });

        // AI selection
        container.querySelectorAll('.select-ai-btn').forEach(btn => {
            btn.onclick = (e) => {
                const card = e.target.closest('.ai-opponent-card');
                const aiId = card.dataset.aiId;
                
                // Check if there's an active deck
                const activeDeck = gameStorage.getActiveDeck();
                if (!activeDeck) {
                    alert('Please select a deck first!');
                    router.navigate(Routes.DECKS);
                    return;
                }

                gameStorage.setGameSettings({ aiDifficulty: aiId });
                router.navigate(Routes.GAME);
            };
        });
    }
};

// Make the page handler available globally
window.AISelectorPage = AISelectorPage; 
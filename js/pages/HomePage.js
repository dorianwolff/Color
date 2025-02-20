class HomePage {
    static init(container) {
        const userData = gameStorage.getUserData();
        const stats = userData.stats;
        const winRate = stats.gamesPlayed > 0 
            ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
            : 0;

        container.innerHTML = `
            <div class="main-menu">
                <div class="menu-header">
                    <div class="player-profile">
                        <div class="avatar-container">
                            <img src="${userData.avatar}" alt="Player Avatar" class="player-avatar">
                        </div>
                        <div class="player-info">
                            <h2>${userData.name}</h2>
                            <div class="player-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Games Played</span>
                                    <span class="stat-value">${stats.gamesPlayed}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Win Rate</span>
                                    <span class="stat-value">${winRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="menu-content">
                    <div class="menu-section">
                        <h3>Quick Actions</h3>
                        <div class="action-buttons">
                            <button class="btn btn-primary btn-lg" id="play-game-btn">
                                <span class="icon">🎮</span>
                                Play Game
                            </button>
                            <button class="btn btn-primary btn-lg" id="deck-builder-btn">
                                <span class="icon">🎴</span>
                                Deck Builder
                            </button>
                        </div>
                    </div>

                    <div class="menu-section stats-overview">
                        <h3>Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">🏆</span>
                                    <span class="stat-title">Victories</span>
                                </div>
                                <div class="stat-card-value">${stats.gamesWon}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">❌</span>
                                    <span class="stat-title">Defeats</span>
                                </div>
                                <div class="stat-card-value">${stats.gamesLost}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">🤝</span>
                                    <span class="stat-title">Draws</span>
                                </div>
                                <div class="stat-card-value">${stats.gamesDraw}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">📊</span>
                                    <span class="stat-title">Total Games</span>
                                </div>
                                <div class="stat-card-value">${stats.gamesPlayed}</div>
                            </div>
                        </div>
                    </div>

                    <div class="menu-section">
                        <h3>Profile Actions</h3>
                        <div class="action-buttons secondary-actions">
                            <button class="btn" id="edit-profile-btn">
                                <span class="icon">👤</span>
                                Edit Profile
                            </button>
                            <button class="btn btn-danger" id="delete-account-btn">
                                <span class="icon">🗑️</span>
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners(container);
    }

    static attachEventListeners(container) {
        // Play Game button
        container.querySelector('#play-game-btn').onclick = () => {
            const activeDeck = gameStorage.getActiveDeck();
            if (!activeDeck) {
                alert('Please create and select a deck first!');
                router.navigate(Routes.DECKS);
                return;
            }
            router.navigate(Routes.AI_SELECTOR);
        };

        // Deck Builder button
        container.querySelector('#deck-builder-btn').onclick = () => {
            router.navigate(Routes.DECKS);
        };

        // Edit Profile button
        container.querySelector('#edit-profile-btn').onclick = () => {
            router.navigate(Routes.PROFILE);
        };

        // Delete Account button
        container.querySelector('#delete-account-btn').onclick = () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                gameStorage.clearAllData();
                location.reload();
            }
        };
    }
}

// Register the home page
window.HomePage = HomePage; 
class ProfilePage {
    static init(container) {
        const userData = gameStorage.getUserData();
        const stats = userData.stats;
        const winRate = stats.gamesPlayed > 0 
            ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
            : 0;

        container.innerHTML = `
            <div class="profile-page">
                <div class="page-header">
                    <div class="header-content">
                        <div class="header-left">
                            <button class="btn" id="back-btn">
                                <span class="icon">←</span>
                                Back to Menu
                            </button>
                        </div>
                        <h2>Profile Settings</h2>
                        <div class="header-right"></div>
                    </div>
                </div>

                <div class="profile-content">
                    <div class="profile-section">
                        <h3>Profile Information</h3>
                        <div class="profile-form">
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" id="username" class="input" value="${userData.name}">
                            </div>
                            <div class="form-group">
                                <label for="avatar">Avatar URL</label>
                                <input type="text" id="avatar" class="input" value="${userData.avatar}">
                            </div>
                            <button class="btn btn-primary" id="save-profile-btn">Save Changes</button>
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>Game Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">🎮</span>
                                    <span class="stat-title">Total Games</span>
                                </div>
                                <div class="stat-card-value">${stats.gamesPlayed}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">🏆</span>
                                    <span class="stat-title">Victories</span>
                                </div>
                                <div class="stat-card-value">${stats.gamesWon}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">📊</span>
                                    <span class="stat-title">Win Rate</span>
                                </div>
                                <div class="stat-card-value">${winRate}%</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-card-header">
                                    <span class="icon">🎴</span>
                                    <span class="stat-title">Total Decks</span>
                                </div>
                                <div class="stat-card-value">${gameStorage.getAllDecks().length}</div>
                            </div>
                        </div>
                    </div>

                    <div class="profile-section danger-zone">
                        <h3>Danger Zone</h3>
                        <div class="danger-actions">
                            <div class="danger-action">
                                <div class="danger-info">
                                    <h4>Reset Statistics</h4>
                                    <p>Reset all your game statistics to zero. This action cannot be undone.</p>
                                </div>
                                <button class="btn btn-danger" id="reset-stats-btn">Reset Stats</button>
                            </div>
                            <div class="danger-action">
                                <div class="danger-info">
                                    <h4>Delete All Decks</h4>
                                    <p>Delete all your custom decks. This action cannot be undone.</p>
                                </div>
                                <button class="btn btn-danger" id="delete-decks-btn">Delete All Decks</button>
                            </div>
                            <div class="danger-action">
                                <div class="danger-info">
                                    <h4>Delete Account</h4>
                                    <p>Delete your account and all associated data. This action cannot be undone.</p>
                                </div>
                                <button class="btn btn-danger" id="delete-account-btn">Delete Account</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners(container);
    }

    static attachEventListeners(container) {
        // Back button
        container.querySelector('#back-btn').onclick = () => {
            router.navigate(Routes.HOME);
        };

        // Save profile changes
        container.querySelector('#save-profile-btn').onclick = () => {
            const name = container.querySelector('#username').value.trim();
            const avatar = container.querySelector('#avatar').value.trim();

            if (!name) {
                alert('Username cannot be empty');
                return;
            }

            const userData = gameStorage.getUserData();
            userData.name = name;
            userData.avatar = avatar;
            gameStorage.setUserData(userData);

            alert('Profile updated successfully!');
        };

        // Reset stats
        container.querySelector('#reset-stats-btn').onclick = () => {
            if (confirm('Are you sure you want to reset all your statistics? This action cannot be undone.')) {
                const userData = gameStorage.getUserData();
                userData.stats = {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    gamesLost: 0,
                    gamesDraw: 0
                };
                gameStorage.setUserData(userData);
                location.reload();
            }
        };

        // Delete all decks
        container.querySelector('#delete-decks-btn').onclick = () => {
            if (confirm('Are you sure you want to delete all your decks? This action cannot be undone.')) {
                gameStorage.setData(StorageKeys.DECKS, []);
                location.reload();
            }
        };

        // Delete account
        container.querySelector('#delete-account-btn').onclick = () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                gameStorage.clearAllData();
                location.reload();
            }
        };
    }
}

// Register the page
window.ProfilePage = ProfilePage; 
class ResultsPage {
    static init(container, params) {
        if (!params.result) {
            router.navigate(Routes.HOME);
            return;
        }
        
        container.innerHTML = `
            <div class="results-page">
                ${this.renderResultHeader(params.result)}
                
                <div class="results-content">
                    ${this.renderStats()}
                    ${this.renderRewards(params.result)}
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary" onclick="router.navigate('${Routes.AI_SELECTOR}')">
                        Play Again
                    </button>
                    <button class="btn btn-secondary" onclick="router.navigate('${Routes.DECKS}')">
                        Change Deck
                    </button>
                    <button class="btn btn-secondary" onclick="router.navigate('${Routes.HOME}')">
                        Home
                    </button>
                </div>
            </div>
        `;
        
        this.setupEventListeners(container);
        this.animateResults();
    }
    
    static renderResultHeader(result) {
        const headerContent = {
            'PLAYER_WIN': {
                title: 'Victory!',
                icon: '🏆',
                class: 'victory'
            },
            'AI_WIN': {
                title: 'Defeat',
                icon: '💔',
                class: 'defeat'
            },
            'DRAW': {
                title: 'Draw',
                icon: '🤝',
                class: 'draw'
            }
        }[result];
        
        return `
            <header class="results-header ${headerContent.class}">
                <span class="result-icon">${headerContent.icon}</span>
                <h1 class="result-title">${headerContent.title}</h1>
            </header>
        `;
    }
    
    static renderStats() {
        const userData = gameStorage.getUserData();
        const stats = userData.stats;
        
        return `
            <div class="stats-section">
                <h2>Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value">${stats.gamesPlayed}</span>
                        <span class="stat-label">Games Played</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${stats.gamesWon}</span>
                        <span class="stat-label">Victories</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${stats.gamesLost}</span>
                        <span class="stat-label">Defeats</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${((stats.gamesWon / Math.max(1, stats.gamesPlayed)) * 100).toFixed(1)}%</span>
                        <span class="stat-label">Win Rate</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    static renderRewards(result) {
        // In a real implementation, this would calculate and display actual rewards
        const rewards = {
            'PLAYER_WIN': [
                { type: 'XP', amount: 100, icon: '⭐' },
                { type: 'Gold', amount: 50, icon: '💰' }
            ],
            'AI_WIN': [
                { type: 'XP', amount: 25, icon: '⭐' },
                { type: 'Gold', amount: 10, icon: '💰' }
            ],
            'DRAW': [
                { type: 'XP', amount: 50, icon: '⭐' },
                { type: 'Gold', amount: 25, icon: '💰' }
            ]
        }[result];
        
        return `
            <div class="rewards-section">
                <h2>Rewards</h2>
                <div class="rewards-list">
                    ${rewards.map(reward => `
                        <div class="reward-item">
                            <span class="reward-icon">${reward.icon}</span>
                            <span class="reward-amount">+${reward.amount}</span>
                            <span class="reward-type">${reward.type}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    static setupEventListeners(container) {
        // Add any additional event listeners here
    }
    
    static animateResults() {
        // Add animation classes to elements
        const elements = [
            '.results-header',
            '.stats-section',
            '.rewards-section',
            '.results-actions'
        ];
        
        elements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                setTimeout(() => {
                    element.classList.add('animate-in');
                }, index * 200); // Stagger animations
            }
        });
        
        // Animate stat numbers
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(element => {
            const finalValue = element.textContent;
            element.textContent = '0';
            
            let current = 0;
            const target = parseFloat(finalValue);
            const duration = 1000; // 1 second
            const steps = 60;
            const increment = target / steps;
            
            const interval = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = finalValue;
                    clearInterval(interval);
                } else {
                    element.textContent = Math.round(current);
                }
            }, duration / steps);
        });
    }
}

// Register the results page
router.register(Routes.RESULTS, ResultsPage); 
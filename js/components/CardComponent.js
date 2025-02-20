class CardComponent {
    constructor(card, options = {}) {
        this.card = card;
        this.options = {
            isInDeckBuilder: false,
            isInHand: false,
            isInChampionZone: false,
            isInTomb: false,
            isPlayable: false,
            showBack: false,
            showEffects: true,
            onClick: null,
            onDragStart: null,
            onDragEnd: null,
            size: 'large', // 'large' or 'small'
            ...options
        };
        
        try {
            this.element = this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing CardComponent:', error);
        }
    }
    
    render() {
        const element = document.createElement('div');
        element.className = `game-card${this.options.isPlayable ? ' playable' : ''}`;
        element.draggable = this.options.isInDeckBuilder;
        element.dataset.size = this.options.size;
        
        const cardInner = document.createElement('div');
        cardInner.className = 'game-card-inner';
        
        // Card image
        const cardImage = document.createElement('img');
        cardImage.className = 'game-card-image';
        cardImage.src = this.options.showBack ? 'images/cards/back.png' : this.card.imagePath;
        cardImage.alt = this.options.showBack ? 'Card Back' : this.card.name;
        cardImage.draggable = false;
        
        // Handle image loading errors
        cardImage.onerror = () => {
            console.warn('Image failed to load:', cardImage.src);
            // Create a canvas-based placeholder
            const canvas = document.createElement('canvas');
            canvas.width = this.options.size === 'large' ? 180 : 60;
            canvas.height = this.options.size === 'large' ? 252 : 84;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw card name
            ctx.fillStyle = '#ffffff';
            ctx.font = this.options.size === 'large' ? '16px Arial' : '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.card.name, canvas.width / 2, canvas.height / 2);
            
            // Use the canvas as the image source
            cardImage.src = canvas.toDataURL();
        };
        
        cardInner.appendChild(cardImage);
        element.appendChild(cardInner);
        
        // Tooltip
        if (this.options.showEffects) {
            const tooltip = this.createTooltip();
            element.appendChild(tooltip);
        }
        
        return element;
    }
    
    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'card-tooltip';
        
        tooltip.innerHTML = `
            <div class="card-tooltip-header">
                <span class="card-tooltip-name">${this.card.name}</span>
                <span class="card-tooltip-color" style="color: var(--card-${this.card.getColorName().toLowerCase()})">${this.card.getColorName()}</span>
            </div>
            <div class="card-tooltip-effect">
                <div class="card-tooltip-effect-title">Effect</div>
                <div class="card-tooltip-effect-desc">${this.card.getEffectDescription()}</div>
            </div>
        `;
        
        return tooltip;
    }
    
    setupEventListeners() {
        if (this.options.onClick) {
            this.element.addEventListener('click', () => {
                this.options.onClick(this.card);
            });
        }
        
        if (this.options.isInDeckBuilder) {
            this.element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', this.card.id);
                this.element.classList.add('dragging');
                this.options.onDragStart?.(this.card);
            });
            
            this.element.addEventListener('dragend', () => {
                this.element.classList.remove('dragging');
                this.options.onDragEnd?.(this.card);
            });
        }
        
        // Handle tooltip positioning
        this.element.addEventListener('mouseenter', () => {
            const tooltip = this.element.querySelector('.card-tooltip');
            if (!tooltip) return;
            
            const rect = this.element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            // Remove all position classes
            tooltip.classList.remove('left', 'right', 'top', 'bottom');
            
            // Check if there's space on the right
            if (rect.right + tooltipRect.width + 16 <= window.innerWidth) {
                tooltip.classList.add('right');
            }
            // Check if there's space on the left
            else if (rect.left - tooltipRect.width - 16 >= 0) {
                tooltip.classList.add('left');
            }
            // Check if there's space at the bottom
            else if (rect.bottom + tooltipRect.height + 16 <= window.innerHeight) {
                tooltip.classList.add('bottom');
            }
            // Default to top
            else {
                tooltip.classList.add('top');
            }
        });
    }
    
    // Update card state
    update(card, options = {}) {
        this.card = card;
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
}

// Export the CardComponent class
window.CardComponent = CardComponent; 
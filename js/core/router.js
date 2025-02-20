class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.params = new Map();
        this.isNavigating = false;
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => this.handlePopState(e));
    }
    
    // Initialize the router after routes are registered
    init() {
        console.log('Initializing router');
        
        // Handle initial route
        const initialRoute = window.location.hash.slice(1) || Routes.HOME;
        console.log('Initial route:', initialRoute);
        
        // Don't use navigate for initial route to avoid pushState
        if (this.routes.has(initialRoute)) {
            this.handleRoute(initialRoute);
        } else {
            console.warn(`No handler for initial route: ${initialRoute}, defaulting to home`);
            this.navigate(Routes.HOME);
        }
        
        // Initialize click handlers for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = e.target.dataset.page;
                this.navigate(route);
            });
        });
        
        console.log('Router initialization complete');
    }
    
    // Register a route handler
    register(route, handler) {
        this.routes.set(route, handler);
    }
    
    // Navigate to a route
    navigate(route, params = {}) {
        if (this.isNavigating) {
            console.log('Navigation already in progress, skipping');
            return;
        }
        
        console.log('Navigating to route:', route, 'with params:', params);
        
        this.isNavigating = true;
        
        try {
            // Store the params
            this.params = new Map(Object.entries(params));
            
            // Update the URL
            window.history.pushState(
                { route, params },
                '',
                `#${route}`
            );
            
            this.handleRoute(route);
        } finally {
            this.isNavigating = false;
            console.log('Navigation completed');
        }
    }
    
    // Handle route change
    handleRoute(route) {
        console.log('Handling route:', route);
        
        // Get the route handler
        const handler = this.routes.get(route);
        
        if (!handler) {
            console.error(`No handler found for route: ${route}`);
            return;
        }
        
        console.log('Found handler for route:', handler);
        
        // Clean up previous route if needed
        if (this.currentRoute && this.routes.get(this.currentRoute).cleanup) {
            this.routes.get(this.currentRoute).cleanup();
        }
        
        // Update current route
        this.currentRoute = route;
        
        // Call the route handler
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Main content container not found!');
            return;
        }
        
        console.log('Clearing main content and initializing new route');
        mainContent.innerHTML = ''; // Clear previous content
        
        // Initialize the new route
        handler.init(mainContent, Object.fromEntries(this.params));
        
        // Update active navigation link
        this.updateActiveNavLink(route);
    }
    
    // Handle browser back/forward
    handlePopState(event) {
        if (this.isNavigating) {
            console.log('Navigation already in progress, skipping popstate');
            return;
        }

        if (event.state && event.state.route) {
            this.isNavigating = true;
            try {
                this.params = new Map(Object.entries(event.state.params || {}));
                this.handleRoute(event.state.route);
            } finally {
                this.isNavigating = false;
                console.log('PopState navigation completed');
            }
        }
    }
    
    // Update active navigation link
    updateActiveNavLink(route) {
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current route link
        const activeLink = document.querySelector(`.nav-link[data-page="${route}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // Get current route parameters
    getParams() {
        return Object.fromEntries(this.params);
    }
    
    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Create and export router instance
window.router = new Router(); 
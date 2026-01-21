export const AutomationService = {
    STORAGE_KEY: 'springroll_automations',

    getAll() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : this.getDefaults();
        } catch (e) {
            console.error('Failed to load automations', e);
            return [];
        }
    },

    save(automations) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(automations));
    },

    add(automation) {
        const current = this.getAll();
        const newAuth = { ...automation, id: crypto.randomUUID(), createdAt: Date.now() };
        this.save([...current, newAuth]);
        return newAuth;
    },

    delete(id) {
        const current = this.getAll();
        this.save(current.filter(a => a.id !== id));
    },

    getDefaults() {
        return [
            {
                id: 'demo_google',
                name: 'Search Google (Demo)',
                description: 'Navigates to Google and searches for Springroll AI',
                steps: [
                    { type: 'navigate', url: 'https://www.google.com' },
                    { type: 'type', selector: 'textarea[name="q"]', value: 'Springroll AI' },
                    { type: 'wait', duration: 2000 },
                    { type: 'screenshot', path: 'google_search.png' }
                ]
            },
            {
                id: 'demo_github',
                name: 'Check GitHub Trending',
                description: 'Scrapes trending repositories',
                steps: [
                    { type: 'navigate', url: 'https://github.com/trending' },
                    { type: 'wait', duration: 1000 },
                    { type: 'screenshot', path: 'github_trending.png' }
                ]
            }
        ];
    }
};

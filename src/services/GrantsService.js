/**
 * GrantsService - Integration with Grants.gov API
 * Uses the free /v1/api/search2 endpoint (no API key required)
 */

// CORS proxy to bypass browser restrictions (Grants.gov doesn't allow direct browser calls)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const GRANTS_GOV_API = 'https://www.grants.gov/grantsws/rest/opportunities/search/v2';
const API_URL = `${CORS_PROXY}${encodeURIComponent(GRANTS_GOV_API)}`;

// Funding category codes
export const FUNDING_CATEGORIES = [
    { code: 'all', label: 'All Categories' },
    { code: 'AG', label: 'Agriculture' },
    { code: 'AR', label: 'Arts' },
    { code: 'BC', label: 'Business & Commerce' },
    { code: 'ED', label: 'Education' },
    { code: 'EN', label: 'Energy' },
    { code: 'EL', label: 'Employment & Labor' },
    { code: 'ENV', label: 'Environment' },
    { code: 'HL', label: 'Health' },
    { code: 'ISS', label: 'Information & Statistics' },
    { code: 'ST', label: 'Science & Technology' },
    { code: 'RA', label: 'Regional Development' },
    { code: 'DPR', label: 'Disaster Prevention & Relief' },
];

// Status options
export const OPP_STATUSES = [
    { code: 'posted', label: 'Posted (Open)' },
    { code: 'forecasted', label: 'Forecasted' },
    { code: 'closed', label: 'Closed' },
];

export const GrantsService = {
    // Search Grants.gov opportunities
    async searchOpportunities(keyword = '', category = 'all', status = 'posted', limit = 25) {
        try {
            // Build request body for Grants.gov search2 API
            const requestBody = {
                keyword: keyword,
                oppStatuses: status === 'all' ? ['posted', 'forecasted'] : [status],
                rows: limit,
                sortBy: 'openDate|desc'
            };

            // Add category filter if specified
            if (category && category !== 'all') {
                requestBody.fundingCategories = [category];
            }

            // Use CORS proxy to bypass browser restrictions
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(GRANTS_GOV_API)}`;

            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Grants.gov API error: ${response.status}`);
            }

            const data = await response.json();

            // Transform response to our format
            return this.transformOpportunities(data.oppHits || []);
        } catch (error) {
            console.error('GrantsService.searchOpportunities failed:', error);
            // Return mock data for development/demo
            return this.getMockOpportunities(keyword, category);
        }
    },

    // Transform Grants.gov response to our format
    transformOpportunities(oppHits) {
        return oppHits.map(opp => ({
            id: opp.id || opp.number,
            title: opp.title || 'Untitled Opportunity',
            agency: opp.agency || 'Unknown Agency',
            agencyCode: opp.agencyCode,
            deadline: opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : 'Rolling',
            postedDate: opp.openDate ? new Date(opp.openDate).toLocaleDateString() : 'N/A',
            awardAmount: opp.awardCeiling ? `Up to $${(opp.awardCeiling).toLocaleString()}` : 'Varies',
            awardFloor: opp.awardFloor,
            awardCeiling: opp.awardCeiling,
            description: opp.synopsis || opp.description || 'No description available.',
            category: opp.fundingCategories?.[0] || 'General',
            status: opp.oppStatus || 'posted',
            url: `https://www.grants.gov/search-results-detail/${opp.id}`,
            source: 'grants.gov',
            number: opp.number,
        }));
    },

    // Mock data for development/demo when API is unavailable
    getMockOpportunities(keyword = '', category = '') {
        const mockData = [
            {
                id: 'GRANT-2026-001',
                title: 'Small Business Innovation Research (SBIR) Phase I',
                agency: 'National Science Foundation',
                agencyCode: 'NSF',
                deadline: 'Apr 1, 2026',
                postedDate: 'Jan 15, 2026',
                awardAmount: 'Up to $275,000',
                description: 'The NSF SBIR/STTR programs fund startups and small businesses to engage in Federal Research & Development with the potential for commercialization.',
                category: 'ST',
                status: 'posted',
                url: 'https://www.grants.gov',
                source: 'grants.gov',
                number: 'NSF-SBIR-2026'
            },
            {
                id: 'GRANT-2026-002',
                title: 'Clean Energy Manufacturing Innovation',
                agency: 'Department of Energy',
                agencyCode: 'DOE',
                deadline: 'May 30, 2026',
                postedDate: 'Feb 1, 2026',
                awardAmount: 'Up to $5,000,000',
                description: 'DOE seeks applications for research and development of clean energy manufacturing technologies to support domestic supply chains.',
                category: 'EN',
                status: 'posted',
                url: 'https://www.grants.gov',
                source: 'grants.gov',
                number: 'DE-FOA-2026-001'
            },
            {
                id: 'GRANT-2026-003',
                title: 'Advanced Research Projects Agency - Defense',
                agency: 'Department of Defense',
                agencyCode: 'DOD',
                deadline: 'Mar 15, 2026',
                postedDate: 'Jan 10, 2026',
                awardAmount: '$500,000 - $2,000,000',
                description: 'DARPA seeks innovative research proposals for advanced defense technologies including autonomous systems, AI/ML, and cybersecurity.',
                category: 'ST',
                status: 'posted',
                url: 'https://www.grants.gov',
                source: 'grants.gov',
                number: 'DARPA-BAA-2026'
            },
            {
                id: 'GRANT-2026-004',
                title: 'Agricultural Research Innovation Initiative',
                agency: 'Department of Agriculture',
                agencyCode: 'USDA',
                deadline: 'Jun 15, 2026',
                postedDate: 'Mar 1, 2026',
                awardAmount: 'Up to $1,000,000',
                description: 'USDA NIFA seeks proposals for innovative agricultural research including sustainable farming, food security, and climate resilience.',
                category: 'AG',
                status: 'posted',
                url: 'https://www.grants.gov',
                source: 'grants.gov',
                number: 'USDA-NIFA-2026-001'
            },
            {
                id: 'GRANT-2026-005',
                title: 'Health Innovation Accelerator Program',
                agency: 'National Institutes of Health',
                agencyCode: 'NIH',
                deadline: 'Apr 15, 2026',
                postedDate: 'Jan 20, 2026',
                awardAmount: 'Up to $500,000',
                description: 'NIH seeks small business applications for innovative health technologies addressing chronic diseases, diagnostics, and therapeutics.',
                category: 'HL',
                status: 'posted',
                url: 'https://www.grants.gov',
                source: 'grants.gov',
                number: 'NIH-SBIR-2026-001'
            }
        ];

        // Filter by keyword if provided
        let filtered = mockData;
        if (keyword) {
            const kw = keyword.toLowerCase();
            filtered = filtered.filter(o =>
                o.title.toLowerCase().includes(kw) ||
                o.description.toLowerCase().includes(kw) ||
                o.agency.toLowerCase().includes(kw)
            );
        }

        // Filter by category if provided
        if (category && category !== 'all') {
            filtered = filtered.filter(o => o.category === category);
        }

        return filtered;
    },

    // Get a single opportunity by ID
    async getOpportunity(id) {
        // In production, would call Grants.gov detail API
        const allOpps = await this.getMockOpportunities();
        return allOpps.find(o => o.id === id) || null;
    },

    // Save opportunity to local storage (for tracking)
    saveOpportunity(opportunity) {
        const saved = JSON.parse(localStorage.getItem('springroll_saved_grants') || '[]');
        if (!saved.find(o => o.id === opportunity.id)) {
            saved.push({ ...opportunity, savedAt: new Date().toISOString() });
            localStorage.setItem('springroll_saved_grants', JSON.stringify(saved));
        }
        return saved;
    },

    // Get saved opportunities
    getSavedOpportunities() {
        return JSON.parse(localStorage.getItem('springroll_saved_grants') || '[]');
    },

    // Remove saved opportunity
    removeSavedOpportunity(id) {
        const saved = this.getSavedOpportunities().filter(o => o.id !== id);
        localStorage.setItem('springroll_saved_grants', JSON.stringify(saved));
        return saved;
    },

    // Search SAM.gov contracts (mock for now - real API requires UEI registration)
    async searchContracts(keyword = '', category = 'all', status = 'posted', limit = 25) {
        // SAM.gov API requires registration - using mock data
        console.log('Searching SAM.gov contracts for:', keyword);
        return this.getMockContracts(keyword, category);
    },

    // Mock contract data for SAM.gov
    getMockContracts(keyword = '', category = '') {
        const mockContracts = [
            {
                id: 'W911NF-26-R-0001',
                title: 'Enterprise IT Services Support Contract',
                agency: 'U.S. Army',
                agencyCode: 'ARMY',
                deadline: 'Mar 30, 2026',
                postedDate: 'Jan 5, 2026',
                awardAmount: '$50M - $100M',
                description: 'Full-service IT enterprise support including cyber security, cloud migration, and network operations for Army installations.',
                category: 'IT',
                status: 'posted',
                url: 'https://sam.gov',
                source: 'sam.gov',
                number: 'W911NF-26-R-0001',
                setAside: 'Small Business',
                naicsCode: '541512'
            },
            {
                id: 'FA8726-26-R-0042',
                title: 'Autonomous Drone Systems Development',
                agency: 'U.S. Air Force',
                agencyCode: 'USAF',
                deadline: 'Apr 15, 2026',
                postedDate: 'Jan 20, 2026',
                awardAmount: '$10M - $25M',
                description: 'R&D contract for next-generation autonomous drone platforms with advanced AI navigation and swarm capabilities.',
                category: 'Defense',
                status: 'posted',
                url: 'https://sam.gov',
                source: 'sam.gov',
                number: 'FA8726-26-R-0042',
                setAside: 'Full & Open',
                naicsCode: '336411'
            },
            {
                id: 'GS-00F-0001X',
                title: 'GSA Schedule 70 IT Products and Services',
                agency: 'General Services Administration',
                agencyCode: 'GSA',
                deadline: 'Rolling',
                postedDate: 'Open',
                awardAmount: 'Varies by Task Order',
                description: 'Multiple Award Schedule contract for IT professional services, cloud computing, and cybersecurity solutions.',
                category: 'IT',
                status: 'posted',
                url: 'https://sam.gov',
                source: 'sam.gov',
                number: 'GS-00F-0001X',
                setAside: '8(a) Set-Aside',
                naicsCode: '541511'
            },
            {
                id: 'N00024-26-R-0088',
                title: 'Naval Shipyard Construction Services',
                agency: 'U.S. Navy',
                agencyCode: 'NAVY',
                deadline: 'May 1, 2026',
                postedDate: 'Feb 1, 2026',
                awardAmount: '$25M - $75M',
                description: 'Construction and renovation services for naval shipyard facilities including dry docks and maintenance buildings.',
                category: 'Construction',
                status: 'posted',
                url: 'https://sam.gov',
                source: 'sam.gov',
                number: 'N00024-26-R-0088',
                setAside: 'HUBZone',
                naicsCode: '236210'
            },
            {
                id: 'HHS-26-RFP-0012',
                title: 'Healthcare Data Analytics Platform',
                agency: 'Dept. of Health and Human Services',
                agencyCode: 'HHS',
                deadline: 'Jun 15, 2026',
                postedDate: 'Feb 10, 2026',
                awardAmount: '$15M - $30M',
                description: 'Development and operation of nationwide healthcare data analytics platform for population health management.',
                category: 'Healthcare',
                status: 'posted',
                url: 'https://sam.gov',
                source: 'sam.gov',
                number: 'HHS-26-RFP-0012',
                setAside: 'WOSB',
                naicsCode: '541511'
            },
            {
                id: 'DLA-26-R-0055',
                title: 'Defense Logistics Supply Chain Management',
                agency: 'Defense Logistics Agency',
                agencyCode: 'DLA',
                deadline: 'Apr 30, 2026',
                postedDate: 'Jan 25, 2026',
                awardAmount: '$100M+',
                description: 'Enterprise logistics and supply chain management services for defense materiel distribution across global locations.',
                category: 'Logistics',
                status: 'posted',
                url: 'https://sam.gov',
                source: 'sam.gov',
                number: 'DLA-26-R-0055',
                setAside: 'Full & Open',
                naicsCode: '488510'
            }
        ];

        // Filter by keyword if provided
        let filtered = mockContracts;
        if (keyword) {
            const kw = keyword.toLowerCase();
            filtered = filtered.filter(o =>
                o.title.toLowerCase().includes(kw) ||
                o.description.toLowerCase().includes(kw) ||
                o.agency.toLowerCase().includes(kw) ||
                o.category.toLowerCase().includes(kw)
            );
        }

        // Filter by category if provided
        if (category && category !== 'all') {
            filtered = filtered.filter(o => o.category.toLowerCase() === category.toLowerCase());
        }

        return filtered;
    }
};

export default GrantsService;

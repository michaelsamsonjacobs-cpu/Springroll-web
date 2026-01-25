/**
 * Team OKRs - Annual & Quarterly Objectives for AI Teammates
 * 
 * Each agent has annual objectives with quarterly key results.
 * Ralph uses these to prioritize and schedule autonomous work.
 */

export const SHARED_TOOLS = {
    DATA_SCRAPER: 'data_scraper',           // Web scraping for research
    DOC_EXTRACTOR: 'doc_extractor',         // Extract from PDFs, docs
    DOC_GENERATOR: 'doc_generator',         // Generate documents from templates
    GRANTS_SEARCH: 'grants_gov_search',     // Search grants.gov
    CONTRACTS_SEARCH: 'sam_gov_search',     // Search SAM.gov
    PRIOR_ART: 'prior_art_search',          // Patent searches
    MARKET_RESEARCH: 'market_research'      // Market data lookup
};

export const TEAM_OKRS = {
    // ============================================
    // RALPH - Orchestrator
    // ============================================
    ralph: {
        name: 'Ralph',
        role: 'Chief of Staff / Orchestrator',
        icon: '🤖',
        tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.DOC_EXTRACTOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'ralph-o1',
                    title: 'Maximize Team Productivity',
                    keyResults: [
                        { id: 'kr1', metric: 'Tasks completed autonomously', target: 1000, unit: 'tasks/year' },
                        { id: 'kr2', metric: 'Average task success rate', target: 85, unit: '%' },
                        { id: 'kr3', metric: 'Learning iterations applied', target: 500, unit: 'improvements' }
                    ]
                },
                {
                    id: 'ralph-o2',
                    title: 'Improve Autonomous Capabilities',
                    keyResults: [
                        { id: 'kr1', metric: 'New workflows learned', target: 50, unit: 'workflows' },
                        { id: 'kr2', metric: 'Error recovery rate', target: 90, unit: '%' },
                        { id: 'kr3', metric: 'Human intervention rate', target: 10, unit: '% (lower is better)' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // FINANCE - CFO
    // ============================================
    finance: {
        name: 'Finance',
        role: 'CFO / Grant Writer',
        icon: '💰',
        tools: [SHARED_TOOLS.GRANTS_SEARCH, SHARED_TOOLS.DOC_GENERATOR, SHARED_TOOLS.DOC_EXTRACTOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'finance-o1',
                    title: 'Maximize Non-Dilutive Funding',
                    keyResults: [
                        { id: 'kr1', metric: 'SBIR/STTR proposals submitted', target: 24, unit: 'proposals' },
                        { id: 'kr2', metric: 'Grant funding won', target: 2000000, unit: '$' },
                        { id: 'kr3', metric: 'Proposal win rate', target: 30, unit: '%' }
                    ]
                },
                {
                    id: 'finance-o2',
                    title: 'Ensure Financial Compliance',
                    keyResults: [
                        { id: 'kr1', metric: 'Compliance violations', target: 0, unit: 'violations' },
                        { id: 'kr2', metric: 'Budget reviews completed', target: 12, unit: 'reviews' },
                        { id: 'kr3', metric: 'Audit readiness score', target: 95, unit: '%' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // LEGAL - General Counsel
    // ============================================
    legal: {
        name: 'Legal',
        role: 'General Counsel',
        icon: '⚖️',
        tools: [SHARED_TOOLS.DOC_EXTRACTOR, SHARED_TOOLS.DOC_GENERATOR, SHARED_TOOLS.PRIOR_ART],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'legal-o1',
                    title: 'Protect Company IP',
                    keyResults: [
                        { id: 'kr1', metric: 'Provisional patents filed', target: 6, unit: 'patents' },
                        { id: 'kr2', metric: 'Trademarks registered', target: 4, unit: 'trademarks' },
                        { id: 'kr3', metric: 'IP audit coverage', target: 100, unit: '%' }
                    ]
                },
                {
                    id: 'legal-o2',
                    title: 'Minimize Legal Risk',
                    keyResults: [
                        { id: 'kr1', metric: 'Contract review turnaround', target: 48, unit: 'hours' },
                        { id: 'kr2', metric: 'Contracts reviewed before signing', target: 100, unit: '%' },
                        { id: 'kr3', metric: 'Litigation exposure events', target: 0, unit: 'events' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // GTM - CMO
    // ============================================
    gtm: {
        name: 'GTM',
        role: 'Chief Marketing Officer',
        icon: '📣',
        tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.DOC_GENERATOR, SHARED_TOOLS.MARKET_RESEARCH],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'gtm-o1',
                    title: 'Drive Customer Acquisition',
                    keyResults: [
                        { id: 'kr1', metric: 'Marketing qualified leads', target: 500, unit: 'MQLs' },
                        { id: 'kr2', metric: 'Website traffic', target: 50000, unit: 'visits/month' },
                        { id: 'kr3', metric: 'Conversion rate', target: 5, unit: '%' }
                    ]
                },
                {
                    id: 'gtm-o2',
                    title: 'Build Brand Authority',
                    keyResults: [
                        { id: 'kr1', metric: 'Content pieces published', target: 48, unit: 'articles' },
                        { id: 'kr2', metric: 'Social media followers', target: 10000, unit: 'followers' },
                        { id: 'kr3', metric: 'Media mentions', target: 24, unit: 'mentions' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // PRODUCT - CPO
    // ============================================
    product: {
        name: 'Product',
        role: 'Chief Product Officer',
        icon: '🎯',
        tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.DOC_GENERATOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'product-o1',
                    title: 'Deliver Customer Value',
                    keyResults: [
                        { id: 'kr1', metric: 'Features shipped', target: 24, unit: 'features' },
                        { id: 'kr2', metric: 'Customer satisfaction (NPS)', target: 50, unit: 'NPS' },
                        { id: 'kr3', metric: 'Feature adoption rate', target: 60, unit: '%' }
                    ]
                },
                {
                    id: 'product-o2',
                    title: 'Maintain Product Excellence',
                    keyResults: [
                        { id: 'kr1', metric: 'User-reported bugs', target: 20, unit: 'bugs/quarter (max)' },
                        { id: 'kr2', metric: 'Uptime', target: 99.9, unit: '%' },
                        { id: 'kr3', metric: 'Roadmap items delivered', target: 80, unit: '%' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // DEV - CTO
    // ============================================
    dev: {
        name: 'Dev',
        role: 'Chief Technology Officer',
        icon: '💻',
        tools: [SHARED_TOOLS.DOC_GENERATOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'dev-o1',
                    title: 'Maintain Code Quality',
                    keyResults: [
                        { id: 'kr1', metric: 'Code review coverage', target: 100, unit: '%' },
                        { id: 'kr2', metric: 'Test coverage', target: 80, unit: '%' },
                        { id: 'kr3', metric: 'Technical debt tickets closed', target: 48, unit: 'tickets' }
                    ]
                },
                {
                    id: 'dev-o2',
                    title: 'Improve Developer Velocity',
                    keyResults: [
                        { id: 'kr1', metric: 'Deploy frequency', target: 10, unit: 'deploys/week' },
                        { id: 'kr2', metric: 'Lead time for changes', target: 24, unit: 'hours' },
                        { id: 'kr3', metric: 'CI/CD success rate', target: 95, unit: '%' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // QA - QA Lead
    // ============================================
    qa: {
        name: 'QA',
        role: 'QA Lead',
        icon: '🧪',
        tools: [SHARED_TOOLS.DOC_GENERATOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'qa-o1',
                    title: 'Ensure Release Quality',
                    keyResults: [
                        { id: 'kr1', metric: 'Critical bugs in production', target: 0, unit: 'bugs' },
                        { id: 'kr2', metric: 'Test automation coverage', target: 70, unit: '%' },
                        { id: 'kr3', metric: 'Release rollback rate', target: 5, unit: '% (max)' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // HEALTH - Healthcare Admin
    // ============================================
    health: {
        name: 'Health',
        role: 'Healthcare Administrator',
        icon: '🏥',
        tools: [SHARED_TOOLS.DOC_EXTRACTOR, SHARED_TOOLS.DOC_GENERATOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'health-o1',
                    title: 'Maximize Prior Auth Approvals',
                    keyResults: [
                        { id: 'kr1', metric: 'Prior auth approval rate', target: 85, unit: '%' },
                        { id: 'kr2', metric: 'Appeal success rate', target: 70, unit: '%' },
                        { id: 'kr3', metric: 'Processing time', target: 24, unit: 'hours' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // RECRUITING - HR
    // ============================================
    recruiting: {
        name: 'Recruiting',
        role: 'Head of Talent',
        icon: '👥',
        tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.DOC_GENERATOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'recruiting-o1',
                    title: 'Build High-Performance Team',
                    keyResults: [
                        { id: 'kr1', metric: 'Open roles filled', target: 12, unit: 'hires' },
                        { id: 'kr2', metric: 'Time to hire', target: 30, unit: 'days' },
                        { id: 'kr3', metric: 'Offer acceptance rate', target: 80, unit: '%' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // ACCOUNT - Customer Success
    // ============================================
    account: {
        name: 'Account',
        role: 'Account Manager',
        icon: '🤝',
        tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.DOC_GENERATOR],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'account-o1',
                    title: 'Maximize Customer Retention',
                    keyResults: [
                        { id: 'kr1', metric: 'Customer retention rate', target: 95, unit: '%' },
                        { id: 'kr2', metric: 'Net revenue retention', target: 110, unit: '%' },
                        { id: 'kr3', metric: 'Customer health scores', target: 80, unit: 'avg score' }
                    ]
                }
            ]
        }
    },

    // ============================================
    // TRADER - Trading Analyst
    // ============================================
    trader: {
        name: 'Trader',
        role: 'Trading Analyst',
        icon: '📈',
        tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.MARKET_RESEARCH],
        annual: {
            year: 2026,
            objectives: [
                {
                    id: 'trader-o1',
                    title: 'Generate Alpha',
                    keyResults: [
                        { id: 'kr1', metric: 'Portfolio return vs benchmark', target: 5, unit: '% alpha' },
                        { id: 'kr2', metric: 'Sharpe ratio', target: 1.5, unit: 'ratio' },
                        { id: 'kr3', metric: 'Maximum drawdown', target: 10, unit: '% (max)' }
                    ]
                }
            ]
        }
    }
};

// Helper functions
export const getAgentOKRs = (agentId) => TEAM_OKRS[agentId] || null;
export const getAllAgents = () => Object.keys(TEAM_OKRS);
export const getAgentTools = (agentId) => TEAM_OKRS[agentId]?.tools || [];

export default TEAM_OKRS;

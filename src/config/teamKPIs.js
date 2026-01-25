/**
 * Team KPIs - Monthly & Weekly Metrics for AI Teammates
 * 
 * Defines trackable KPIs that feed into quarterly OKRs.
 * Includes scheduled tasks that Ralph executes.
 */

import { SHARED_TOOLS } from './teamOKRs';

export const TEAM_KPIS = {
    // ============================================
    // FINANCE AGENT KPIs
    // ============================================
    finance: {
        monthly: [
            {
                id: 'finance-m1',
                name: 'Grant Pipeline Review',
                description: 'Scan grants.gov and sam.gov for new opportunities',
                tools: [SHARED_TOOLS.GRANTS_SEARCH, SHARED_TOOLS.DATA_SCRAPER],
                target: { metric: 'New opportunities identified', value: 10 },
                frequency: 'monthly'
            },
            {
                id: 'finance-m2',
                name: 'Proposal Submissions',
                description: 'Submit completed grant proposals',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                target: { metric: 'Proposals submitted', value: 2 },
                frequency: 'monthly'
            }
        ],
        weekly: [
            {
                id: 'finance-w1',
                name: 'Grant Opportunity Scan',
                description: 'Search for new SBIR/STTR opportunities',
                tools: [SHARED_TOOLS.GRANTS_SEARCH],
                dayOfWeek: 'monday',
                taskPrompt: 'Search grants.gov for new SBIR/STTR opportunities in AI, autonomous systems, and defense tech. Generate a summary report.'
            },
            {
                id: 'finance-w2',
                name: 'Proposal Drafting',
                description: 'Work on active proposal sections',
                tools: [SHARED_TOOLS.DOC_GENERATOR, SHARED_TOOLS.DOC_EXTRACTOR],
                dayOfWeek: 'wednesday',
                taskPrompt: 'Continue drafting the next SBIR proposal. Focus on technical approach and commercialization sections.'
            },
            {
                id: 'finance-w3',
                name: 'Budget Review',
                description: 'Review project budgets and spending',
                tools: [SHARED_TOOLS.DOC_EXTRACTOR],
                dayOfWeek: 'friday',
                taskPrompt: 'Review current project budgets. Flag any variances over 10% from planned spending.'
            }
        ]
    },

    // ============================================
    // LEGAL AGENT KPIs
    // ============================================
    legal: {
        monthly: [
            {
                id: 'legal-m1',
                name: 'IP Audit',
                description: 'Review pending patents and trademarks',
                tools: [SHARED_TOOLS.PRIOR_ART, SHARED_TOOLS.DOC_EXTRACTOR],
                target: { metric: 'IP items reviewed', value: 10 },
                frequency: 'monthly'
            },
            {
                id: 'legal-m2',
                name: 'Compliance Check',
                description: 'Monthly compliance checklist completion',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                target: { metric: 'Checklists completed', value: 1 },
                frequency: 'monthly'
            }
        ],
        weekly: [
            {
                id: 'legal-w1',
                name: 'Contract Queue',
                description: 'Review pending contracts',
                tools: [SHARED_TOOLS.DOC_EXTRACTOR],
                dayOfWeek: 'monday',
                taskPrompt: 'Review all contracts in the pending queue. Identify key terms, risks, and required modifications.'
            },
            {
                id: 'legal-w2',
                name: 'Prior Art Research',
                description: 'Research prior art for pending patents',
                tools: [SHARED_TOOLS.PRIOR_ART, SHARED_TOOLS.DATA_SCRAPER],
                dayOfWeek: 'wednesday',
                taskPrompt: 'Conduct prior art search for pending provisional patents. Identify potential conflicts and differentiation opportunities.'
            },
            {
                id: 'legal-w3',
                name: 'Compliance Monitoring',
                description: 'Check regulatory updates',
                tools: [SHARED_TOOLS.DATA_SCRAPER],
                dayOfWeek: 'friday',
                taskPrompt: 'Scan for regulatory updates relevant to our business. Flag any new compliance requirements.'
            }
        ]
    },

    // ============================================
    // GTM AGENT KPIs
    // ============================================
    gtm: {
        monthly: [
            {
                id: 'gtm-m1',
                name: 'Content Production',
                description: 'Publish blog posts and content',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                target: { metric: 'Content pieces published', value: 4 },
                frequency: 'monthly'
            },
            {
                id: 'gtm-m2',
                name: 'Competitor Analysis',
                description: 'Monitor competitor activities',
                tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.MARKET_RESEARCH],
                target: { metric: 'Competitors analyzed', value: 5 },
                frequency: 'monthly'
            }
        ],
        weekly: [
            {
                id: 'gtm-w1',
                name: 'Content Calendar',
                description: 'Plan weekly content',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'monday',
                taskPrompt: 'Review content calendar. Identify topics for this week. Draft outlines for planned content.'
            },
            {
                id: 'gtm-w2',
                name: 'Campaign Metrics',
                description: 'Review marketing performance',
                tools: [SHARED_TOOLS.DATA_SCRAPER],
                dayOfWeek: 'wednesday',
                taskPrompt: 'Pull marketing metrics from campaigns. Identify top performers and underperformers. Suggest optimizations.'
            },
            {
                id: 'gtm-w3',
                name: 'Competitor Scan',
                description: 'Monitor competitor activities',
                tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.MARKET_RESEARCH],
                dayOfWeek: 'friday',
                taskPrompt: 'Scan competitor websites, press releases, and social media. Report on new features, pricing changes, or campaigns.'
            }
        ]
    },

    // ============================================
    // PRODUCT AGENT KPIs
    // ============================================
    product: {
        monthly: [
            {
                id: 'product-m1',
                name: 'User Feedback Analysis',
                description: 'Analyze user feedback and requests',
                tools: [SHARED_TOOLS.DOC_EXTRACTOR, SHARED_TOOLS.DATA_SCRAPER],
                target: { metric: 'Feedback items processed', value: 50 },
                frequency: 'monthly'
            }
        ],
        weekly: [
            {
                id: 'product-w1',
                name: 'Feature Prioritization',
                description: 'Review and prioritize roadmap',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'monday',
                taskPrompt: 'Review feature requests and prioritize based on impact and effort. Update roadmap priorities.'
            },
            {
                id: 'product-w2',
                name: 'User Research',
                description: 'Analyze user behavior and feedback',
                tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.DOC_EXTRACTOR],
                dayOfWeek: 'thursday',
                taskPrompt: 'Analyze user feedback from support tickets and reviews. Identify top pain points and opportunities.'
            }
        ]
    },

    // ============================================
    // DEV AGENT KPIs
    // ============================================
    dev: {
        monthly: [
            {
                id: 'dev-m1',
                name: 'Technical Debt Review',
                description: 'Audit and prioritize tech debt',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                target: { metric: 'Tech debt items triaged', value: 20 },
                frequency: 'monthly'
            }
        ],
        weekly: [
            {
                id: 'dev-w1',
                name: 'Code Review',
                description: 'Review pending PRs',
                tools: [],
                dayOfWeek: 'monday',
                taskPrompt: 'Review all pending pull requests. Provide feedback on code quality, architecture, and testing.'
            },
            {
                id: 'dev-w2',
                name: 'Bug Triage',
                description: 'Triage and prioritize bugs',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'wednesday',
                taskPrompt: 'Triage new bug reports. Categorize by severity and assign priorities. Identify root causes for recurring issues.'
            },
            {
                id: 'dev-w3',
                name: 'Architecture Docs',
                description: 'Update technical documentation',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'friday',
                taskPrompt: 'Review and update architecture documentation. Ensure diagrams reflect current system state.'
            }
        ]
    },

    // ============================================
    // QA AGENT KPIs
    // ============================================
    qa: {
        weekly: [
            {
                id: 'qa-w1',
                name: 'Test Planning',
                description: 'Plan test coverage for sprint',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'monday',
                taskPrompt: 'Create test plans for features in current sprint. Identify edge cases and regression risks.'
            },
            {
                id: 'qa-w2',
                name: 'Test Execution',
                description: 'Execute test suites',
                tools: [],
                dayOfWeek: 'wednesday',
                taskPrompt: 'Execute automated test suite. Document failures and investigate root causes.'
            },
            {
                id: 'qa-w3',
                name: 'Release Readiness',
                description: 'Assess release readiness',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'friday',
                taskPrompt: 'Generate release readiness report. Document test coverage, known issues, and go/no-go recommendation.'
            }
        ]
    },

    // ============================================
    // ACCOUNT AGENT KPIs
    // ============================================
    account: {
        monthly: [
            {
                id: 'account-m1',
                name: 'Customer Health Review',
                description: 'Review customer health scores',
                tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.DOC_GENERATOR],
                target: { metric: 'Accounts reviewed', value: 20 },
                frequency: 'monthly'
            }
        ],
        weekly: [
            {
                id: 'account-w1',
                name: 'At-Risk Accounts',
                description: 'Identify at-risk customers',
                tools: [SHARED_TOOLS.DATA_SCRAPER],
                dayOfWeek: 'monday',
                taskPrompt: 'Review customer engagement metrics. Identify accounts showing signs of churn risk.'
            },
            {
                id: 'account-w2',
                name: 'Renewal Pipeline',
                description: 'Track upcoming renewals',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'thursday',
                taskPrompt: 'Review renewal pipeline for next 90 days. Prepare outreach strategy for each account.'
            }
        ]
    },

    // ============================================
    // RECRUITING AGENT KPIs
    // ============================================
    recruiting: {
        weekly: [
            {
                id: 'recruiting-w1',
                name: 'Candidate Pipeline',
                description: 'Review candidate pipeline',
                tools: [SHARED_TOOLS.DATA_SCRAPER],
                dayOfWeek: 'monday',
                taskPrompt: 'Review candidate pipeline for open roles. Identify sourcing gaps and outreach opportunities.'
            },
            {
                id: 'recruiting-w2',
                name: 'Job Posting Updates',
                description: 'Update job postings',
                tools: [SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'wednesday',
                taskPrompt: 'Review and update job descriptions. Ensure postings reflect current requirements and culture.'
            }
        ]
    },

    // ============================================
    // TRADER AGENT KPIs
    // ============================================
    trader: {
        weekly: [
            {
                id: 'trader-w1',
                name: 'Market Analysis',
                description: 'Weekly market review',
                tools: [SHARED_TOOLS.DATA_SCRAPER, SHARED_TOOLS.MARKET_RESEARCH],
                dayOfWeek: 'monday',
                taskPrompt: 'Analyze market conditions and macro trends. Identify opportunities and risks for current positions.'
            },
            {
                id: 'trader-w2',
                name: 'Portfolio Review',
                description: 'Review portfolio performance',
                tools: [SHARED_TOOLS.DATA_SCRAPER],
                dayOfWeek: 'friday',
                taskPrompt: 'Generate weekly portfolio performance report. Compare against benchmarks and analyze attribution.'
            }
        ]
    },

    // ============================================
    // HEALTH AGENT KPIs
    // ============================================
    health: {
        weekly: [
            {
                id: 'health-w1',
                name: 'Prior Auth Queue',
                description: 'Process pending prior authorizations',
                tools: [SHARED_TOOLS.DOC_EXTRACTOR, SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'monday',
                taskPrompt: 'Review pending prior authorization requests. Draft letters for high-priority cases.'
            },
            {
                id: 'health-w2',
                name: 'Appeals Processing',
                description: 'Handle denied claims',
                tools: [SHARED_TOOLS.DOC_EXTRACTOR, SHARED_TOOLS.DOC_GENERATOR],
                dayOfWeek: 'thursday',
                taskPrompt: 'Review denied prior authorizations. Draft appeal letters with supporting evidence.'
            }
        ]
    }
};

// Helper functions
export const getAgentKPIs = (agentId) => TEAM_KPIS[agentId] || null;
export const getWeeklyTasks = (dayOfWeek) => {
    const tasks = [];
    Object.entries(TEAM_KPIS).forEach(([agentId, kpis]) => {
        if (kpis.weekly) {
            kpis.weekly.filter(t => t.dayOfWeek === dayOfWeek).forEach(task => {
                tasks.push({ agentId, ...task });
            });
        }
    });
    return tasks;
};

export default TEAM_KPIS;

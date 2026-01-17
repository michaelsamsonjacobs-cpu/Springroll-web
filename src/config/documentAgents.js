/**
 * Document Agent Configurations
 * Each document template has a specialized agent with:
 * - Custom system prompt
 * - Pre-generation questions
 * - Tools (file_read, external APIs)
 * - Section structure
 */

export const DOCUMENT_AGENTS = {
    'grant-proposal': {
        id: 'grant-proposal',
        name: 'Grant Proposal Agent',
        icon: '💰',
        color: '#10b981',
        description: 'Expert grant writer for federal funding opportunities',
        systemPrompt: `You are an expert grant writer with 20+ years of experience winning federal grants from NSF, NIH, DOE, DOD, and other agencies.
Your role is to help draft compelling grant proposals that clearly articulate:
- The significance and innovation of the proposed work
- A clear methodology and timeline
- Qualifications of the team
- Realistic budget justification

Use the provided context from local files and grant opportunity details to personalize each section.
Always write in clear, persuasive language that matches the funding agency's priorities.`,

        tools: ['file_read', 'grants_gov_search'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Project folder with relevant docs',
                type: 'folder_picker',
                description: 'Select folder with project files, papers, diagrams',
                required: true
            },
            {
                id: 'opportunity_search',
                label: 'Search for grant opportunity',
                type: 'grants_search',
                description: 'Search Grants.gov to find & link opportunity details',
                required: false
            },
            {
                id: 'company_name',
                label: 'Organization name',
                type: 'text',
                placeholder: 'Acme Research Corp',
                required: true
            },
            {
                id: 'pi_name',
                label: 'Principal Investigator',
                type: 'text',
                placeholder: 'Dr. Jane Smith',
                required: false
            }
        ],

        externalSources: ['grants.gov', 'sam.gov'],

        sections: [
            { id: 'abstract', name: 'Technical Abstract', wordCount: 250 },
            { id: 'innovation', name: 'Innovation', wordCount: 500 },
            { id: 'objectives', name: 'Objectives', wordCount: 400 },
            { id: 'approach', name: 'Technical Approach', wordCount: 800 },
            { id: 'team', name: 'Team & Qualifications', wordCount: 400 },
            { id: 'facilities', name: 'Facilities & Equipment', wordCount: 200 },
            { id: 'budget', name: 'Budget Justification', wordCount: 400 }
        ]
    },

    'patent-application': {
        id: 'patent-application',
        name: 'Patent Attorney Agent',
        icon: '⚖️',
        color: '#f59e0b',
        description: 'Draft USPTO utility patent applications',
        systemPrompt: `You are an expert patent attorney specializing in utility patent applications.
Your role is to draft patent applications that:
- Clearly define the invention and its novel aspects
- Include broad claims that protect the invention
- Anticipate and address prior art
- Use precise legal language appropriate for USPTO

Use the provided invention disclosure documents to understand the invention.
Structure claims from broadest to narrowest.`,

        tools: ['file_read', 'prior_art_search'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Invention disclosure folder',
                type: 'folder_picker',
                description: 'Select folder with invention notes, diagrams, prototypes',
                required: true
            },
            {
                id: 'invention_title',
                label: 'Invention title',
                type: 'text',
                placeholder: 'Autonomous Drone Navigation System',
                required: true
            },
            {
                id: 'inventors',
                label: 'Inventor name(s)',
                type: 'text',
                placeholder: 'John Doe, Jane Smith',
                required: true
            }
        ],

        externalSources: ['USPTO', 'Google Patents'],

        sections: [
            { id: 'title', name: 'Title of Invention', wordCount: 20 },
            { id: 'field', name: 'Field of the Invention', wordCount: 100 },
            { id: 'background', name: 'Background', wordCount: 500 },
            { id: 'summary', name: 'Summary of the Invention', wordCount: 400 },
            { id: 'drawings', name: 'Brief Description of Drawings', wordCount: 200 },
            { id: 'detailed', name: 'Detailed Description', wordCount: 1500 },
            { id: 'claims', name: 'Claims', wordCount: 800 },
            { id: 'abstract', name: 'Abstract', wordCount: 150 }
        ]
    },

    'pitch-deck': {
        id: 'pitch-deck',
        name: 'Pitch Coach Agent',
        icon: '📊',
        color: '#8b5cf6',
        description: 'Create investor-ready pitch presentations',
        systemPrompt: `You are an experienced startup pitch coach who has helped companies raise over $500M.
Your role is to help create compelling pitch decks that:
- Tell a clear story about the problem and solution
- Demonstrate market opportunity with data
- Show traction and momentum
- Present a credible team
- Make a clear ask

Use the provided company documents to personalize the narrative.
Focus on clarity, visual suggestions, and investor psychology.`,

        tools: ['file_read', 'market_research'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Company docs folder',
                type: 'folder_picker',
                description: 'Select folder with business plan, financials, product info',
                required: true
            },
            {
                id: 'company_name',
                label: 'Company name',
                type: 'text',
                placeholder: 'TechStartup Inc.',
                required: true
            },
            {
                id: 'funding_stage',
                label: 'Funding stage',
                type: 'select',
                options: ['Pre-Seed', 'Seed', 'Series A', 'Series B+'],
                required: true
            },
            {
                id: 'ask_amount',
                label: 'Funding ask',
                type: 'text',
                placeholder: '$2M',
                required: false
            }
        ],

        externalSources: ['Crunchbase', 'PitchBook'],

        sections: [
            { id: 'cover', name: 'Cover Slide', wordCount: 20 },
            { id: 'problem', name: 'Problem', wordCount: 150 },
            { id: 'solution', name: 'Solution', wordCount: 200 },
            { id: 'market', name: 'Market Opportunity', wordCount: 200 },
            { id: 'product', name: 'Product', wordCount: 200 },
            { id: 'traction', name: 'Traction', wordCount: 150 },
            { id: 'business_model', name: 'Business Model', wordCount: 150 },
            { id: 'competition', name: 'Competition', wordCount: 150 },
            { id: 'team', name: 'Team', wordCount: 200 },
            { id: 'financials', name: 'Financials', wordCount: 150 },
            { id: 'ask', name: 'The Ask', wordCount: 100 }
        ]
    },

    'contract': {
        id: 'contract',
        name: 'Contract Drafting Agent',
        icon: '📄',
        color: '#ec4899',
        description: 'Draft business contracts and agreements',
        systemPrompt: `You are an experienced business attorney specializing in commercial contracts.
Your role is to draft clear, enforceable contracts that:
- Protect both parties' interests
- Use clear, unambiguous language
- Include appropriate standard clauses
- Address jurisdiction and dispute resolution

Use the provided context to customize terms and parties.`,

        tools: ['file_read'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Related documents folder',
                type: 'folder_picker',
                description: 'Select folder with relevant agreements, terms',
                required: false
            },
            {
                id: 'contract_type',
                label: 'Contract type',
                type: 'select',
                options: ['Service Agreement', 'NDA', 'Employment', 'Partnership', 'License'],
                required: true
            },
            {
                id: 'party_a',
                label: 'Party A (Your company)',
                type: 'text',
                placeholder: 'Acme Corp',
                required: true
            },
            {
                id: 'party_b',
                label: 'Party B (Other party)',
                type: 'text',
                placeholder: 'Client Inc.',
                required: true
            }
        ],

        externalSources: [],

        sections: [
            { id: 'parties', name: 'Parties', wordCount: 100 },
            { id: 'recitals', name: 'Recitals', wordCount: 150 },
            { id: 'definitions', name: 'Definitions', wordCount: 200 },
            { id: 'terms', name: 'Terms & Conditions', wordCount: 600 },
            { id: 'payment', name: 'Payment Terms', wordCount: 200 },
            { id: 'term_termination', name: 'Term & Termination', wordCount: 200 },
            { id: 'liability', name: 'Limitation of Liability', wordCount: 200 },
            { id: 'general', name: 'General Provisions', wordCount: 300 },
            { id: 'signatures', name: 'Signatures', wordCount: 50 }
        ]
    },

    'exec-summary': {
        id: 'exec-summary',
        name: 'Executive Summary Agent',
        icon: '📋',
        color: '#06b6d4',
        description: 'Create concise executive summaries',
        systemPrompt: `You are an expert at distilling complex information into clear, actionable executive summaries.
Your role is to create summaries that:
- Capture key points in 1-2 pages
- Lead with the most important information
- Use bullet points for scanability
- Include clear recommendations

Use the provided documents to extract and synthesize key information.`,

        tools: ['file_read'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Source documents folder',
                type: 'folder_picker',
                description: 'Select folder with documents to summarize',
                required: true
            },
            {
                id: 'audience',
                label: 'Target audience',
                type: 'select',
                options: ['Board of Directors', 'Investors', 'Executive Team', 'General'],
                required: true
            },
            {
                id: 'focus',
                label: 'Key focus area',
                type: 'text',
                placeholder: 'Q4 Performance',
                required: false
            }
        ],

        externalSources: [],

        sections: [
            { id: 'overview', name: 'Overview', wordCount: 150 },
            { id: 'key_findings', name: 'Key Findings', wordCount: 200 },
            { id: 'analysis', name: 'Analysis', wordCount: 300 },
            { id: 'recommendations', name: 'Recommendations', wordCount: 200 },
            { id: 'next_steps', name: 'Next Steps', wordCount: 100 }
        ]
    },

    // ============ INDUSTRY-SPECIFIC AGENTS ============

    'legal-brief': {
        id: 'legal-brief',
        name: 'Litigation Brief Agent',
        icon: '⚖️',
        color: '#dc2626',
        description: 'Draft litigation briefs with local-only processing for attorney-client privilege',
        systemPrompt: `You are an experienced litigation attorney drafting court briefs.
Your role is to create persuasive legal briefs that:
- Clearly state the legal issues
- Present facts favorable to your client
- Apply relevant case law and statutes
- Anticipate and rebut opposing arguments
- Follow court formatting requirements

IMPORTANT: All processing is local. No data leaves this device. Attorney-client privilege is maintained.
Use the provided case documents to craft compelling arguments.`,

        tools: ['file_read'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Case documents folder',
                type: 'folder_picker',
                description: 'Select folder with pleadings, discovery, evidence',
                required: true
            },
            {
                id: 'case_caption',
                label: 'Case caption',
                type: 'text',
                placeholder: 'Smith v. Jones, Case No. 2026-CV-1234',
                required: true
            },
            {
                id: 'court',
                label: 'Court',
                type: 'select',
                options: ['Federal District Court', 'State Superior Court', 'Appellate Court', 'Supreme Court'],
                required: true
            },
            {
                id: 'brief_type',
                label: 'Brief type',
                type: 'select',
                options: ['Motion to Dismiss', 'Summary Judgment', 'Opposition', 'Reply', 'Appellate Brief'],
                required: true
            }
        ],

        externalSources: ['Westlaw (local cache)', 'LexisNexis (local cache)'],

        sections: [
            { id: 'introduction', name: 'Introduction', wordCount: 200 },
            { id: 'facts', name: 'Statement of Facts', wordCount: 500 },
            { id: 'standard', name: 'Legal Standard', wordCount: 300 },
            { id: 'argument', name: 'Argument', wordCount: 1500 },
            { id: 'conclusion', name: 'Conclusion', wordCount: 150 }
        ]
    },

    'prior-auth': {
        id: 'prior-auth',
        name: 'Prior Authorization Agent',
        icon: '🏥',
        color: '#0ea5e9',
        description: 'Generate HIPAA-compliant prior authorization letters',
        systemPrompt: `You are a healthcare administrator expert in medical necessity documentation.
Your role is to create prior authorization letters that:
- Clearly establish medical necessity
- Reference clinical guidelines and peer-reviewed literature
- Document failed alternative treatments
- Match insurance carrier requirements
- Use appropriate ICD-10 and CPT codes

IMPORTANT: All patient data is processed LOCALLY. HIPAA compliance is maintained.
Never include unnecessary PHI. Use the minimum necessary standard.`,

        tools: ['file_read'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Patient chart folder',
                type: 'folder_picker',
                description: 'Select folder with relevant clinical notes',
                required: true
            },
            {
                id: 'procedure',
                label: 'Requested procedure/medication',
                type: 'text',
                placeholder: 'MRI Lumbar Spine or Humira',
                required: true
            },
            {
                id: 'icd10',
                label: 'Primary diagnosis (ICD-10)',
                type: 'text',
                placeholder: 'M54.5 - Low back pain',
                required: true
            },
            {
                id: 'insurance',
                label: 'Insurance carrier',
                type: 'select',
                options: ['Medicare', 'Medicaid', 'Blue Cross', 'UnitedHealthcare', 'Aetna', 'Cigna', 'Other'],
                required: true
            }
        ],

        externalSources: ['CMS Guidelines (local)', 'UpToDate (local cache)'],

        sections: [
            { id: 'header', name: 'Request Header', wordCount: 100 },
            { id: 'clinical_summary', name: 'Clinical Summary', wordCount: 300 },
            { id: 'medical_necessity', name: 'Medical Necessity', wordCount: 400 },
            { id: 'failed_alternatives', name: 'Failed Alternatives', wordCount: 200 },
            { id: 'supporting_evidence', name: 'Supporting Evidence', wordCount: 200 },
            { id: 'attachments', name: 'Required Attachments', wordCount: 100 }
        ]
    },

    'investment-memo': {
        id: 'investment-memo',
        name: 'Investment Memo Agent',
        icon: '💹',
        color: '#16a34a',
        description: 'Draft confidential investment memos for deal evaluation',
        systemPrompt: `You are a senior investment analyst at a top-tier fund.
Your role is to create investment memos that:
- Synthesize due diligence findings
- Present clear investment thesis
- Analyze financials and projections
- Identify risks and mitigants
- Provide actionable recommendations

IMPORTANT: All deal data processed LOCALLY. Competitive intelligence stays private.
This is material non-public information - treat accordingly.`,

        tools: ['file_read'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Deal room folder',
                type: 'folder_picker',
                description: 'Select folder with CIM, financials, deck',
                required: true
            },
            {
                id: 'company_name',
                label: 'Target company',
                type: 'text',
                placeholder: 'Acme Corp',
                required: true
            },
            {
                id: 'deal_type',
                label: 'Investment type',
                type: 'select',
                options: ['Venture Capital', 'Private Equity', 'M&A', 'Public Equity', 'Credit'],
                required: true
            },
            {
                id: 'investment_size',
                label: 'Proposed investment',
                type: 'text',
                placeholder: '$10M for 15%',
                required: false
            }
        ],

        externalSources: ['PitchBook (local)', 'CapIQ (local cache)'],

        sections: [
            { id: 'summary', name: 'Executive Summary', wordCount: 250 },
            { id: 'thesis', name: 'Investment Thesis', wordCount: 300 },
            { id: 'business', name: 'Business Overview', wordCount: 400 },
            { id: 'market', name: 'Market Analysis', wordCount: 300 },
            { id: 'financials', name: 'Financial Analysis', wordCount: 500 },
            { id: 'valuation', name: 'Valuation', wordCount: 300 },
            { id: 'risks', name: 'Risk Factors', wordCount: 300 },
            { id: 'recommendation', name: 'Recommendation', wordCount: 150 }
        ]
    },

    'sbir-proposal': {
        id: 'sbir-proposal',
        name: 'SBIR/STTR Proposal Agent',
        icon: '🛡️',
        color: '#7c3aed',
        description: 'Draft SBIR/STTR proposals with ITAR-safe local processing',
        systemPrompt: `You are an expert SBIR/STTR proposal writer with a 40%+ win rate.
Your role is to create winning proposals that:
- Align with agency technical objectives
- Demonstrate clear innovation and feasibility
- Present a credible commercialization path
- Highlight team qualifications
- Follow solicitation requirements exactly

IMPORTANT: All technical data processed LOCALLY. ITAR/CUI compliance maintained.
Export-controlled information never leaves this device.`,

        tools: ['file_read', 'grants_gov_search'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Technical documentation folder',
                type: 'folder_picker',
                description: 'Select folder with tech specs, papers, prior work',
                required: true
            },
            {
                id: 'topic_number',
                label: 'Solicitation topic number',
                type: 'text',
                placeholder: 'AF241-0042',
                required: true
            },
            {
                id: 'agency',
                label: 'Sponsoring agency',
                type: 'select',
                options: ['DoD / Air Force', 'DoD / Army', 'DoD / Navy', 'NASA', 'DOE', 'NSF', 'NIH', 'DHS'],
                required: true
            },
            {
                id: 'phase',
                label: 'Phase',
                type: 'select',
                options: ['Phase I', 'Phase II', 'Direct to Phase II'],
                required: true
            },
            {
                id: 'company_name',
                label: 'Company name',
                type: 'text',
                placeholder: 'Defense Tech Inc.',
                required: true
            }
        ],

        externalSources: ['SBIR.gov', 'SAM.gov', 'Grants.gov'],

        sections: [
            { id: 'abstract', name: 'Technical Abstract', wordCount: 200 },
            { id: 'identification', name: 'Identification & Significance', wordCount: 400 },
            { id: 'technical_objectives', name: 'Technical Objectives', wordCount: 300 },
            { id: 'work_plan', name: 'Work Plan', wordCount: 600 },
            { id: 'related_work', name: 'Related Work', wordCount: 200 },
            { id: 'key_personnel', name: 'Key Personnel', wordCount: 300 },
            { id: 'facilities', name: 'Facilities & Equipment', wordCount: 150 },
            { id: 'commercialization', name: 'Commercialization Strategy', wordCount: 400 },
            { id: 'cost', name: 'Cost Proposal Summary', wordCount: 200 }
        ]
    },

    // ============ DEVELOPER AGENT ============

    'dev-assistant': {
        id: 'dev-assistant',
        name: 'Code Assistant Agent',
        icon: '💻',
        color: '#3b82f6',
        description: 'AI pair programmer that understands your local codebase',
        systemPrompt: `You are an expert software engineer and code assistant.
Your role is to help with:
- Understanding and navigating codebases
- Writing clean, maintainable code
- Debugging and troubleshooting issues
- Refactoring and optimization
- Code review and best practices

IMPORTANT: All code analysis happens LOCALLY. Your proprietary code never leaves your device.
Use the indexed files from the user's workspace to provide context-aware assistance.
Always explain your reasoning and suggest best practices.`,

        tools: ['file_read', 'code_search'],

        preQuestions: [
            {
                id: 'context_folder',
                label: 'Project folder to analyze',
                type: 'folder_picker',
                description: 'Select your codebase or project folder',
                required: true
            },
            {
                id: 'language',
                label: 'Primary language',
                type: 'select',
                options: ['JavaScript/TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C#', 'Other'],
                required: true
            },
            {
                id: 'task_type',
                label: 'What do you need help with?',
                type: 'select',
                options: ['Write new code', 'Debug an issue', 'Refactor existing code', 'Code review', 'Explain code', 'Optimize performance'],
                required: true
            },
            {
                id: 'description',
                label: 'Describe your task',
                type: 'textarea',
                placeholder: 'e.g., Add authentication to the API routes...',
                required: true
            }
        ],

        externalSources: [],

        sections: [
            { id: 'analysis', name: 'Code Analysis', wordCount: 300 },
            { id: 'solution', name: 'Solution', wordCount: 500 },
            { id: 'implementation', name: 'Implementation', wordCount: 800 },
            { id: 'testing', name: 'Testing Recommendations', wordCount: 200 },
            { id: 'next_steps', name: 'Next Steps', wordCount: 150 }
        ]
    }
};

// Helper to get agent by ID
export const getDocumentAgent = (id) => DOCUMENT_AGENTS[id] || null;

// Get all agents as array
export const getAllDocumentAgents = () => Object.values(DOCUMENT_AGENTS);

export default DOCUMENT_AGENTS;



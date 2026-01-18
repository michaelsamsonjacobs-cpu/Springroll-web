/**
 * DocumentBuilder Service
 * Generates structured documents from templates using local context
 * Pitch Deck and Executive Summary are flagship examples
 */

import { AIService } from './GeminiService';
import FeedbackService from './FeedbackService';

// Document Templates Registry
export const DOCUMENT_TEMPLATES = {
    pitchDeck: {
        id: 'pitch-deck',
        name: 'Pitch Deck',
        description: 'Investor-ready 10-slide pitch deck',
        icon: 'presentation',
        sections: [
            { id: 'title', name: 'Title Slide', prompt: 'Company name, tagline, and logo placement' },
            { id: 'problem', name: 'Problem', prompt: 'What pain point are you solving? Make it visceral.' },
            { id: 'solution', name: 'Solution', prompt: 'Your product/service and how it solves the problem' },
            { id: 'market', name: 'Market Size', prompt: 'TAM, SAM, SOM with credible sources' },
            { id: 'product', name: 'Product', prompt: 'Key features, screenshots, or demo highlights' },
            { id: 'traction', name: 'Traction', prompt: 'Users, revenue, growth metrics, key milestones' },
            { id: 'business', name: 'Business Model', prompt: 'How you make money, pricing, unit economics' },
            { id: 'competition', name: 'Competition', prompt: 'Competitive landscape and your differentiation' },
            { id: 'team', name: 'Team', prompt: 'Founders, key hires, relevant experience' },
            { id: 'ask', name: 'The Ask', prompt: 'Funding amount, use of funds, timeline' }
        ]
    },
    execSummary: {
        id: 'exec-summary',
        name: 'Executive Summary',
        description: '1-2 page investor overview',
        icon: 'file-text',
        sections: [
            { id: 'overview', name: 'Company Overview', prompt: 'One paragraph company description' },
            { id: 'problem', name: 'Problem Statement', prompt: 'The market gap you address' },
            { id: 'solution', name: 'Solution', prompt: 'Your product and unique approach' },
            { id: 'market', name: 'Market Opportunity', prompt: 'Size and growth potential' },
            { id: 'traction', name: 'Traction & Milestones', prompt: 'Key achievements to date' },
            { id: 'team', name: 'Team', prompt: 'Founding team bios' },
            { id: 'financials', name: 'Financial Summary', prompt: 'Revenue, burn, projections' },
            { id: 'funding', name: 'Funding Request', prompt: 'Amount and use of proceeds' }
        ]
    },
    onePager: {
        id: 'one-pager',
        name: 'One-Pager',
        description: 'Single-page company overview',
        icon: 'file',
        sections: [
            { id: 'header', name: 'Header', prompt: 'Company name, logo, tagline' },
            { id: 'problem', name: 'Problem', prompt: '2-3 sentences on the pain point' },
            { id: 'solution', name: 'Solution', prompt: '2-3 sentences on your approach' },
            { id: 'features', name: 'Key Features', prompt: '3-4 bullet points' },
            { id: 'traction', name: 'Traction', prompt: 'Key metrics in bold' },
            { id: 'team', name: 'Team', prompt: 'Founders with one-line bios' },
            { id: 'contact', name: 'Contact', prompt: 'Email, website, calendly' }
        ]
    },
    investorUpdate: {
        id: 'investor-update',
        name: 'Investor Update',
        description: 'Monthly/quarterly investor email',
        icon: 'mail',
        sections: [
            { id: 'highlights', name: 'Highlights', prompt: 'Top 3 wins this period' },
            { id: 'metrics', name: 'Key Metrics', prompt: 'MRR, users, growth rate' },
            { id: 'product', name: 'Product Updates', prompt: 'What shipped, what is next' },
            { id: 'team', name: 'Team Updates', prompt: 'Hires, departures, org changes' },
            { id: 'challenges', name: 'Challenges', prompt: 'What you are struggling with' },
            { id: 'asks', name: 'Asks', prompt: 'Intros, advice, resources needed' },
            { id: 'runway', name: 'Runway', prompt: 'Months of runway, burn rate' }
        ]
    },
    grantProposal: {
        id: 'grant-proposal',
        name: 'Grant Proposal',
        description: 'SBIR/STTR style proposal',
        icon: 'award',
        sections: [
            { id: 'abstract', name: 'Technical Abstract', prompt: 'Project summary (250 words)' },
            { id: 'innovation', name: 'Innovation', prompt: 'What is novel about your approach' },
            { id: 'objectives', name: 'Objectives', prompt: 'Specific aims for this phase' },
            { id: 'approach', name: 'Technical Approach', prompt: 'How you will execute' },
            { id: 'team', name: 'Team Qualifications', prompt: 'Why your team can deliver' },
            { id: 'commercialization', name: 'Commercialization Plan', prompt: 'Path to market' },
            { id: 'budget', name: 'Budget Justification', prompt: 'How funds will be used' }
        ]
    },
    businessPlan: {
        id: 'business-plan',
        name: 'Business Plan',
        description: 'Comprehensive plan for any business type',
        icon: 'file-text',
        category: 'internal',
        // Business types for context-aware generation
        businessTypes: ['Startup', 'Franchise', 'Small Business', 'E-commerce', 'Service Business', 'Nonprofit'],
        sections: [
            { id: 'exec-summary', name: 'Executive Summary', prompt: 'High-level overview of your business concept, mission, and goals. Include your unique value proposition and funding needs.' },
            { id: 'company-description', name: 'Company Description', prompt: 'Business structure (LLC, Corp, Sole Prop), founding date, location, mission statement, and vision. Include business type (startup, franchise, small business, etc.)' },
            { id: 'products-services', name: 'Products & Services', prompt: 'Detailed description of what you sell or provide. Include pricing strategy, product lifecycle, intellectual property, and R&D plans.' },
            { id: 'market-analysis', name: 'Market Analysis', prompt: 'Industry overview, target market demographics, market size (TAM/SAM/SOM), growth trends, and customer personas.' },
            { id: 'competitive-analysis', name: 'Competitive Analysis', prompt: 'Direct and indirect competitors, competitive advantages, barriers to entry, and your differentiation strategy.' },
            { id: 'marketing-strategy', name: 'Marketing & Sales Strategy', prompt: 'How you will reach customers: marketing channels, customer acquisition strategy, sales process, and customer retention plans.' },
            { id: 'operations-plan', name: 'Operations Plan', prompt: 'Day-to-day operations, supply chain, production process, facilities, equipment, technology, and key suppliers.' },
            { id: 'management-team', name: 'Management & Organization', prompt: 'Organizational structure, management team bios, advisory board, hiring plan, and key roles to fill.' },
            { id: 'financial-projections', name: 'Financial Projections', prompt: '3-5 year projections: revenue forecast, expense budget, profit & loss, cash flow, break-even analysis, and key assumptions.' },
            { id: 'funding-request', name: 'Funding Request', prompt: 'How much capital you need, how it will be used, desired terms, and exit strategy for investors.' },
            { id: 'appendix', name: 'Appendix', prompt: 'Supporting documents: resumes, permits, licenses, contracts, market research data, product images.' }
        ],
        // Context questions to ask users
        contextQuestions: [
            { id: 'businessType', question: 'What type of business is this?', options: ['Tech Startup', 'Franchise', 'Small Business', 'E-commerce', 'Service Business', 'Nonprofit', 'Other'] },
            { id: 'stage', question: 'What stage is your business?', options: ['Idea/Concept', 'Pre-revenue', 'Early Revenue', 'Growth Stage', 'Established'] },
            { id: 'fundingGoal', question: 'What is your funding goal?', options: ['Bootstrapped', '$0-50K', '$50K-250K', '$250K-1M', '$1M-5M', '$5M+'] },
            { id: 'timeline', question: 'What is your launch timeline?', options: ['Already launched', 'Within 3 months', '3-6 months', '6-12 months', '1+ year'] },
            { id: 'industry', question: 'What industry are you in?', type: 'text' },
            { id: 'targetCustomer', question: 'Who is your target customer?', type: 'text' },
            { id: 'uniqueValue', question: 'What makes you different from competitors?', type: 'text' },
            { id: 'revenueModel', question: 'How will you make money?', options: ['Subscription', 'One-time sales', 'Marketplace/Commission', 'Advertising', 'Freemium', 'Licensing', 'Other'] }
        ]
    }
};

// Storage key
const DOCS_KEY = 'springroll_documents';

export const DocumentBuilder = {
    // Get all templates
    getTemplates() {
        return Object.values(DOCUMENT_TEMPLATES);
    },

    // Get specific template by ID
    getTemplate(templateId) {
        // Search by template.id, not object key
        return Object.values(DOCUMENT_TEMPLATES).find(t => t.id === templateId) || null;
    },

    // Get saved documents
    getSavedDocuments() {
        const data = localStorage.getItem(DOCS_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Save a document
    saveDocument(doc) {
        const docs = this.getSavedDocuments();
        const existing = docs.findIndex(d => d.id === doc.id);

        if (existing >= 0) {
            docs[existing] = { ...docs[existing], ...doc, updatedAt: new Date().toISOString() };
        } else {
            docs.push({
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                ...doc
            });
        }

        localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
        return docs[existing >= 0 ? existing : docs.length - 1];
    },

    // Delete a document
    deleteDocument(id) {
        const docs = this.getSavedDocuments().filter(d => d.id !== id);
        localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    },

    // Generate section content using AI with agent context + feedback enrichment
    async generateSection(templateId, sectionId, context = {}, agentContext = null) {
        const template = this.getTemplate(templateId);
        if (!template) throw new Error('Template not found');

        const section = template.sections.find(s => s.id === sectionId);
        if (!section) throw new Error('Section not found');

        // === FEEDBACK-DRIVEN PROMPT ENRICHMENT ===
        let styleGuidance = '';
        let terminologyGuidance = '';
        let exampleOutputs = '';
        let feedbackStats = { terminology: 0, style: null, examples: 0 };

        try {
            // Get learned terminology patterns (min 5 occurrences)
            const terminology = await FeedbackService.getTerminologyPatterns(templateId);
            if (terminology.length > 0) {
                feedbackStats.terminology = terminology.length;
                terminologyGuidance = `\n\n[TERMINOLOGY - Use these preferred terms]\n`;
                terminology.slice(0, 10).forEach(t => {
                    terminologyGuidance += `- Use "${t.to}" instead of "${t.from}" (${t.count} user corrections)\n`;
                });
            }

            // Get style preferences (min 10 samples)
            const style = await FeedbackService.getStylePreferences(templateId);
            if (style) {
                feedbackStats.style = style;
                styleGuidance = `\n\n[STYLE PREFERENCES - Based on ${style.sampleCount} samples]\n`;
                styleGuidance += `- Target sentence length: ~${style.avgSentenceLength} words\n`;
                styleGuidance += `- Content tendency: ${style.lengthTendency === 'expand' ? 'User prefers more detail' : style.lengthTendency === 'condense' ? 'User prefers concise content' : 'Balanced length'}\n`;
                styleGuidance += `- Formatting: ${style.prefersBullets ? 'Use bullet points for lists' : 'Use flowing prose'}\n`;
            }

            // Get example outputs that user has accepted (few-shot)
            const examples = await FeedbackService.getExampleOutputs(templateId, sectionId, 2);
            if (examples.length > 0) {
                feedbackStats.examples = examples.length;
                exampleOutputs = `\n\n[EXAMPLES - Content this user has approved]\n`;
                examples.forEach((ex, i) => {
                    exampleOutputs += `--- Example ${i + 1} ---\n${ex.slice(0, 500)}${ex.length > 500 ? '...' : ''}\n`;
                });
            }

            if (feedbackStats.terminology > 0 || feedbackStats.style || feedbackStats.examples > 0) {
                console.log(`[Feedback] Enriching prompt with ${feedbackStats.terminology} terms, ${feedbackStats.examples} examples`);
            }
        } catch (e) {
            // Gracefully continue without feedback enrichment
            console.warn('[Feedback] Could not load learned patterns:', e.message);
        }

        // Build context string from agentContext
        let contextInfo = '';
        if (agentContext) {
            const ans = agentContext.answers || {};

            // Add folder context
            if (ans.context_folder) {
                contextInfo += `\nPROJECT FOLDER: ${ans.context_folder}`;
            }

            // Add file context
            if (agentContext.fileContext?.length) {
                contextInfo += `\nINDEXED FILES: ${agentContext.fileContext.map(f => f.name).join(', ')}`;
            }

            // Add selected grant opportunity
            if (agentContext.selectedGrant) {
                const g = agentContext.selectedGrant;
                contextInfo += `\n\nGRANT OPPORTUNITY:\n- Title: ${g.title}\n- Agency: ${g.agency}\n- Award: ${g.awardAmount}\n- Deadline: ${g.deadline}\n- Description: ${g.description || 'N/A'}`;
            }

            // Add user inputs
            if (ans.company_name) contextInfo += `\nCOMPANY: ${ans.company_name}`;
            if (ans.pi_name) contextInfo += `\nPRINCIPAL INVESTIGATOR: ${ans.pi_name}`;
            if (ans.invention_title) contextInfo += `\nINVENTION: ${ans.invention_title}`;
            if (ans.inventors) contextInfo += `\nINVENTORS: ${ans.inventors}`;
            if (ans.funding_stage) contextInfo += `\nFUNDING STAGE: ${ans.funding_stage}`;
            if (ans.ask_amount) contextInfo += `\nFUNDING ASK: ${ans.ask_amount}`;
            if (ans.contract_type) contextInfo += `\nCONTRACT TYPE: ${ans.contract_type}`;
            if (ans.party_a) contextInfo += `\nPARTY A: ${ans.party_a}`;
            if (ans.party_b) contextInfo += `\nPARTY B: ${ans.party_b}`;
            if (ans.audience) contextInfo += `\nTARGET AUDIENCE: ${ans.audience}`;
        }

        // Get agent's specialized system prompt
        const agentPrompt = agentContext?.agent?.systemPrompt || '';

        // Build the full generation prompt with feedback enrichment
        const fullPrompt = `Generate the "${section.name}" section for this document.
SECTION GUIDANCE: ${section.prompt}
${styleGuidance}${terminologyGuidance}${exampleOutputs}
CONTEXT:
- Company: ${context.companyName || 'The Company'}
- Industry: ${context.industry || 'Technology'}
${contextInfo}

Write professional, compelling content for this section. Be specific and use the provided context.`;

        // Generate using AI with agent's specialized prompt
        let generatedContent;
        try {
            const tools = agentContext?.agent?.tools || [];
            generatedContent = await AIService.generate(fullPrompt, agentPrompt, tools);
        } catch (err) {
            console.warn('AI generation failed, using fallback:', err.message);
            generatedContent = `## ${section.name}\n\n[Unable to generate with AI - ${err.message}]\n\nPlease ensure your AI provider (Ollama or Gemini) is configured in Settings.`;
        }

        // Generate a tracking ID for feedback capture
        const generationId = crypto.randomUUID();

        return {
            sectionId,
            sectionName: section.name,
            prompt: section.prompt,
            content: generatedContent,
            generatedAt: new Date().toISOString(),
            // Feedback tracking metadata
            _generation: {
                id: generationId,
                templateId,
                enrichedWith: {
                    terminology: feedbackStats.terminology,
                    style: !!feedbackStats.style,
                    examples: feedbackStats.examples
                }
            }
        };
    },

    // Generate full document with agent context
    async generateDocument(templateId, context = {}, agentContext = null) {
        const template = this.getTemplate(templateId);
        if (!template) throw new Error('Template not found');

        const sections = [];
        for (const section of template.sections) {
            const generated = await this.generateSection(templateId, section.id, context, agentContext);
            sections.push(generated);
        }

        return {
            id: crypto.randomUUID(),
            templateId,
            templateName: template.name,
            sections,
            context,
            createdAt: new Date().toISOString(),
            status: 'draft'
        };
    },

    // Export document to Markdown
    exportToMarkdown(doc) {
        let md = `# ${doc.templateName}\n\n`;
        md += `*Generated: ${new Date(doc.createdAt).toLocaleDateString()}*\n\n---\n\n`;

        for (const section of doc.sections) {
            md += `## ${section.sectionName}\n\n`;
            md += `${section.content}\n\n`;
        }

        return md;
    },

    // Export document to HTML (for preview)
    exportToHTML(doc) {
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>${doc.templateName}</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #0f172a; color: #f8fafc; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        h2 { font-size: 1.25rem; color: #3b82f6; margin-top: 2rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
        p { line-height: 1.6; color: #cbd5e1; }
        .meta { font-size: 0.875rem; color: #64748b; margin-bottom: 2rem; }
    </style>
</head>
<body>
    <h1>${doc.templateName}</h1>
    <p class="meta">Generated: ${new Date(doc.createdAt).toLocaleDateString()}</p>
`;

        for (const section of doc.sections) {
            html += `    <h2>${section.sectionName}</h2>\n`;
            html += `    <p>${section.content.replace(/\n/g, '<br>')}</p>\n`;
        }

        html += `</body>\n</html>`;
        return html;
    },

    // === FEEDBACK CAPTURE HELPERS ===

    /**
     * Capture user edit to a generated section
     * Call this when user modifies generated content and saves
     */
    async captureEdit(docId, section, editedContent, context = {}) {
        if (!section?._generation) {
            console.warn('[Feedback] Cannot capture - missing generation metadata');
            return null;
        }

        return FeedbackService.captureEdit(
            docId,
            section._generation.templateId,
            section.sectionId,
            section.content,
            editedContent,
            context
        );
    },

    /**
     * Capture user acceptance (content kept as-is)
     * Call this when user explicitly accepts or saves without edits
     */
    async captureAcceptance(docId, section, context = {}) {
        if (!section?._generation) return null;

        return FeedbackService.captureAcceptance(
            docId,
            section._generation.templateId,
            section.sectionId,
            section.content,
            context
        );
    },

    /**
     * Capture user rejection (regenerate requested)
     * Call this when user clicks regenerate button
     */
    async captureRejection(docId, section, reason = '', context = {}) {
        if (!section?._generation) return null;

        return FeedbackService.captureRejection(
            docId,
            section._generation.templateId,
            section.sectionId,
            section.content,
            reason,
            context
        );
    },

    /**
     * Get feedback statistics for UI display
     */
    async getFeedbackStats() {
        return FeedbackService.getStats();
    },

    /**
     * Export user's style profile (for sharing/backup)
     */
    async exportStyleProfile() {
        return FeedbackService.exportStyleProfile();
    },

    /**
     * Import a style profile
     */
    async importStyleProfile(profileData) {
        return FeedbackService.importStyleProfile(profileData);
    }
};


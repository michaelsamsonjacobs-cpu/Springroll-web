/**
 * GTMAgent Service
 * Handles Go-to-Market operations: lead management, investor outreach, email drafting
 */

// Local storage keys
const LEADS_KEY = 'springroll_gtm_leads';
const INVESTORS_KEY = 'springroll_gtm_investors';
const CAMPAIGNS_KEY = 'springroll_gtm_campaigns';

export const GTMService = {
    // ==================== LEAD MANAGEMENT ====================

    getLeads() {
        const data = localStorage.getItem(LEADS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveLead(lead) {
        const leads = this.getLeads();
        const newLead = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'new',
            score: 0,
            ...lead
        };
        leads.push(newLead);
        localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
        return newLead;
    },

    updateLead(id, updates) {
        const leads = this.getLeads();
        const index = leads.findIndex(l => l.id === id);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
            return leads[index];
        }
        return null;
    },

    deleteLead(id) {
        const leads = this.getLeads().filter(l => l.id !== id);
        localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    },

    importLeadsFromCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const leads = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const lead = {};
            headers.forEach((h, idx) => {
                lead[h] = values[idx]?.trim() || '';
            });
            leads.push(this.saveLead(lead));
        }
        return leads;
    },

    // ==================== INVESTOR MANAGEMENT ====================

    getInvestors() {
        const data = localStorage.getItem(INVESTORS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveInvestor(investor) {
        const investors = this.getInvestors();
        const newInvestor = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'researching',
            score: 0,
            ...investor
        };
        investors.push(newInvestor);
        localStorage.setItem(INVESTORS_KEY, JSON.stringify(investors));
        return newInvestor;
    },

    updateInvestor(id, updates) {
        const investors = this.getInvestors();
        const index = investors.findIndex(i => i.id === id);
        if (index !== -1) {
            investors[index] = { ...investors[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(INVESTORS_KEY, JSON.stringify(investors));
            return investors[index];
        }
        return null;
    },

    // ==================== CAMPAIGN MANAGEMENT ====================

    getCampaigns() {
        const data = localStorage.getItem(CAMPAIGNS_KEY);
        return data ? JSON.parse(data) : [];
    },

    createCampaign(campaign) {
        const campaigns = this.getCampaigns();
        const newCampaign = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'draft',
            emails: [],
            stats: { sent: 0, opened: 0, replied: 0, meetings: 0 },
            ...campaign
        };
        campaigns.push(newCampaign);
        localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
        return newCampaign;
    },

    updateCampaign(id, updates) {
        const campaigns = this.getCampaigns();
        const index = campaigns.findIndex(c => c.id === id);
        if (index !== -1) {
            campaigns[index] = { ...campaigns[index], ...updates };
            localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
            return campaigns[index];
        }
        return null;
    },

    // ==================== LEAD SCORING ====================

    scoreLead(lead, icp) {
        let score = 0;

        // Company size match
        if (icp.minEmployees && icp.maxEmployees) {
            const emp = parseInt(lead.employees) || 0;
            if (emp >= icp.minEmployees && emp <= icp.maxEmployees) score += 25;
        }

        // Industry match
        if (icp.industries?.includes(lead.industry?.toLowerCase())) score += 25;

        // Location match
        if (icp.locations?.includes(lead.location?.toLowerCase())) score += 15;

        // Funding match
        if (icp.fundingStages?.includes(lead.fundingStage?.toLowerCase())) score += 20;

        // Tech stack match
        if (icp.techStack && lead.techStack) {
            const matches = icp.techStack.filter(t =>
                lead.techStack.toLowerCase().includes(t.toLowerCase())
            );
            score += Math.min(15, matches.length * 5);
        }

        return Math.min(100, score);
    },

    // ==================== EMAIL GENERATION ====================

    async generateEmail(lead, context, template = 'intro') {
        // This would integrate with GeminiService for AI generation
        // For now, return a template-based email
        const templates = {
            intro: `Hi ${lead.firstName || 'there'},

I noticed ${lead.company || 'your company'} is doing great work in ${lead.industry || 'your space'}. 

${context.valueProposition || 'I wanted to reach out because I think we could help.'}

Would you be open to a quick 15-minute call this week?

Best,
${context.senderName || 'Your Name'}`,

            followUp: `Hi ${lead.firstName || 'there'},

I wanted to follow up on my previous email. I know you're busy, so I'll keep this brief.

${context.followUpHook || 'I thought this might be relevant to what you are working on.'}

Let me know if you'd like to chat.

Best,
${context.senderName || 'Your Name'}`,

            investor: `Hi ${lead.firstName || 'there'},

I'm the founder of ${context.companyName || 'our startup'}, and I came across ${lead.firm || 'your fund'}'s thesis on ${lead.focus || 'the space we are building in'}.

${context.pitch || 'We are building something I think aligns well with your investment focus.'}

Would you be open to a 20-minute intro call?

Best,
${context.senderName || 'Your Name'}`
        };

        return templates[template] || templates.intro;
    },

    // ==================== INTENT SIGNALS ====================

    async fetchIntentSignals(company) {
        // Placeholder for intent signal API integration
        // Would integrate with Bombora, G2, or custom scrapers
        return {
            fundingNews: null,
            hiringActivity: null,
            techChanges: null,
            newsArticles: [],
            lastUpdated: new Date().toISOString()
        };
    },

    // ==================== STATISTICS ====================

    getStats() {
        const leads = this.getLeads();
        const investors = this.getInvestors();
        const campaigns = this.getCampaigns();

        return {
            totalLeads: leads.length,
            qualifiedLeads: leads.filter(l => l.score >= 70).length,
            totalInvestors: investors.length,
            activeCampaigns: campaigns.filter(c => c.status === 'active').length,
            emailsSent: campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0),
            meetings: campaigns.reduce((acc, c) => acc + (c.stats?.meetings || 0), 0)
        };
    }
};

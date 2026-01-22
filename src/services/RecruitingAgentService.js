/**
 * RecruitingAgentService.js
 * 
 * Specialized autonomous agent for HR & Talent Acquisition.
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Resume Screening, Outreach, Scheduling.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';
import { AIService } from './GeminiService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class RecruitingAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('recruiting'); // Agent ID: 'recruiting'
        this.worktreePath = null;
    }

    /**
     * Set the active worktree for this agent
     */
    setWorktree(path) {
        this.worktreePath = path;
        this.log(`Switched context to worktree: ${path}`);
    }

    /**
     * Skill: Screen Candidate
     * specificCriteria: Optional string to override default screening logic (e.g. "React + Node experience")
     */
    async screenCandidate(resumePath, specificCriteria = "") {
        if (!this.worktreePath) throw new Error("No active worktree");

        const absolutePath = `${this.worktreePath}/${resumePath}`;
        this.log(`Screening candidate: ${resumePath} against criteria: ${specificCriteria || 'General Fit'}`);

        try {
            const content = await invoke('read_file_content', { path: absolutePath });

            // Use LLM to screen immediately? Or return content for the main loop?
            // The main loop is better at handling the logic, so we return the raw text 
            // but we ensure the agent knows this is "Screening Material".
            return `RESUME CONTENT (${resumePath}):\n${content}\n\nSCREENING CRITERIA: ${specificCriteria}`;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: Highly flexible screening context
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const hrContext = `\nROLE: You are the Head of Talent. Your job is to find the perfect candidate.
        CRITICAL: Adapt your screening criteria strictly to what the user asks for (e.g. "First Screen", "Technical Deep Dive", "Culture Fit").
        If the user provides specific "Must Haves", reject any candidate who lacks them.\n`;

        const augmentedDescription = `${hrContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const RecruitingAgentService = new RecruitingAgentServiceClass();
export default RecruitingAgentService;

/**
 * HealthAgentService.js
 * 
 * Specialized autonomous agent for Healthcare (HIPAA compliance, Clinical Admin).
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Prior Authorization, Clinical Summaries, Regulatory Checks.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class HealthAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('health'); // Agent ID: 'health'
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
     * Skill: Review Clinical Note
     * Reads a text file to extract key medical information.
     */
    async reviewClinicalNote(relativePath) {
        if (!this.worktreePath) throw new Error("No active worktree");

        const absolutePath = `${this.worktreePath}/${relativePath}`;
        this.log(`Reviewing clinical note: ${relativePath}`);
        try {
            const content = await invoke('read_file_content', { path: absolutePath });
            // In a real app, this would strip PHI or handle DICOM.
            return content;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: Enforce HIPAA compliance context
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const healthContext = `\nROLE: You are an expert Medical Administrator. Your goal is to draft accurate clinical documentation (Prior Auth, Referrals) while maintaining strict HIPAA compliance. Do not HALLUCINATE patient data.\n`;
        const augmentedDescription = `${healthContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const HealthAgentService = new HealthAgentServiceClass();
export default HealthAgentService;

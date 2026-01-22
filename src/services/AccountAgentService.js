/**
 * AccountAgentService.js
 * 
 * Specialized autonomous agent for Post-Sales (Customer Success, Renewals, QBRs).
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Usage Analysis, Onboarding Plans, Renewal Drafting.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class AccountAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('account'); // Agent ID: 'account'
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
     * Skill: Analyze Usage
     * Reads CSVs or Logs to determine customer health.
     */
    async analyzeUsage(relativePath) {
        if (!this.worktreePath) throw new Error("No active worktree");

        const absolutePath = `${this.worktreePath}/${relativePath}`;
        this.log(`Analyzing usage data: ${relativePath}`);
        try {
            const content = await invoke('read_file_content', { path: absolutePath });
            return `Usage Metrics Preview:\n${content.slice(0, 500)}...`;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: Focus on Retention and Expansion
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const csmContext = `\nROLE: You are a Senior Customer Success Manager. Your goal is to Drive Retention, Create Value, and Expansion revenue. When writing QBRs, be strategic and data-driven.\n`;
        const augmentedDescription = `${csmContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const AccountAgentService = new AccountAgentServiceClass();
export default AccountAgentService;

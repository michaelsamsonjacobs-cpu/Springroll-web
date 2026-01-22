/**
 * FinanceAgentService.js
 * 
 * Specialized autonomous agent for Finance & Defense (Grants, SBIR, Compliance).
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Grant Writing, Budget Analysis, Compliance Checking.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class FinanceAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('finance'); // Agent ID: 'finance'
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
     * Skill: Analyze Budget
     * Reads CSV files to understand financial context.
     */
    async analyzeBudget(relativePath) {
        if (!this.worktreePath) throw new Error("No active worktree");

        const absolutePath = `${this.worktreePath}/${relativePath}`;
        this.log(`Analyzing budget: ${relativePath}`);
        try {
            const content = await invoke('read_file_content', { path: absolutePath });
            // In reality, we'd parse CSV headers here
            return `Budget Data (Mock Parse):\n${content.slice(0, 500)}...`;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: Enforce strict compliance in prompt
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const financeContext = `\nROLE: You are the CFO and Lead Grant Writer. Your job is to maximize non-dilutive funding (SBIR/STTR) and ensure 100% compliance with Defense/Gov standards.\n`;
        const augmentedDescription = `${financeContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const FinanceAgentService = new FinanceAgentServiceClass();
export default FinanceAgentService;

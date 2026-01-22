/**
 * QAAgentService.js
 * 
 * Specialized autonomous agent for Quality Assurance and Testing.
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Writing Tests, Verifying Bugs, Regression Testing.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class QAAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('qa'); // Agent ID: 'qa'
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
     * Skill: Run Test Suite
     * (Placeholder for future shell execution of 'npm test')
     */
    async runTestSuite() {
        this.log("Running mock test suite...");
        return "All tests passed (Mock).";
    }

    /**
     * Specialized Breakdown: Focus on Edge Cases and Reliability
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const qaContext = `\nROLE: You are the Lead QA Engineer. Your job is to break things. Find edge cases, write comprehensive test plans, and verify fixes. Be pedantic about quality.\n`;
        const augmentedDescription = `${qaContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const QAAgentService = new QAAgentServiceClass();
export default QAAgentService;

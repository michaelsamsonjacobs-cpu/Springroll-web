/**
 * LegalAgentService.js
 * 
 * Specialized autonomous agent for Legal tasks (Contracts, IP, Compliance).
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Contract Review, Redlining, IP Drafting.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';
import { AIService } from './GeminiService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class LegalAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('legal'); // Agent ID: 'legal'
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
     * Skill: Review Contract
     * Reads a document from the worktree to analyze.
     */
    async reviewContract(relativePath) {
        if (!this.worktreePath) throw new Error("No active worktree");

        // Construct detailed path
        const absolutePath = `${this.worktreePath}/${relativePath}`;

        this.log(`Reading contract: ${relativePath}`);
        try {
            const content = await invoke('read_file_content', { path: absolutePath });
            // In a real app, we'd have PDF parsing here. 
            // For now, we assume text/markdown contracts.
            return content;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: For Legal tasks, finding the doc is priority #1
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const legalContext = `\nROLE: You are the General Counsel. Your job is to protect the company, identify risks, and draft precise clauses.\n`;
        const augmentedDescription = `${legalContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const LegalAgentService = new LegalAgentServiceClass();
export default LegalAgentService;

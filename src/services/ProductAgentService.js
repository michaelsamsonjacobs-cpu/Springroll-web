/**
 * ProductAgentService.js
 * 
 * Specialized autonomous agent for Product Management.
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: PRD Writing, User Story Generation, Roadmap Management.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class ProductAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('product'); // Agent ID: 'product'
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
     * Skill: Review Roadmap
     * Reads markdown files to understand product direction.
     */
    async reviewRoadmap(relativePath) {
        if (!this.worktreePath) throw new Error("No active worktree");

        const absolutePath = `${this.worktreePath}/${relativePath}`;
        this.log(`Reviewing roadmap: ${relativePath}`);
        try {
            const content = await invoke('read_file_content', { path: absolutePath });
            return content;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: Focus on User Value and Clarity
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const pmContext = `\nROLE: You are the Head of Product. Your job is to translate vague ideas into clear, actionable PRDs and User Stories. Prioritize user value and feasibility.\n`;
        const augmentedDescription = `${pmContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const ProductAgentService = new ProductAgentServiceClass();
export default ProductAgentService;

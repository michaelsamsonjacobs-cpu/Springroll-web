/**
 * GTMAgentService.js
 * 
 * Specialized autonomous agent for Go-To-Market (Sales & Marketing) tasks.
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Lead Analysis, Email Drafting, Content Creation.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';
import { AIService } from './GeminiService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class GTMAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('gtm'); // Agent ID: 'gtm'
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
     * Skill: Analyze Leads Files
     * Scans the worktree for CSV or Excel files to process.
     */
    async analyzeLeads() {
        if (!this.worktreePath) throw new Error("No active worktree");

        this.log("Scanning for lead lists...");
        try {
            // Re-using git ls-files to find relevant data files
            const output = await GitWorktreeService.git(['ls-files', '*.csv', '*.xlsx'], this.worktreePath);
            const files = output.trim().split('\n').filter(f => f);

            if (files.length > 0) {
                this.log(`Found ${files.length} lead lists: ${files.join(', ')}`);
                return files;
            } else {
                this.log("No lead lists found in tracked files.");
                return [];
            }
        } catch (e) {
            this.log(`Lead analysis failed: ${e.message}`, 'error');
            return [];
        }
    }

    /**
     * Specialized Breakdown: For GTM tasks, check for data files first
     */
    async breakdownTask(taskDescription, taskType) {
        // First, get context if we are in a worktree
        let context = "";
        if (this.worktreePath) {
            const files = await this.analyzeLeads();
            if (files.length > 0) {
                context = `\nAVAILABLE DATA SOURCES:\nThe following lead lists are available:\n${files.join('\n')}`;
            }
        }

        // Augment the description with context before planning
        const augmentedDescription = `${taskDescription}${context}`;

        // Call parent planner
        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const GTMAgentService = new GTMAgentServiceClass();
export default GTMAgentService;

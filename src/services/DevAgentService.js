/**
 * DevAgentService.js
 * 
 * Specialized autonomous agent for Engineering tasks.
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Repo Analysis, Code Reading/Writing, Test Execution.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';
import { AIService } from './GeminiService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class DevAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('dev');
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
     * Skill: Analyze the repository structure
     * Uses `git ls-files` to get a clean map of the codebase (ignoring node_modules etc)
     */
    async analyzeRepo() {
        if (!this.worktreePath) throw new Error("No active worktree");

        this.log("Analyzing repository structure...");
        try {
            // Use our new run_git_command capability
            const output = await GitWorktreeService.git(['ls-files'], this.worktreePath);
            const files = output.trim().split('\n');
            this.log(`Found ${files.length} tracked files.`);
            return files;
        } catch (e) {
            this.log(`Repo analysis failed: ${e.message}`, 'error');
            return [];
        }
    }

    /**
     * Skill: Read a specific file
     */
    async readFile(relativePath) {
        if (!this.worktreePath) throw new Error("No active worktree");

        // Construct detailed path - careful with slashes on Windows
        // For simplicity, we assume relativePath is standardized

        // We can use the generic Tauri `read_file_content` if we pass absolute path?
        // Or we might need a `run_command` 'cat' equivalent.
        // Let's rely on standard fs read.

        const absolutePath = `${this.worktreePath}/${relativePath}`; // Basic join

        this.log(`Reading file: ${relativePath}`);
        try {
            // Utilizing the existing command we have in main.rs
            const content = await invoke('read_file_content', { path: absolutePath });
            return content;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: For code tasks, we scan the repo first
     */
    async breakdownTask(taskDescription, taskType) {
        // First, get context if we are in a worktree
        let context = "";
        if (this.worktreePath) {
            const files = await this.analyzeRepo();
            context = `\nREPO CONTEXT:\nThe repository contains ${files.length} files. Top level structure:\n${files.slice(0, 20).join('\n')}\n(Truncated list)`;
        }

        // Augment the description with context before planning
        const augmentedDescription = `${taskDescription}${context}`;

        // Call parent planner
        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const DevAgentService = new DevAgentServiceClass();
export default DevAgentService;

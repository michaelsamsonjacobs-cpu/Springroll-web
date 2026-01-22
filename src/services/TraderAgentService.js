/**
 * TraderAgentService.js
 * 
 * Specialized autonomous agent for Financial Markets (Stocks, Crypto, Forex).
 * Extends the core Ralph loop but operates within a Git Worktree.
 * Capabilities: Technical Analysis, Strategy Backtesting Design, Market Research.
 */

import { RalphAgentServiceClass, RALPH_TASK_TYPES } from './RalphAgentService';
import { GitWorktreeService } from './GitWorktreeService';

// Invoke helper
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { return "{}"; };

class TraderAgentServiceClass extends RalphAgentServiceClass {
    constructor() {
        super('trader'); // Agent ID: 'trader'
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
     * Skill: Analyze Chart Data
     * Reads CSV/JSON OHLCV data.
     */
    async analyzeChartData(relativePath) {
        if (!this.worktreePath) throw new Error("No active worktree");

        const absolutePath = `${this.worktreePath}/${relativePath}`;
        this.log(`Analyzing market data: ${relativePath}`);
        try {
            const content = await invoke('read_file_content', { path: absolutePath });
            // Potential for simple moving average calc here?
            return `Market Data Preview:\n${content.slice(0, 500)}...`;
        } catch (e) {
            this.log(`Read failed: ${e.message}`, 'error');
            return null;
        }
    }

    /**
     * Specialized Breakdown: Enforce Risk Management context
     */
    async breakdownTask(taskDescription, taskType) {
        // Inject Persona
        const traderContext = `\nROLE: You are a Quantitative Trader and Alpha Generator. Your goal is to find profitable strategies while STRICTLY managing risk. Prefer data-driven insights over speculation.\n`;
        const augmentedDescription = `${traderContext}${taskDescription}`;

        return super.breakdownTask(augmentedDescription, taskType);
    }
}

export const TraderAgentService = new TraderAgentServiceClass();
export default TraderAgentService;

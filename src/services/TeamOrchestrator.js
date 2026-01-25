/**
 * TeamOrchestrator - Coordinates AI Agent Execution
 * 
 * Ralph uses this service to dispatch scheduled tasks to appropriate agents.
 * Reads from teamSchedule, teamKPIs, and teamOKRs to determine what to run.
 */

import { TEAM_OKRS, getAgentOKRs, getAllAgents } from '../config/teamOKRs';
import { TEAM_KPIS, getAgentKPIs, getWeeklyTasks } from '../config/teamKPIs';
import { TEAM_SCHEDULE, getTodaysTasks, checkMonthlyMilestone, getCurrentQuarter } from '../config/teamSchedule';
import { RalphAgentService, RALPH_TASK_TYPES } from './RalphAgentService';
import { FinanceAgentService } from './FinanceAgentService';
import { LegalAgentService } from './LegalAgentService';
import { GTMAgentService } from './GTMAgentService';
import { ProductAgentService } from './ProductAgentService';
import { DevAgentService } from './DevAgentService';
import { QAAgentService } from './QAAgentService';

/**
 * Agent service registry
 */
const AGENT_SERVICES = {
    ralph: RalphAgentService,
    finance: FinanceAgentService,
    legal: LegalAgentService,
    // gtm: GTMAgentService,
    // product: ProductAgentService,
    // dev: DevAgentService,
    // qa: QAAgentService,
    // Additional agents can be added as they're implemented
};

/**
 * TeamOrchestrator Class
 */
class TeamOrchestratorClass {
    constructor() {
        this.isRunning = false;
        this.currentAgent = null;
        this.taskQueue = [];
        this.completedTasks = [];
        this.listeners = [];
    }

    /**
     * Subscribe to orchestrator events
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    }

    /**
     * Get today's scheduled tasks
     */
    getDailyAgenda() {
        const { dayOfWeek, schedule, tasks } = getTodaysTasks();
        const milestone = checkMonthlyMilestone();
        const quarter = getCurrentQuarter();

        return {
            date: new Date().toISOString().split('T')[0],
            dayOfWeek,
            focus: schedule.focus,
            description: schedule.description,
            tasks,
            milestone,
            quarter: quarter.quarter
        };
    }

    /**
     * Queue all tasks for today
     */
    queueDailyTasks() {
        const agenda = this.getDailyAgenda();
        this.taskQueue = [...agenda.tasks];
        this.emit('queue_updated', { queue: this.taskQueue });
        return this.taskQueue;
    }

    /**
     * Execute a single task via the appropriate agent
     */
    async executeTask(task) {
        const { agentId, taskPrompt, name, tools } = task;

        this.currentAgent = agentId;
        this.emit('task_started', { agentId, task: name });

        try {
            // Get the appropriate agent service
            const agentService = AGENT_SERVICES[agentId] || RalphAgentService;

            // Determine task type based on agent
            let taskType = RALPH_TASK_TYPES.CUSTOM;
            if (agentId === 'finance') taskType = RALPH_TASK_TYPES.GRANT;
            if (agentId === 'gtm') taskType = RALPH_TASK_TYPES.GTM;

            // Run the task
            const result = await agentService.runTask(taskPrompt, taskType);

            this.completedTasks.push({
                ...task,
                completedAt: new Date().toISOString(),
                result
            });

            this.emit('task_completed', { agentId, task: name, result });
            return result;

        } catch (error) {
            this.emit('task_failed', { agentId, task: name, error: error.message });
            throw error;
        } finally {
            this.currentAgent = null;
        }
    }

    /**
     * Run all queued tasks sequentially
     */
    async runDailySchedule() {
        if (this.isRunning) {
            console.warn('Orchestrator already running');
            return;
        }

        this.isRunning = true;
        this.emit('schedule_started', { tasks: this.taskQueue.length });

        const results = [];

        for (const task of this.taskQueue) {
            try {
                const result = await this.executeTask(task);
                results.push({ task: task.name, success: true, result });
            } catch (error) {
                results.push({ task: task.name, success: false, error: error.message });
            }
        }

        this.isRunning = false;
        this.taskQueue = [];
        this.emit('schedule_completed', { results });

        return results;
    }

    /**
     * Run a specific agent's weekly tasks
     */
    async runAgentWeeklyTasks(agentId) {
        const kpis = getAgentKPIs(agentId);
        if (!kpis?.weekly) {
            throw new Error(`No weekly KPIs found for agent: ${agentId}`);
        }

        const today = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[today.getDay()];

        const todaysTasks = kpis.weekly.filter(t => t.dayOfWeek === dayOfWeek);

        const results = [];
        for (const task of todaysTasks) {
            try {
                const result = await this.executeTask({ agentId, ...task });
                results.push({ task: task.name, success: true, result });
            } catch (error) {
                results.push({ task: task.name, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * Get OKR progress report for an agent
     */
    getAgentOKRProgress(agentId) {
        const okrs = getAgentOKRs(agentId);
        if (!okrs) return null;

        // This would normally pull from a database
        // For now, return the OKR structure with placeholder progress
        return {
            agent: okrs.name,
            role: okrs.role,
            objectives: okrs.annual.objectives.map(obj => ({
                ...obj,
                keyResults: obj.keyResults.map(kr => ({
                    ...kr,
                    current: 0,  // Would be pulled from tracking data
                    progress: 0  // Percentage towards target
                }))
            }))
        };
    }

    /**
     * Generate weekly report for all agents
     */
    generateWeeklyReport() {
        const agents = getAllAgents();
        const report = {
            generatedAt: new Date().toISOString(),
            quarter: getCurrentQuarter().quarter,
            agents: []
        };

        agents.forEach(agentId => {
            const okrs = getAgentOKRs(agentId);
            const completed = this.completedTasks.filter(t => t.agentId === agentId);

            report.agents.push({
                id: agentId,
                name: okrs?.name || agentId,
                role: okrs?.role || 'Agent',
                tasksCompleted: completed.length,
                lastActive: completed.length > 0
                    ? completed[completed.length - 1].completedAt
                    : null
            });
        });

        return report;
    }

    /**
     * Get status of orchestrator
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            currentAgent: this.currentAgent,
            queuedTasks: this.taskQueue.length,
            completedTasks: this.completedTasks.length,
            agenda: this.getDailyAgenda()
        };
    }
}

export const TeamOrchestrator = new TeamOrchestratorClass();
export default TeamOrchestrator;

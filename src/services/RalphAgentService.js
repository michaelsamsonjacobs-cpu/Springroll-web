/**
 * RalphAgentService - Autonomous Loop Agent for Springroll
 * 
 * Implements the Write→Verify→Fail→Learn→Repeat pattern inspired by
 * Anthropic's Claude Code Ralph Loop.
 * 
 * Core Philosophy: "Deterministically persistent in an indeterministic world."
 * The agent autonomously works through tasks until completion or max iterations.
 */

import { AIService } from './GeminiService';
import { RalphProgressStore } from './RalphProgressStore';

// Invoke helper for Tauri
const invoke = window.__TAURI__ ? window.__TAURI__.core.invoke : async () => { console.warn("Tauri not found"); return "{}"; };

// Promise token that signals task completion
const PROMISE_TOKEN = '<promise>COMPLETE</promise>';
const MAX_ITERATIONS_DEFAULT = 20;

/**
 * Task types that Ralph can handle
 */
export const RALPH_TASK_TYPES = {
    DOCUMENT: 'document',      // Document creation/editing
    CODE: 'code',              // Code generation/modification
    RESEARCH: 'research',      // Research and analysis
    GRANT: 'grant',            // Grant proposal writing
    GTM: 'gtm',                // Go-to-market tasks
    AUTOMATION: 'automation',  // Browser automation
    CUSTOM: 'custom'           // Custom tasks
};

/**
 * Task status enum
 */
export const RALPH_STATUS = {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETE: 'complete',
    FAILED: 'failed',
    ABORTED: 'aborted'
};

class RalphAgentServiceClass {
    constructor() {
        this.currentTask = null;
        this.status = RALPH_STATUS.IDLE;
        this.iteration = 0;
        this.maxIterations = MAX_ITERATIONS_DEFAULT;
        this.abortController = null;
        this.listeners = new Set();
        this.logs = [];
    }

    /**
     * Subscribe to status updates
     * @param {Function} callback - Called with (status, data) on updates
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Emit status update to all listeners
     */
    emit(event, data) {
        this.listeners.forEach(cb => cb(event, data));
    }

    /**
     * Add log entry
     */
    log(message, type = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            message,
            type,
            iteration: this.iteration
        };
        this.logs.push(entry);
        this.emit('log', entry);
        console.log(`[Ralph ${type.toUpperCase()}] Iteration ${this.iteration}: ${message}`);
    }

    /**
     * Break a task into executable chunks
     * @param {string} taskDescription - High-level task description
     * @param {string} taskType - Type of task
     * @param {Array} [automationSteps=null] - Predefined steps for automation tasks
     * @returns {Array} Array of task chunks
     */
    async breakdownTask(taskDescription, taskType, automationSteps = null) {
        if (taskType === RALPH_TASK_TYPES.AUTOMATION && automationSteps) {
            this.log('Loading predefined automation steps...');
            return automationSteps.map((s, i) => ({
                id: `step_${i + 1}`,
                description: s.description || `Action: ${s.type}`,
                verification: 'Browser action completed successfully',
                dependencies: i > 0 ? [`step_${i}`] : [],
                actionPayload: s // Store the raw automation payload
            }));
        }

        this.log('Breaking down task into chunks...');

        const breakdownPrompt = `You are a task planning assistant. Break down this task into 3-7 specific, actionable steps.

TASK TYPE: ${taskType}
TASK: ${taskDescription}

Respond with a JSON array of steps. Each step should have:
- "id": unique step identifier (step_1, step_2, etc.)
- "description": what to do
- "verification": how to verify it's done correctly
- "dependencies": array of step IDs this depends on (empty if none)

Example response:
[
  {"id": "step_1", "description": "Research target audience", "verification": "List of 3+ audience segments identified", "dependencies": []},
  {"id": "step_2", "description": "Create outline", "verification": "Outline has 5+ sections", "dependencies": ["step_1"]}
]

Respond ONLY with the JSON array, no other text.`;

        try {
            const response = await AIService.generate(breakdownPrompt, 'You are a task planning assistant. Respond only with valid JSON.');

            // Parse JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const steps = JSON.parse(jsonMatch[0]);
                this.log(`Task broken into ${steps.length} steps`);
                return steps;
            }
        } catch (e) {
            this.log(`Failed to break down task: ${e.message}`, 'error');
        }

        // Fallback: single step
        return [{
            id: 'step_1',
            description: taskDescription,
            verification: 'Task completed successfully',
            dependencies: []
        }];
    }

    /**
     * Execute a single step of the task
     * @param {Object} step - Step to execute
     * @param {Object} context - Execution context
     * @returns {Object} Step result
     */
    async executeStep(step, context) {
        this.log(`Executing step: ${step.description}`);

        // Handle automation steps
        if (step.actionPayload) {
            this.log(`Performing automation action: ${step.actionPayload.type}`);
            try {
                // Use the correct Tauri command with stringified payload
                const automationResult = await invoke('run_automation_sidecar', {
                    payload: JSON.stringify({
                        id: step.id,
                        action: 'execute_step', // or whatever the sidecar expects for a single step
                        payload: step.actionPayload
                    })
                });

                // Assuming result is a string if invoke returns string, or object. 
                // Based on AutomationPanel it returns a string response.

                this.log(`Automation action "${step.actionPayload.type}" result: ${automationResult}.`);
                return {
                    stepId: step.id,
                    output: `Automation action "${step.actionPayload.type}" completed. Sidecar: ${automationResult}`,
                    isComplete: true,
                    verification: step.verification
                };
            } catch (e) {
                this.log(`Automation action failed: ${e.message}`, 'error');
                return {
                    stepId: step.id,
                    output: `Automation action "${step.actionPayload.type}" failed: ${e.message}`,
                    isComplete: false,
                    verification: step.verification
                };
            }
        }

        // Existing AI-driven execution for other task types
        const memory = await RalphProgressStore.getMemoryString(this.currentTask.id);

        const executePrompt = `You are Ralph, an autonomous AI agent working on a task.

${memory}

CURRENT STEP: ${step.description}
VERIFICATION CRITERIA: ${step.verification}

PREVIOUS CONTEXT:
${context.previousResults || 'No previous results yet.'}

INSTRUCTIONS:
1. Execute this step thoroughly
2. Provide your complete output
3. If successful and verification criteria are met, end your response with: ${PROMISE_TOKEN}
4. If you encounter an error, explain what went wrong so we can learn from it

Execute the step now:`;

        const systemInstruction = `You are Ralph, an autonomous agent. Be precise, thorough, and always verify your work against the criteria. If complete, include ${PROMISE_TOKEN} at the end.`;

        const response = await AIService.generate(executePrompt, systemInstruction);

        const isComplete = response.includes(PROMISE_TOKEN);
        const cleanResponse = response.replace(PROMISE_TOKEN, '').trim();

        return {
            stepId: step.id,
            output: cleanResponse,
            isComplete,
            verification: step.verification
        };
    }

    /**
     * Verify step completion
     * @param {Object} result - Step result
     * @param {Object} step - Original step
     * @returns {Object} Verification result
     */
    async verifyStep(result, step) {
        if (result.isComplete) {
            this.log(`Step ${step.id} self-verified as complete`);
            return { passed: true, feedback: 'Self-verified complete' };
        }

        // Additional verification via AI
        const verifyPrompt = `Verify if this output meets the criteria.

STEP: ${step.description}
VERIFICATION CRITERIA: ${step.verification}

OUTPUT:
${result.output}

Does this output meet the verification criteria? Respond with:
{"passed": true/false, "feedback": "explanation"}`;

        try {
            const response = await AIService.generate(verifyPrompt, 'Respond only with JSON.');
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            this.log(`Verification parsing failed: ${e.message}`, 'warn');
        }

        return { passed: false, feedback: 'Verification inconclusive' };
    }

    /**
     * Start the Ralph loop for a task
     * @param {Object} task - Task configuration
     * @returns {Object} Final result
     */
    async startLoop(task) {
        if (this.status === RALPH_STATUS.RUNNING) {
            throw new Error('Ralph is already running a task');
        }

        // Initialize
        this.currentTask = {
            id: `ralph_${Date.now()}`,
            ...task,
            startedAt: new Date().toISOString()
        };
        this.status = RALPH_STATUS.RUNNING;
        this.iteration = 0;
        this.maxIterations = task.maxIterations || MAX_ITERATIONS_DEFAULT;
        this.abortController = new AbortController();
        this.logs = [];

        this.emit('start', { task: this.currentTask });
        this.log(`Starting Ralph loop for task: ${task.description}`);

        await RalphProgressStore.updateStatus(this.currentTask.id, 'running');

        try {
            // Break down the task
            const steps = await this.breakdownTask(task.description, task.type || RALPH_TASK_TYPES.CUSTOM);
            this.emit('breakdown', { steps });

            const completedSteps = new Set();
            const stepResults = {};
            let allComplete = false;

            // The Loop
            while (this.iteration < this.maxIterations && !allComplete) {
                this.iteration++;
                this.emit('iteration', { iteration: this.iteration, max: this.maxIterations });

                // Check for abort
                if (this.abortController.signal.aborted) {
                    this.log('Task aborted by user', 'warn');
                    this.status = RALPH_STATUS.ABORTED;
                    await RalphProgressStore.updateStatus(this.currentTask.id, 'aborted');
                    break;
                }

                // Find next step to execute
                const nextStep = steps.find(s =>
                    !completedSteps.has(s.id) &&
                    s.dependencies.every(d => completedSteps.has(d))
                );

                if (!nextStep) {
                    allComplete = completedSteps.size === steps.length;
                    break;
                }

                this.emit('step_start', { step: nextStep, iteration: this.iteration });

                // Build context from previous results
                const context = {
                    previousResults: Object.entries(stepResults)
                        .map(([id, r]) => `Step ${id}: ${r.output.slice(0, 500)}...`)
                        .join('\n\n')
                };

                // Execute step
                const result = await this.executeStep(nextStep, context);

                // Record iteration
                await RalphProgressStore.addIteration(this.currentTask.id, {
                    action: nextStep.description,
                    result: result.output.slice(0, 1000),
                    isComplete: result.isComplete
                });

                // Verify step
                const verification = await this.verifyStep(result, nextStep);

                if (verification.passed) {
                    completedSteps.add(nextStep.id);
                    stepResults[nextStep.id] = result;
                    this.log(`Step ${nextStep.id} completed successfully`);
                    this.emit('step_complete', { step: nextStep, result });

                    await RalphProgressStore.addLearning(
                        this.currentTask.id,
                        `Step "${nextStep.description}" succeeded`
                    );
                } else {
                    this.log(`Step ${nextStep.id} failed verification: ${verification.feedback}`, 'warn');
                    this.emit('step_failed', { step: nextStep, feedback: verification.feedback });

                    await RalphProgressStore.logError(
                        this.currentTask.id,
                        verification.feedback,
                        nextStep.description
                    );

                    await RalphProgressStore.addLearning(
                        this.currentTask.id,
                        `Step "${nextStep.description}" failed: ${verification.feedback}. Will retry with corrections.`
                    );
                }

                // Brief pause between iterations
                await new Promise(r => setTimeout(r, 500));
            }

            // Determine final status
            if (allComplete || completedSteps.size === steps.length) {
                this.status = RALPH_STATUS.COMPLETE;
                await RalphProgressStore.updateStatus(this.currentTask.id, 'complete');
                this.log(`Task completed successfully in ${this.iteration} iterations!`);

                this.emit('complete', {
                    task: this.currentTask,
                    iterations: this.iteration,
                    results: stepResults
                });

                return {
                    success: true,
                    iterations: this.iteration,
                    results: stepResults,
                    logs: this.logs
                };
            } else if (this.status !== RALPH_STATUS.ABORTED) {
                this.status = RALPH_STATUS.FAILED;
                await RalphProgressStore.updateStatus(this.currentTask.id, 'failed');
                this.log(`Task failed after ${this.iteration} iterations`, 'error');

                this.emit('failed', {
                    task: this.currentTask,
                    iterations: this.iteration,
                    reason: 'Max iterations reached'
                });

                return {
                    success: false,
                    iterations: this.iteration,
                    reason: 'Max iterations reached',
                    logs: this.logs
                };
            }

        } catch (error) {
            this.status = RALPH_STATUS.FAILED;
            await RalphProgressStore.updateStatus(this.currentTask.id, 'failed');
            this.log(`Task failed with error: ${error.message}`, 'error');

            await RalphProgressStore.logError(this.currentTask.id, error.message, 'loop execution');

            this.emit('error', { error: error.message });

            return {
                success: false,
                error: error.message,
                iterations: this.iteration,
                logs: this.logs
            };
        } finally {
            this.currentTask = null;
            this.abortController = null;
        }
    }

    /**
     * Abort the current task
     */
    abort() {
        if (this.abortController) {
            this.abortController.abort();
            this.log('Abort requested', 'warn');
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            status: this.status,
            task: this.currentTask,
            iteration: this.iteration,
            maxIterations: this.maxIterations,
            logs: this.logs
        };
    }

    /**
     * Quick task runner - convenience method
     * @param {string} description - Task description
     * @param {string} type - Task type
     */
    async runTask(description, type = RALPH_TASK_TYPES.CUSTOM) {
        return this.startLoop({
            description,
            type,
            maxIterations: MAX_ITERATIONS_DEFAULT
        });
    }
}

export const RalphAgentService = new RalphAgentServiceClass();
export default RalphAgentService;

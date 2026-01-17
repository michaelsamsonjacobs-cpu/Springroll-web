/**
 * WorkflowTrainer - AI-Powered Workflow Learning
 * Learns patterns from recorded workflows and suggests next steps
 */

import { AIService } from './GeminiService';

const STORAGE_KEY = 'springroll_workflow_training';

export const WorkflowTrainer = {
    /**
     * Get stored training data
     */
    getData: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"patterns":[],"sequences":[]}');
    },

    /**
     * Save training data
     */
    saveData: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    /**
     * Train from a workflow - extract patterns
     */
    trainFromWorkflow: (workflow) => {
        const data = WorkflowTrainer.getData();

        // Extract step sequences (pairs)
        const steps = workflow.steps || [];
        for (let i = 0; i < steps.length - 1; i++) {
            const pair = {
                from: steps[i].type,
                to: steps[i + 1].type,
                context: {
                    fromData: steps[i],
                    toData: steps[i + 1]
                }
            };
            data.sequences.push(pair);
        }

        // Extract URL patterns
        steps.filter(s => s.type === 'navigate').forEach(s => {
            if (s.url && !data.patterns.find(p => p.type === 'url' && p.value === s.url)) {
                data.patterns.push({ type: 'url', value: s.url, count: 1 });
            }
        });

        // Extract selector patterns
        steps.filter(s => s.selector).forEach(s => {
            const existing = data.patterns.find(p => p.type === 'selector' && p.value === s.selector);
            if (existing) {
                existing.count++;
            } else {
                data.patterns.push({ type: 'selector', value: s.selector, count: 1 });
            }
        });

        data.lastTrainedAt = new Date().toISOString();
        data.workflowCount = (data.workflowCount || 0) + 1;

        WorkflowTrainer.saveData(data);
        return data;
    },

    /**
     * Suggest next step based on current workflow
     */
    suggestNextStep: async (currentSteps) => {
        const data = WorkflowTrainer.getData();

        if (currentSteps.length === 0) {
            // Suggest most common first step
            return { type: 'navigate', url: 'https://', suggestion: 'Start by navigating to a URL' };
        }

        const lastStep = currentSteps[currentSteps.length - 1];

        // Find most common follow-up action
        const followUps = data.sequences.filter(s => s.from === lastStep.type);
        if (followUps.length > 0) {
            // Count occurrences
            const counts = {};
            followUps.forEach(f => {
                counts[f.to] = (counts[f.to] || 0) + 1;
            });
            const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            if (mostCommon) {
                return {
                    type: mostCommon[0],
                    suggestion: `Based on ${mostCommon[1]} similar workflows, "${mostCommon[0]}" often follows "${lastStep.type}"`
                };
            }
        }

        // Fall back to AI suggestion
        try {
            const prompt = `Given a workflow with these steps: ${JSON.stringify(currentSteps.map(s => s.type))}, what would be a logical next step? Respond with just the step type (navigate, click, type, wait, screenshot, or launch).`;
            const response = await AIService.generate(prompt, { maxTokens: 50 });
            const suggested = response.toLowerCase().trim();
            const validTypes = ['navigate', 'click', 'type', 'wait', 'screenshot', 'launch'];
            const matched = validTypes.find(t => suggested.includes(t));
            return { type: matched || 'wait', suggestion: 'AI suggested step' };
        } catch (e) {
            return { type: 'wait', suggestion: 'Default suggestion' };
        }
    },

    /**
     * Get training statistics
     */
    getStats: () => {
        const data = WorkflowTrainer.getData();
        return {
            workflowsTrained: data.workflowCount || 0,
            patterns: data.patterns?.length || 0,
            sequences: data.sequences?.length || 0,
            lastTrained: data.lastTrainedAt
        };
    },

    /**
     * Clear all training data
     */
    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};

export default WorkflowTrainer;

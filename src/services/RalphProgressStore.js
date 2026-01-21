/**
 * RalphProgressStore - Persistent memory for Ralph Agent
 * Equivalent to progress.txt in the original Ralph Loop specification
 * Uses IndexedDB for local persistence between iterations
 */

const DB_NAME = 'springroll_ralph';
const DB_VERSION = 1;
const STORE_NAME = 'progress';

class RalphProgressStoreClass {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                this.initialized = true;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'taskId' });
                }
            };
        });
    }

    /**
     * Get progress for a specific task
     * @param {string} taskId - Unique task identifier
     * @returns {Object} Progress object with iterations, errors, and learnings
     */
    async getProgress(taskId) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(taskId);

            request.onsuccess = () => {
                resolve(request.result || {
                    taskId,
                    iterations: [],
                    errors: [],
                    learnings: [],
                    createdAt: new Date().toISOString(),
                    status: 'pending'
                });
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Save progress for a task
     * @param {string} taskId - Unique task identifier
     * @param {Object} progress - Progress data to save
     */
    async saveProgress(taskId, progress) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put({ ...progress, taskId, updatedAt: new Date().toISOString() });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Add an iteration record
     * @param {string} taskId - Task identifier
     * @param {Object} iteration - Iteration data (action, result, error)
     */
    async addIteration(taskId, iteration) {
        const progress = await this.getProgress(taskId);
        progress.iterations.push({
            ...iteration,
            timestamp: new Date().toISOString(),
            index: progress.iterations.length + 1
        });
        await this.saveProgress(taskId, progress);
        return progress;
    }

    /**
     * Log an error for learning
     * @param {string} taskId - Task identifier
     * @param {string} error - Error message
     * @param {string} context - Context where error occurred
     */
    async logError(taskId, error, context = '') {
        const progress = await this.getProgress(taskId);
        progress.errors.push({
            error,
            context,
            timestamp: new Date().toISOString()
        });
        await this.saveProgress(taskId, progress);
    }

    /**
     * Add a learning from failed attempts
     * @param {string} taskId - Task identifier
     * @param {string} learning - What was learned from failure
     */
    async addLearning(taskId, learning) {
        const progress = await this.getProgress(taskId);
        progress.learnings.push({
            learning,
            timestamp: new Date().toISOString()
        });
        await this.saveProgress(taskId, progress);
    }

    /**
     * Update task status
     * @param {string} taskId - Task identifier
     * @param {string} status - New status (pending, running, complete, failed, aborted)
     */
    async updateStatus(taskId, status) {
        const progress = await this.getProgress(taskId);
        progress.status = status;
        if (status === 'complete') {
            progress.completedAt = new Date().toISOString();
        }
        await this.saveProgress(taskId, progress);
    }

    /**
     * Get formatted memory string for AI context
     * @param {string} taskId - Task identifier
     * @returns {string} Formatted progress for AI consumption
     */
    async getMemoryString(taskId) {
        const progress = await this.getProgress(taskId);

        let memory = `# Ralph Progress Memory for Task: ${taskId}\n\n`;
        memory += `Status: ${progress.status}\n`;
        memory += `Iterations: ${progress.iterations.length}\n\n`;

        if (progress.errors.length > 0) {
            memory += `## Previous Errors (Learn from these):\n`;
            progress.errors.slice(-5).forEach((e, i) => {
                memory += `${i + 1}. ${e.error}\n`;
                if (e.context) memory += `   Context: ${e.context}\n`;
            });
            memory += '\n';
        }

        if (progress.learnings.length > 0) {
            memory += `## Learnings:\n`;
            progress.learnings.forEach((l, i) => {
                memory += `${i + 1}. ${l.learning}\n`;
            });
            memory += '\n';
        }

        if (progress.iterations.length > 0) {
            const lastIteration = progress.iterations[progress.iterations.length - 1];
            memory += `## Last Iteration (${lastIteration.index}):\n`;
            memory += `Action: ${lastIteration.action || 'N/A'}\n`;
            memory += `Result: ${lastIteration.result || 'N/A'}\n`;
            if (lastIteration.error) {
                memory += `Error: ${lastIteration.error}\n`;
            }
        }

        return memory;
    }

    /**
     * Clear all progress (for testing/reset)
     */
    async clearAll() {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all active tasks
     * @returns {Array} List of all tasks with their progress
     */
    async getAllTasks() {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
}

export const RalphProgressStore = new RalphProgressStoreClass();
export default RalphProgressStore;

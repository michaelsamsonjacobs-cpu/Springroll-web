/**
 * FeedbackService - Captures user feedback and edits to improve AI output
 * 
 * Stores feedback locally in IndexedDB for privacy-first learning.
 * Patterns extracted from feedback are used to customize future generations.
 */

const DB_NAME = 'SpringrollFeedbackDB';
const DB_VERSION = 1;
const STORES = {
    feedback: 'feedback',
    styleProfiles: 'styleProfiles'
};

export const FeedbackService = {
    db: null,

    /**
     * Initialize IndexedDB for feedback storage
     */
    async initialize() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;

                // Feedback records store
                if (!db.objectStoreNames.contains(STORES.feedback)) {
                    const feedbackStore = db.createObjectStore(STORES.feedback, { keyPath: 'id' });
                    feedbackStore.createIndex('templateId', 'templateId', { unique: false });
                    feedbackStore.createIndex('sectionId', 'sectionId', { unique: false });
                    feedbackStore.createIndex('feedbackType', 'feedbackType', { unique: false });
                    feedbackStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Style profiles store (per-user)
                if (!db.objectStoreNames.contains(STORES.styleProfiles)) {
                    db.createObjectStore(STORES.styleProfiles, { keyPath: 'userId' });
                }
            };
        });
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Compute diff between original and edited text
     */
    computeDiff(original, edited) {
        if (!original || !edited) return null;

        const originalWords = original.split(/\s+/);
        const editedWords = edited.split(/\s+/);

        const additions = [];
        const deletions = [];
        const substitutions = [];

        // Simple word-level diff (for more complex, use a proper diff library)
        const originalSet = new Set(originalWords);
        const editedSet = new Set(editedWords);

        // Find deletions (in original but not edited)
        originalWords.forEach(word => {
            if (!editedSet.has(word) && word.length > 2) {
                deletions.push(word);
            }
        });

        // Find additions (in edited but not original)
        editedWords.forEach(word => {
            if (!originalSet.has(word) && word.length > 2) {
                additions.push(word);
            }
        });

        // Detect substitution patterns (adjacent replacement)
        // This is a heuristic - look for similar position replacements
        const minLen = Math.min(originalWords.length, editedWords.length);
        for (let i = 0; i < minLen; i++) {
            const origWord = originalWords[i]?.toLowerCase();
            const editWord = editedWords[i]?.toLowerCase();
            if (origWord && editWord && origWord !== editWord) {
                // Check if it's a likely substitution (similar length, not just punctuation)
                if (Math.abs(origWord.length - editWord.length) < 5) {
                    substitutions.push({ from: originalWords[i], to: editedWords[i] });
                }
            }
        }

        return {
            additions: [...new Set(additions)],
            deletions: [...new Set(deletions)],
            substitutions: substitutions.slice(0, 10), // Limit to top 10
            lengthChange: edited.length - original.length,
            wordCountChange: editedWords.length - originalWords.length
        };
    },

    /**
     * Capture user edit to generated content
     * @param {string} docId - Document ID
     * @param {string} templateId - Template type (e.g., 'pitch-deck')
     * @param {string} sectionId - Section ID (e.g., 'problem')
     * @param {string} original - AI-generated content
     * @param {string} edited - User's final version
     * @param {object} context - Additional context
     */
    async captureEdit(docId, templateId, sectionId, original, edited, context = {}) {
        await this.initialize();

        const diff = this.computeDiff(original, edited);

        const record = {
            id: this.generateId(),
            docId,
            templateId,
            sectionId,
            feedbackType: 'edit',
            original,
            edited,
            diff,
            context,
            timestamp: Date.now()
        };

        return this.saveRecord(record);
    },

    /**
     * Capture when user accepts content without changes (positive signal)
     */
    async captureAcceptance(docId, templateId, sectionId, content, context = {}) {
        await this.initialize();

        const record = {
            id: this.generateId(),
            docId,
            templateId,
            sectionId,
            feedbackType: 'accept',
            original: content,
            edited: null,
            diff: null,
            context,
            timestamp: Date.now()
        };

        return this.saveRecord(record);
    },

    /**
     * Capture when user rejects/regenerates content
     */
    async captureRejection(docId, templateId, sectionId, content, reason = '', context = {}) {
        await this.initialize();

        const record = {
            id: this.generateId(),
            docId,
            templateId,
            sectionId,
            feedbackType: 'reject',
            original: content,
            edited: null,
            diff: null,
            reason,
            context,
            timestamp: Date.now()
        };

        return this.saveRecord(record);
    },

    /**
     * Save feedback record to IndexedDB
     */
    async saveRecord(record) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.feedback], 'readwrite');
            const store = transaction.objectStore(STORES.feedback);
            const request = store.put(record);

            request.onsuccess = () => {
                console.log(`[Feedback] Captured ${record.feedbackType} for ${record.templateId}/${record.sectionId}`);
                resolve(record);
            };
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Get all feedback for a template/section
     */
    async getFeedback(templateId, sectionId = null, limit = 100) {
        await this.initialize();

        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORES.feedback], 'readonly');
            const store = transaction.objectStore(STORES.feedback);
            const index = store.index('templateId');
            const request = index.getAll(templateId);

            request.onsuccess = () => {
                let results = request.result || [];

                // Filter by section if specified
                if (sectionId) {
                    results = results.filter(r => r.sectionId === sectionId);
                }

                // Sort by timestamp descending, limit
                results.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results.slice(0, limit));
            };
        });
    },

    /**
     * Get terminology substitution patterns from edits
     * Requires minimum 5 samples for a term to be included
     */
    async getTerminologyPatterns(templateId = null) {
        await this.initialize();

        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORES.feedback], 'readonly');
            const store = transaction.objectStore(STORES.feedback);
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result || [];
                const edits = records.filter(r =>
                    r.feedbackType === 'edit' &&
                    r.diff?.substitutions?.length > 0 &&
                    (!templateId || r.templateId === templateId)
                );

                // Count substitution occurrences
                const subCounts = {};
                edits.forEach(edit => {
                    edit.diff.substitutions.forEach(sub => {
                        const key = `${sub.from.toLowerCase()}|${sub.to.toLowerCase()}`;
                        subCounts[key] = (subCounts[key] || 0) + 1;
                    });
                });

                // Filter to 5+ occurrences (configurable threshold)
                const MIN_COUNT = 5;
                const patterns = Object.entries(subCounts)
                    .filter(([_, count]) => count >= MIN_COUNT)
                    .map(([key, count]) => {
                        const [from, to] = key.split('|');
                        return { from, to, count };
                    })
                    .sort((a, b) => b.count - a.count);

                resolve(patterns);
            };
        });
    },

    /**
     * Get style preferences from feedback patterns
     * Requires minimum 10 samples for style inference
     */
    async getStylePreferences(templateId = null) {
        await this.initialize();

        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORES.feedback], 'readonly');
            const store = transaction.objectStore(STORES.feedback);
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result || [];
                const relevantRecords = templateId
                    ? records.filter(r => r.templateId === templateId)
                    : records;

                const MIN_SAMPLES = 10;
                if (relevantRecords.length < MIN_SAMPLES) {
                    resolve(null); // Not enough data
                    return;
                }

                // Analyze accepted content for style patterns
                const accepted = relevantRecords.filter(r =>
                    r.feedbackType === 'accept' || r.feedbackType === 'edit'
                );

                // Calculate average sentence length from final content
                let totalSentences = 0;
                let totalWords = 0;
                accepted.forEach(r => {
                    const content = r.edited || r.original;
                    if (!content) return;
                    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
                    const words = content.split(/\s+/).filter(w => w.length > 0);
                    totalSentences += sentences.length;
                    totalWords += words.length;
                });

                const avgSentenceLength = totalSentences > 0
                    ? Math.round(totalWords / totalSentences)
                    : 15;

                // Analyze length preferences from edits
                const edits = relevantRecords.filter(r => r.feedbackType === 'edit' && r.diff);
                const avgLengthChange = edits.length > 0
                    ? edits.reduce((sum, e) => sum + (e.diff.lengthChange || 0), 0) / edits.length
                    : 0;

                // Detect bullet preference
                const bulletCount = accepted.filter(r => {
                    const content = r.edited || r.original;
                    return content && (content.includes('•') || content.includes('- ') || content.includes('* '));
                }).length;
                const prefersBullets = bulletCount / accepted.length > 0.5;

                resolve({
                    avgSentenceLength,
                    lengthTendency: avgLengthChange > 50 ? 'expand' : avgLengthChange < -50 ? 'condense' : 'neutral',
                    prefersBullets,
                    sampleCount: relevantRecords.length,
                    lastUpdated: Date.now()
                });
            };
        });
    },

    /**
     * Get example outputs that were accepted (for few-shot prompting)
     */
    async getExampleOutputs(templateId, sectionId, limit = 3) {
        await this.initialize();

        const feedback = await this.getFeedback(templateId, sectionId, 50);

        // Prioritize accepted content, then edited final versions
        const examples = feedback
            .filter(r => r.feedbackType === 'accept' || r.feedbackType === 'edit')
            .map(r => r.edited || r.original)
            .filter(content => content && content.length > 50)
            .slice(0, limit);

        return examples;
    },

    /**
     * Export all feedback as training data (JSONL format for fine-tuning)
     */
    async exportTrainingData() {
        await this.initialize();

        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORES.feedback], 'readonly');
            const store = transaction.objectStore(STORES.feedback);
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result || [];

                // Convert to instruction/input/output format
                const trainingData = records
                    .filter(r => r.feedbackType === 'edit' && r.original && r.edited)
                    .map(r => ({
                        instruction: `Generate a ${r.sectionId} section for a ${r.templateId} document.`,
                        input: JSON.stringify(r.context || {}),
                        output: r.edited
                    }));

                // Return as JSONL string
                const jsonl = trainingData.map(d => JSON.stringify(d)).join('\n');
                resolve({
                    data: trainingData,
                    jsonl,
                    count: trainingData.length
                });
            };
        });
    },

    /**
     * Import a style profile (for sharing between users/teams)
     */
    async importStyleProfile(profileData) {
        await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.styleProfiles], 'readwrite');
            const store = transaction.objectStore(STORES.styleProfiles);

            profileData.importedAt = Date.now();
            const request = store.put(profileData);

            request.onsuccess = () => resolve(profileData);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Export current user's style profile
     */
    async exportStyleProfile(userId = 'default') {
        const terminology = await this.getTerminologyPatterns();
        const style = await this.getStylePreferences();

        return {
            userId,
            terminology,
            style,
            exportedAt: Date.now(),
            version: '1.0'
        };
    },

    /**
     * Get feedback statistics
     */
    async getStats() {
        await this.initialize();

        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORES.feedback], 'readonly');
            const store = transaction.objectStore(STORES.feedback);
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result || [];

                const stats = {
                    total: records.length,
                    edits: records.filter(r => r.feedbackType === 'edit').length,
                    accepts: records.filter(r => r.feedbackType === 'accept').length,
                    rejects: records.filter(r => r.feedbackType === 'reject').length,
                    byTemplate: {},
                    oldestRecord: null,
                    newestRecord: null
                };

                // Count by template
                records.forEach(r => {
                    stats.byTemplate[r.templateId] = (stats.byTemplate[r.templateId] || 0) + 1;
                });

                // Timestamps
                if (records.length > 0) {
                    const sorted = records.sort((a, b) => a.timestamp - b.timestamp);
                    stats.oldestRecord = sorted[0].timestamp;
                    stats.newestRecord = sorted[sorted.length - 1].timestamp;
                }

                resolve(stats);
            };
        });
    },

    /**
     * Clear all feedback data
     */
    async clear() {
        await this.initialize();

        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORES.feedback, STORES.styleProfiles], 'readwrite');
            transaction.objectStore(STORES.feedback).clear();
            transaction.objectStore(STORES.styleProfiles).clear();
            transaction.oncomplete = () => resolve();
        });
    }
};

export default FeedbackService;

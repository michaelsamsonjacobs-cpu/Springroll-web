/**
 * GlobalBrainService - Orchestrates long-term learning for Springroll Agents
 * 
 * Captures user-approved outputs as "Golden Samples" and indexes them 
 * into the local vector store for style and knowledge reuse.
 */

import EmbeddingService from './EmbeddingService';
import FeedbackService from './FeedbackService';

export const GlobalBrainService = {
    /**
     * Recall relevant knowledge from the global brain.
     * @param {string} query - The search query (usually the task/step description)
     * @param {number} limit - Max number of results to return
     * @param {number} threshold - Minimum similarity score (0-1)
     * @returns {Promise<Array<{content: string, metadata: object, score: number}>>}
     */
    async recall(query, limit = 3, threshold = 0.6) {
        if (!query) return [];

        console.log(`[GlobalBrain] Recalling for: "${query.slice(0, 50)}..."`);

        try {
            const results = await EmbeddingService.search(query, limit);

            // Filter by threshold
            const relevant = results.filter(r => r.score >= threshold);

            if (relevant.length > 0) {
                console.log(`[GlobalBrain] Found ${relevant.length} relevant memories.`);
            }

            return relevant;
        } catch (e) {
            console.error('[GlobalBrain] Recall failed:', e);
            return [];
        }
    },

    /**
     * Learn from a piece of content that the user has marked as high quality.
     * @param {string} content - The text content to learn from
     * @param {string} source - The source of the content (e.g., 'ralph', 'doc-builder')
     * @param {object} metadata - Additional metadata (templateId, sectionId, companyName, etc.)
     */
    async learnFromOutput(content, source, metadata = {}) {
        if (!content || content.length < 50) return;

        console.log(`[GlobalBrain] Learning from ${source} output...`);

        try {
            // 1. Vectorize and Index as a Golden Sample
            await EmbeddingService.indexContent(content, {
                ...metadata,
                kind: 'golden_sample',
                source,
                timestamp: Date.now()
            });
        } catch (e) {
            console.error('[GlobalBrain] Indexing failed:', e);
            throw e;
        }

        try {
            // 2. Extract style/terminology for FeedbackService (if applicable)
            // FeedbackService usually works on pairs (original vs edited), 
            // but we can pass it as a "perfection" signal.
            if (metadata.templateId && metadata.sectionId) {
                await FeedbackService.captureDirectApproval(
                    metadata.docId || 'global',
                    metadata.templateId,
                    metadata.sectionId,
                    content,
                    metadata
                );
            }
        } catch (e) {
            console.warn('[GlobalBrain] Style capture failed:', e.message);
        }

        return { success: true, timestamp: Date.now() };
    }
};

export default GlobalBrainService;

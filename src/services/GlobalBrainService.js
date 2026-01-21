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

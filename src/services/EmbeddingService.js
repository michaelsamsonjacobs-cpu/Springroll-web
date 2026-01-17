import { pipeline } from '@xenova/transformers';

/**
 * EmbeddingService - Hybrid Semantic Search Engine
 * 
 * Supports two modes:
 * 1. TRANSFORMERS (Default): Zero-setup, runs in-browser (WASM). Fast but smaller model.
 *    Model: all-MiniLM-L6-v2 (23MB)
 * 2. OLLAMA (Pro): Requires local install. Higher quality.
 *    Model: nomic-embed-text (~300MB)
 */

const DB_NAME = 'SpringrollVectorDB';
const DB_VERSION = 1;
const STORE_NAME = 'vectors';

export const EmbeddingService = {
    mode: 'transformers', // 'transformers' | 'ollama'
    pipe: null, // Transformers pipeline instance
    db: null,

    async initialize(preferredMode = 'transformers') {
        this.mode = preferredMode;
        await this.initDB();

        if (this.mode === 'transformers') {
            await this.initTransformers();
        }
        // Ollama doesn't need init, just API checks
    },

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    },

    async initTransformers() {
        if (this.pipe) return;
        try {
            // Singleton pipeline for feature-extraction
            this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log("Transformers.js initialized (all-MiniLM-L6-v2)");
        } catch (e) {
            console.error("Failed to init Transformers.js", e);
            throw e;
        }
    },

    /**
     * Generate embedding for a text string
     */
    async generateEmbedding(text) {
        if (!text || !text.trim()) return null;

        if (this.mode === 'ollama') {
            return this.generateOllamaEmbedding(text);
        } else {
            return this.generateTransformerEmbedding(text);
        }
    },

    async generateTransformerEmbedding(text) {
        if (!this.pipe) await this.initTransformers();

        // Generate embedding
        const output = await this.pipe(text, { pooling: 'mean', normalize: true });
        // Convert Tensor to Array
        return Array.from(output.data);
    },

    async generateOllamaEmbedding(text) {
        try {
            const response = await fetch('http://localhost:11434/api/embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'nomic-embed-text',
                    prompt: text
                })
            });

            if (!response.ok) throw new Error('Ollama API failed');
            const data = await response.json();
            return data.embedding;
        } catch (e) {
            console.warn("Ollama embedding failed, falling back to Transformers", e);
            return this.generateTransformerEmbedding(text);
        }
    },

    /**
     * Index a file content: Chunk it and store vectors
     */
    async indexFile(filePath, content) {
        // Simple chunking (500 chars roughly)
        // In prod, use standard text splitters (langchain-style)
        // Here we split by newlines and group

        if (!content) return;

        const chunks = this.chunkText(content, 500);
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        let count = 0;
        for (const chunk of chunks) {
            const embedding = await this.generateEmbedding(chunk);
            if (!embedding) continue;

            const record = {
                id: `${filePath}#chunk${count}`,
                filePath: filePath,
                content: chunk,
                embedding: embedding,
                timestamp: Date.now()
            };

            store.put(record);
            count++;
        }

        return count;
    },

    chunkText(text, maxLength) {
        const chunks = [];
        let currentChunk = "";

        const lines = text.split('\n');
        for (const line of lines) {
            if (currentChunk.length + line.length > maxLength) {
                chunks.push(currentChunk);
                currentChunk = line + "\n";
            } else {
                currentChunk += line + "\n";
            }
        }
        if (currentChunk.trim().length > 0) chunks.push(currentChunk);

        return chunks;
    },

    /**
     * Semantic Search
     */
    async search(query, topK = 5) {
        if (!this.db) await this.initDB();

        const queryEmbedding = await this.generateEmbedding(query);
        if (!queryEmbedding) return [];

        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll(); // Naive filter: Get all and sort (OK for <10k chunks)

            request.onsuccess = () => {
                const allRecords = request.result;

                // Calculate similarities
                const scored = allRecords.map(record => ({
                    ...record,
                    score: this.cosineSimilarity(queryEmbedding, record.embedding)
                }));

                // Sort descending
                scored.sort((a, b) => b.score - a.score);

                resolve(scored.slice(0, topK));
            };
        });
    },

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    },

    async clearIndex() {
        return new Promise((resolve) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.clear();
            resolve();
        });
    }
};

export default EmbeddingService;

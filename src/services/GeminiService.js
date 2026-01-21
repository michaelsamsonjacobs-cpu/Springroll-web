/**
 * AI Service - Unified AI Interface for Springroll
 * Supports LOCAL models (Ollama, LM Studio, WebGPU) first, with optional cloud fallback
 * Sovereignty-first: Local models are the default, cloud is opt-in
 */

import WebLLMService from './WebLLMService';
import EmbeddingService from './EmbeddingService';

const STORAGE_KEYS = {
    provider: 'springroll_ai_provider',
    localEndpoint: 'springroll_local_endpoint',
    localModel: 'springroll_local_model',
    geminiKey: 'springroll_gemini_key',
};

// Default local model configurations
const LOCAL_PROVIDERS = {
    webgpu: {
        name: 'Browser Native (WebGPU)',
        defaultEndpoint: 'Browser',
        defaultModel: 'Llama-3-8B-Instruct-q4f32_1',
        description: 'Zero-install local AI. Runs in your browser.',
        isBrowser: true
    },
    ollama: {
        name: 'Ollama',
        defaultEndpoint: 'http://localhost:11434',
        defaultModel: 'llama3.2',
        description: 'Run open-source models locally with Ollama'
    },
    lmstudio: {
        name: 'LM Studio',
        defaultEndpoint: 'http://localhost:1234',
        defaultModel: 'local-model',
        description: 'Use LM Studio for local inference'
    },
    llamacpp: {
        name: 'llama.cpp Server',
        defaultEndpoint: 'http://localhost:8080',
        defaultModel: 'default',
        description: 'Native llama.cpp HTTP server'
    }
};

export const AIService = {
    // Get current provider setting
    getProvider() {
        return localStorage.getItem(STORAGE_KEYS.provider) || 'ollama';
    },

    setProvider(provider) {
        localStorage.setItem(STORAGE_KEYS.provider, provider);
    },

    getLocalEndpoint() {
        const provider = this.getProvider();
        const saved = localStorage.getItem(STORAGE_KEYS.localEndpoint);
        if (saved) return saved;
        return LOCAL_PROVIDERS[provider]?.defaultEndpoint || 'http://localhost:11434';
    },

    setLocalEndpoint(endpoint) {
        localStorage.setItem(STORAGE_KEYS.localEndpoint, endpoint);
    },

    getLocalModel() {
        const provider = this.getProvider();
        const saved = localStorage.getItem(STORAGE_KEYS.localModel);
        if (saved) return saved;
        return LOCAL_PROVIDERS[provider]?.defaultModel || 'llama3.2';
    },

    setLocalModel(model) {
        localStorage.setItem(STORAGE_KEYS.localModel, model);
    },

    getGeminiKey() {
        return localStorage.getItem(STORAGE_KEYS.geminiKey);
    },

    setGeminiKey(key) {
        localStorage.setItem(STORAGE_KEYS.geminiKey, key);
    },

    // Check if local model is accessible
    async checkLocalConnection() {
        const provider = this.getProvider();

        if (provider === 'webgpu') {
            return await WebLLMService.isSupported();
        }

        const endpoint = this.getLocalEndpoint();
        try {
            const response = await fetch(`${endpoint}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        } catch (e) {
            console.log('Local model not available:', e.message);
            return false;
        }
    },

    // Get available local models (Ollama)
    async getAvailableModels() {
        const provider = this.getProvider();

        if (provider === 'webgpu') {
            return ['Llama-3-8B-Instruct-q4f32_1', 'Hermes-2-Pro-Llama-3-8B-q4f16_1'];
        }

        const endpoint = this.getLocalEndpoint();
        try {
            const response = await fetch(`${endpoint}/api/tags`);
            const data = await response.json();
            return data.models || [];
        } catch (e) {
            return [];
        }
    },

    // Main generation function - tries local first, falls back to cloud if configured
    async generate(prompt, systemInstruction = "", tools = []) {
        const provider = this.getProvider();

        // Handle Tools (e.g. read_files)
        let augmentedSystemInstruction = systemInstruction;

        // Legacy: Manual File Selection
        if (tools.includes('file_read')) {
            const indexedFiles = JSON.parse(localStorage.getItem('springroll_indexed_files') || '[]');
            if (indexedFiles.length > 0) {
                const fileContext = indexedFiles.map(f => `FILE: ${f.name}\nCONTENT: ${f.content || '(No content indexed yet)'}`).join('\n---\n');
                augmentedSystemInstruction += `\n\nCONTEXT FROM LOCAL FILES:\n${fileContext}\n\nUse this context to answer the user request.`;
            }
        }

        // Semantic Search (RAG)
        try {
            // 1. Priority: Golden Samples (User approved references)
            const goldenSamples = await EmbeddingService.search(prompt, 2);
            // Filter locally for golden_sample trait since search doesn't yet support filtering
            const prioritized = goldenSamples.filter(s => s.metadata?.kind === 'golden_sample' || s.kind === 'golden_sample');

            if (prioritized.length > 0) {
                const goldenContext = prioritized.map(c => `[USER APPROVED STYLE]:\n${c.content}`).join('\n---\n');
                augmentedSystemInstruction += `\n\nGOLDEN SAMPLES (YOUR APPROVED STYLE):\n${goldenContext}\n\nStrictly follow the style and tone of these examples.`;
                console.log(`[RAG] Injected ${prioritized.length} golden samples.`);
            }

            // 2. Base: Codebase/Vault context
            const chunks = await EmbeddingService.search(prompt, 3);
            const regularChunks = chunks.filter(s => s.metadata?.kind !== 'golden_sample' && s.kind !== 'golden_sample');

            if (regularChunks.length > 0) {
                const context = regularChunks.map(c => `File: ${c.filePath || 'Reference'}\n${c.content}`).join('\n---\n');
                augmentedSystemInstruction += `\n\nRELEVANT CODEBASE CONTEXT:\n${context}\n\nUse this context to answer the user request.`;
                console.log(`[RAG] Injected ${regularChunks.length} chunks of codebase context.`);
            }
        } catch (e) {
            // Ignore search errors (e.g. index empty)
        }

        // Handle WebGPU Generation
        if (provider === 'webgpu') {
            // Note: WebLLM supports streaming, but this wrapper is non-streaming for compatibility
            let fullText = "";
            try {
                await WebLLMService.initialize();

                await WebLLMService.generateStream(
                    [{ role: 'user', content: prompt }],
                    augmentedSystemInstruction,
                    (chunk) => { fullText += chunk; }
                );
                return fullText;
            } catch (e) {
                console.error("WebGPU Error:", e);
                throw new Error(`WebGPU Error: ${e.message}. Ensure your browser supports WebGPU.`);
            }
        }

        // Try local model first (Ollama / LM Studio / llama.cpp)
        if (provider !== 'gemini') {
            try {
                return await this.generateLocal(prompt, augmentedSystemInstruction);
            } catch (localError) {
                console.warn('Local model failed:', localError.message);

                // If Gemini key exists, offer to use it as fallback
                const geminiKey = this.getGeminiKey();
                if (geminiKey) {
                    console.log('Falling back to Gemini API...');
                    return await this.generateGemini(prompt, augmentedSystemInstruction);
                }

                throw new Error(`Local model unavailable. Make sure Ollama is running at ${this.getLocalEndpoint()}. To install: brew install ollama && ollama pull llama3.2`);
            }
        }

        // Use Gemini if explicitly selected
        return await this.generateGemini(prompt, augmentedSystemInstruction);
    },

    // Generate using local Ollama/LM Studio
    async generateLocal(prompt, systemInstruction = "") {
        const endpoint = this.getLocalEndpoint();
        const model = this.getLocalModel();

        const fullPrompt = systemInstruction
            ? `${systemInstruction}\n\n${prompt}`
            : prompt;

        // Ollama API format
        const response = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: fullPrompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Local model error: ${response.status}`);
        }

        const data = await response.json();
        return data.response || data.content || '';
    },

    // Generate using Gemini (opt-in cloud)
    async generateGemini(prompt, systemInstruction = "") {
        const key = this.getGeminiKey();
        if (!key) {
            throw new Error("No Gemini API Key configured. Go to Settings to add one, or use a local model.");
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "Failed to connect to Gemini");
        }

        return data.candidates[0].content.parts[0].text;
    },

    // Get provider info for UI
    getProviderInfo() {
        return LOCAL_PROVIDERS;
    },

    // Get status for UI display
    async getStatus() {
        const provider = this.getProvider();
        const isLocal = provider !== 'gemini';
        const isConnected = isLocal ? await this.checkLocalConnection() : !!this.getGeminiKey();

        return {
            provider: provider,
            isLocal: isLocal,
            isConnected: isConnected,
            endpoint: isLocal ? this.getLocalEndpoint() : 'Gemini API',
            model: isLocal ? this.getLocalModel() : 'gemini-1.5-flash',
            providerName: isLocal ? (LOCAL_PROVIDERS[provider]?.name || provider) : 'Google Gemini'
        };
    }
};

// Legacy support - GeminiService wrapper
export const GeminiService = {
    saveKey: (key) => AIService.setGeminiKey(key),
    getKey: () => AIService.getGeminiKey(),
    hasKey: () => !!AIService.getGeminiKey(),
    generate: (prompt, systemInstruction, tools) => AIService.generate(prompt, systemInstruction, tools)
};

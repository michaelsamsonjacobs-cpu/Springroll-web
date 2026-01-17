
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Default to a balanced 8B model that works well in browser
const DEFAULT_MODEL = "Llama-3-8B-Instruct-q4f32_1";

let engine = null;
let initProgressCallback = null;

export const WebLLMService = {
    /**
     * Initialize the WebLLM engine
     * @param {Function} onProgress - Callback for download progress (text) => void
     * @param {string} modelId - Model ID to load
     */
    async initialize(onProgress, modelId = DEFAULT_MODEL) {
        if (engine) return engine;

        initProgressCallback = onProgress;

        try {
            engine = await CreateMLCEngine(modelId, {
                initProgressCallback: (progress) => {
                    if (onProgress) {
                        onProgress(progress);
                    }
                    console.log('WebLLM Init:', progress.text);
                },
                logLevel: "INFO", // or "DEBUG"
            });
            return engine;
        } catch (error) {
            console.error("Failed to initialize WebLLM:", error);
            throw error;
        }
    },

    /**
     * Generate text streaming
     * @param {Array} messages - Chat history [{role: 'user', content: '...'}]
     * @param {string} systemPrompt - System instruction
     * @param {Function} onChunk - Callback for streamed chunks (text) => void
     */
    async generateStream(messages, systemPrompt, onChunk) {
        if (!engine) {
            throw new Error("Engine not initialized. Call initialize() first.");
        }

        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        try {
            const chunks = await engine.chat.completions.create({
                messages: fullMessages,
                stream: true,
            });

            let fullText = "";
            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                fullText += content;
                if (content) {
                    onChunk(content);
                }
            }
            return fullText;
        } catch (error) {
            console.error("WebLLM Generation Error:", error);
            throw error;
        }
    },

    /**
     * Check if WebGPU is supported in this browser
     */
    async isSupported() {
        if (!navigator.gpu) return false;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            return !!adapter;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get real GPU info from the browser
     */
    async getGPUInfo() {
        if (!navigator.gpu) return null;
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) return null;
            const info = await adapter.requestAdapterInfo();
            return {
                vendor: info.vendor,
                architecture: info.architecture,
                device: info.device,
                description: info.description
            };
        } catch (e) {
            console.error("Failed to get GPU info:", e);
            return null;
        }
    }
};

export default WebLLMService;

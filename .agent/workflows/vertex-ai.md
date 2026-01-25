---
description: Integrate Google's Gemini AI via Vertex AI for embeddings, chat, and multimodal processing
---

# Vertex AI / Gemini Integration Workflow

Use Google's Gemini models for text generation, embeddings, vision, and more.

## Prerequisites

1. Google Cloud project with billing enabled
2. Vertex AI API enabled
3. Service account with Vertex AI User role

---

## Option A: Google AI Studio (Simpler)

For quick prototyping without GCP setup:

### Step 1: Get API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Create key for your project

### Step 2: Install SDK

// turbo
```bash
npm install @google/generative-ai
```

### Step 3: Basic Usage

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Text generation
async function generateText(prompt) {
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Chat conversation
async function chat() {
    const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: 'Hello' }] },
            { role: 'model', parts: [{ text: 'Hi! How can I help?' }] }
        ]
    });
    
    const result = await chat.sendMessage('Tell me about Firebase');
    return result.response.text();
}

// Image analysis
async function analyzeImage(imageBase64) {
    const result = await model.generateContent([
        'Describe this image',
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
    ]);
    return result.response.text();
}
```

---

## Option B: Vertex AI (Production)

For enterprise use with GCP integration:

### Step 1: Enable API

```bash
gcloud services enable aiplatform.googleapis.com
```

### Step 2: Install SDK

// turbo
```bash
npm install @google-cloud/vertexai
```

### Step 3: Authenticate

```bash
gcloud auth application-default login
```

Or use service account:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

### Step 4: Usage

```javascript
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
    project: 'YOUR_PROJECT_ID',
    location: 'us-central1'
});

const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-pro'
});

async function generate(prompt) {
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return result.response.candidates[0].content.parts[0].text;
}
```

---

## Available Models

| Model | Best For | Context Window |
|-------|----------|----------------|
| `gemini-1.5-flash` | Fast, cheap, general use | 1M tokens |
| `gemini-1.5-pro` | Complex reasoning, long context | 2M tokens |
| `gemini-1.0-pro` | Legacy, stable | 32K tokens |
| `text-embedding-004` | Embeddings for search/RAG | N/A |

---

## Embeddings for RAG

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_API_KEY');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

async function getEmbedding(text) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values; // Float array
}

// Store in vector DB (Pinecone, Qdrant, etc.)
async function indexDocuments(documents) {
    for (const doc of documents) {
        const embedding = await getEmbedding(doc.content);
        await vectorDB.upsert({
            id: doc.id,
            values: embedding,
            metadata: { title: doc.title }
        });
    }
}

// Semantic search
async function search(query) {
    const queryEmbedding = await getEmbedding(query);
    const results = await vectorDB.query({
        vector: queryEmbedding,
        topK: 5
    });
    return results;
}
```

---

## Streaming Responses

```javascript
async function streamResponse(prompt) {
    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
        const text = chunk.text();
        process.stdout.write(text); // Or update UI
    }
}
```

---

## Function Calling

```javascript
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: [{
        functionDeclarations: [{
            name: 'getWeather',
            description: 'Get weather for a location',
            parameters: {
                type: 'object',
                properties: {
                    location: { type: 'string', description: 'City name' }
                },
                required: ['location']
            }
        }]
    }]
});

async function chatWithTools(message) {
    const result = await model.generateContent(message);
    const call = result.response.functionCalls()?.[0];
    
    if (call?.name === 'getWeather') {
        const weather = await fetchWeather(call.args.location);
        // Send function result back to model
        return model.generateContent([
            { functionResponse: { name: 'getWeather', response: weather } }
        ]);
    }
    
    return result.response.text();
}
```

---

## React Integration

```jsx
import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function ChatComponent() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setLoading(true);
        
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(input);
            const response = result.response.text();
            
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    return (
        <div>
            {messages.map((m, i) => (
                <div key={i} className={m.role}>{m.text}</div>
            ))}
            <input value={input} onChange={e => setInput(e.target.value)} />
            <button onClick={sendMessage} disabled={loading}>
                {loading ? 'Thinking...' : 'Send'}
            </button>
        </div>
    );
}
```

---

## Environment Variables

```env
# .env
VITE_GEMINI_API_KEY=your_api_key_here

# For Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

> [!CAUTION]
> Never commit API keys to git. Use environment variables and add `.env` to `.gitignore`.

---

## Pricing (as of 2024)

| Model | Input | Output |
|-------|-------|--------|
| Gemini 1.5 Flash | $0.075/1M tokens | $0.30/1M tokens |
| Gemini 1.5 Pro | $1.25/1M tokens | $5.00/1M tokens |
| Embeddings | $0.00001/1K chars | N/A |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Rate limited | Implement exponential backoff |
| CORS errors | Call from backend/Firebase Functions, not browser |
| Large context fails | Use Gemini 1.5 models with 1M+ context |
| Slow responses | Use `gemini-1.5-flash` or enable streaming |

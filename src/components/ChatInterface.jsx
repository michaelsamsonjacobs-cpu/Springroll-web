import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/GeminiService.js';
import { SearchService } from '../services/SearchService.js';
import { Send, Bot, User, Loader2, Paperclip, Sparkles, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatInterface = ({ onVisualUpdate }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Welcome to Springroll. I have access to your local workspace. How can I assist you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const localContext = await SearchService.getLocalContext(input);

            const systemPrompt = `You are Springroll Team Agent, a sovereign AI assistant running on the user's local machine.
            You have deep access to their local filesystem and context.
            
            LOCAL FILES CONTEXT:
            ${localContext}
            
            INSTRUCTIONS:
            - Prioritize information from the local files.
            - If the user asks for a visual (like an SVG or UI mock), wrap the code in <visual> tags.
            - If you are analyzing code, be precise.
            - Maintain a professional, agentic tone.`;

            const aiResponse = await GeminiService.generate(input, systemPrompt);

            const visualMatch = aiResponse.match(/<visual>([\s\S]*?)<\/visual>/);
            if (visualMatch && visualMatch[1]) {
                onVisualUpdate(visualMatch[1].trim());
            }

            setMessages(prev => [...prev, { role: 'assistant', text: aiResponse.replace(/<visual>[\s\S]*?<\/visual>/g, '[Visual Output Generated]') }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-5 bg-[var(--bg-surface)]/30 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">Springroll Agent</span>
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] bg-[var(--accent-green)]/10 text-[var(--accent-green)] font-medium">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
                <AnimatePresence>
                    {messages.map((m, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            key={i}
                            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {m.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                                    <Bot size={16} className="text-white" />
                                </div>
                            )}

                            <div className={m.role === 'user' ? 'message-user' : 'message-agent'}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
                            </div>

                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                                    <User size={16} className="text-[var(--text-secondary)]" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div className="glass-card px-4 py-3 flex items-center gap-3">
                                <Loader2 size={16} className="animate-spin text-[var(--accent-blue)]" />
                                <span className="text-sm text-[var(--text-secondary)]">Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(30,41,59,0.3)' }}>
                <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '16px',
                }}>
                    <textarea
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            background: 'transparent',
                            border: 'none',
                            resize: 'none',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#f8fafc',
                            outline: 'none',
                            fontFamily: 'inherit',
                        }}
                        placeholder="Ask Springroll anything about your workspace..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <Paperclip size={16} />
                            </button>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Attach files for context</span>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                background: input.trim() ? 'linear-gradient(135deg, #3b82f6, #a855f7)' : 'rgba(255,255,255,0.05)',
                                color: input.trim() ? 'white' : '#64748b',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: input.trim() ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <Send size={14} />
                            Send Message
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '10px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                        Sovereign Mode
                    </span>
                    <span>•</span>
                    <span>Local Context Active</span>
                </div>
            </div>
        </div>
    );
};

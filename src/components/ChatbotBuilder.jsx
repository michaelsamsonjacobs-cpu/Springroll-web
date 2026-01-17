import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Plus, Save, Trash2, Zap, Settings, Wrench, Globe, FileText, Terminal, Check } from 'lucide-react';
import { AIService } from '../services/GeminiService';

export const ChatbotBuilder = () => {
    // Load bots from local storage or default
    const [bots, setBots] = useState(() => {
        const saved = localStorage.getItem('springroll_bots');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Support Agent', role: 'You are a helpful support agent for Springroll.', temp: 0.7, tools: [] },
            {
                id: 'patent_pro',
                name: 'Patent Attorney',
                role: 'You are an expert Patent Attorney. Your goal is to help the user draft high-quality utility patent applications. You are thorough, precise, and sovereign. Use the local file context to understand the invention disclosure.',
                temp: 0.2,
                tools: ['file_read']
            }
        ];
    });
    const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id || null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    // Persist bots when they change
    const updateBots = (newBots) => {
        setBots(newBots);
        localStorage.setItem('springroll_bots', JSON.stringify(newBots));
    };

    const selectedBot = bots.find(b => b.id === selectedBotId);

    const addBot = () => {
        const newBot = { id: crypto.randomUUID(), name: 'New Agent', role: 'You are a helpful AI assistant.', temp: 0.7 };
        const newBots = [...bots, newBot];
        updateBots(newBots);
        setSelectedBotId(newBot.id);
    };

    const updateBot = (field, value) => {
        const newBots = bots.map(b => b.id === selectedBotId ? { ...b, [field]: value } : b);
        updateBots(newBots);
    };

    const deleteBot = (id) => {
        const newBots = bots.filter(b => b.id !== id);
        updateBots(newBots);
        if (selectedBotId === id && newBots.length > 0) setSelectedBotId(newBots[0].id);
    };

    const handleSend = async () => {
        if (!input.trim() || isTesting) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTesting(true);

        try {
            const history = messages.map(m => `${m.role}: ${m.content}`).join('\n');
            const prompt = `${history}\nuser: ${userMsg.content}\nassistant:`;

            // Use real AI service
            const response = await AIService.generate(prompt, selectedBot?.role || "", selectedBot?.tools || []);

            const aiMsg = { role: 'assistant', content: response };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', color: 'white' }}>
            {/* Sidebar List */}
            <div style={{ width: '240px', background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#94a3b8' }}>MY AGENTS</h3>
                    <button onClick={addBot} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer' }}><Plus size={18} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {bots.map(bot => (
                        <div
                            key={bot.id}
                            onClick={() => setSelectedBotId(bot.id)}
                            style={{
                                padding: '12px 16px', cursor: 'pointer',
                                background: selectedBotId === bot.id ? 'rgba(168,85,247,0.1)' : 'transparent',
                                borderLeft: selectedBotId === bot.id ? '3px solid #a855f7' : '3px solid transparent',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                        >
                            <Bot size={16} color={selectedBotId === bot.id ? '#a855f7' : '#64748b'} />
                            <span style={{ fontSize: '14px', color: selectedBotId === bot.id ? 'white' : '#94a3b8' }}>{bot.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Config Area */}
            {selectedBot && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={20} color="white" />
                            </div>
                            <input
                                value={selectedBot.name}
                                onChange={e => updateBot('name', e.target.value)}
                                style={{ background: 'transparent', border: 'none', fontSize: '18px', fontWeight: 'bold', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <button onClick={() => deleteBot(selectedBot.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        {/* Settings Column */}
                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>System Prompt / Role</label>
                                <textarea
                                    value={selectedBot.role}
                                    onChange={e => updateBot('role', e.target.value)}
                                    style={{ ...inputStyle, height: '200px', resize: 'none' }}
                                    placeholder="You are a helpful assistant..."
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Temperature (Creativity): {selectedBot.temp}</label>
                                <input
                                    type="range" min="0" max="1" step="0.1"
                                    value={selectedBot.temp}
                                    onChange={e => updateBot('temp', parseFloat(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'white', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Wrench size={14} style={{ color: '#a855f7' }} /> Agent Capabilities
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { id: 'web_search', label: 'Web Search', icon: Globe, desc: 'Allow bot to search the internet' },
                                        { id: 'file_read', label: 'Read Files', icon: FileText, desc: 'Access indexed documents' },
                                        { id: 'terminal', label: 'Run Commands', icon: Terminal, desc: 'Execute system commands (Risky)', danger: true }
                                    ].map(tool => (
                                        <div key={tool.id} onClick={() => {
                                            const current = selectedBot.tools || [];
                                            const newTools = current.includes(tool.id)
                                                ? current.filter(t => t !== tool.id)
                                                : [...current, tool.id];
                                            updateBot('tools', newTools);
                                        }} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                            background: (selectedBot.tools || []).includes(tool.id) ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                                            border: (selectedBot.tools || []).includes(tool.id) ? '1px solid #a855f7' : '1px solid transparent',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <tool.icon size={16} color={tool.danger ? '#ef4444' : '#cbd5e1'} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{tool.label}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{tool.desc}</div>
                                            </div>
                                            <div style={{
                                                width: '16px', height: '16px', borderRadius: '4px',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                background: (selectedBot.tools || []).includes(tool.id) ? '#a855f7' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {(selectedBot.tools || []).includes(tool.id) && <Check size={10} color="white" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Test Chat Column */}
                        <div style={{ width: '350px', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MessageSquare size={14} /> PREVIEW
                            </div>
                            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {messages.map((m, i) => (
                                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                        <div style={{
                                            padding: '8px 12px', borderRadius: '12px',
                                            background: m.role === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                            color: 'white', fontSize: '13px', lineHeight: 1.5
                                        }}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Test your agent..."
                                    style={{ ...inputStyle, borderRadius: '20px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' };
const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box'
};

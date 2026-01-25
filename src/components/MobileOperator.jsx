import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Calendar, Mail, Zap, Send, Mic,
    CheckCircle, Clock, AlertTriangle, Menu, X, Battery, Wifi
} from 'lucide-react';

// Mock Data for "Unified Feed"
const MOCK_FEED_ITEMS = [
    { id: 1, type: 'email', title: 'Investor Update Q1', time: '10:00 AM', status: 'priority', from: 'Sarah VC' },
    { id: 2, type: 'sms', title: 'Meeting pushed to 2pm', time: '10:05 AM', status: 'info', from: 'Mike' },
    { id: 3, type: 'calendar', title: 'Deep Work Block', time: '11:00 AM - 1:00 PM', status: 'locked' },
    { id: 4, type: 'agent', title: 'Ralph finished report', time: '10:15 AM', status: 'success' },
];

export const MobileOperator = ({ onNavigate }) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', text: "Systems online. 4 items in triage. Awaiting command." }
    ]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'chat'

    const handleSend = () => {
        if (!inputText.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: inputText }]);
        setInputText('');
        // Mock Auto-Reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: "Acknowledged. Deploying GrantAgent to investigate."
            }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-inter">
            {/* Mobile Header / Status HUD */}
            <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-xs font-bold font-sora tracking-wide">CLAWD.BOT</div>
                        <div className="text-[10px] text-green-400 font-mono">ONLINE • 98%</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    <Wifi size={14} />
                    <Battery size={14} />
                    <button onClick={() => onNavigate('home')} className="p-1 hover:bg-white/10 rounded">
                        <X size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto no-scrollbar relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'feed' ? (
                        <motion.div
                            key="feed"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-4 space-y-4"
                        >
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unified Intelligence Feed</h2>
                            {MOCK_FEED_ITEMS.map((item) => (
                                <div key={item.id} className="p-3 bg-slate-900/50 border border-white/5 rounded-xl flex items-center gap-3 active:scale-95 transition-transform">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                        ${item.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
                                            item.type === 'sms' ? 'bg-green-500/20 text-green-400' :
                                                item.type === 'agent' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {item.type === 'email' && <Mail size={18} />}
                                        {item.type === 'sms' && <MessageSquare size={18} />}
                                        {item.type === 'calendar' && <Calendar size={18} />}
                                        {item.type === 'agent' && <CheckCircle size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-sm font-semibold truncate text-slate-200">{item.title}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 truncate">
                                            {item.from ? `From: ${item.from}` : item.status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-6 p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/10">
                                <h3 className="text-sm font-bold text-blue-400 mb-2">Deep Work Protocol</h3>
                                <p className="text-xs text-slate-400 mb-3">Next block starts in 45m. Auto-declining meetings.</p>
                                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold tracking-wide transition-colors">
                                    ACTIVATE NOW
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4 flex flex-col justify-end min-h-full pb-20"
                        >
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                                            ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Floating Quick Actions (visible on Feed) */}
            {activeTab === 'feed' && (
                <div className="absolute bottom-24 right-4 flex flex-col gap-3">
                    <button className="w-12 h-12 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform text-red-400">
                        <AlertTriangle size={20} />
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-transform text-white"
                    >
                        <Mic size={24} />
                    </button>
                </div>
            )}

            {/* Bottom Nav / Input Area */}
            <div className="bg-slate-900 border-t border-white/5 p-4 z-10 w-full mb-0">
                {activeTab === 'chat' ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex-1 bg-slate-800 text-slate-200 rounded-full px-4 py-2 border border-white/5 flex items-center">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                type="text"
                                placeholder="Command Ralph..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-500"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            className={`p-2 rounded-full ${inputText.trim() ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                ) : (
                    <nav className="flex items-center justify-around text-slate-500">
                        <button onClick={() => setActiveTab('feed')} className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-blue-400' : ''}`}>
                            <Zap size={20} />
                            <span className="text-[10px] font-bold">FEED</span>
                        </button>
                        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-blue-400' : ''}`}>
                            <MessageSquare size={20} />
                            <span className="text-[10px] font-bold">COMMS</span>
                        </button>
                        <button className="flex flex-col items-center gap-1">
                            <Calendar size={20} />
                            <span className="text-[10px] font-bold">PLAN</span>
                        </button>
                    </nav>
                )}
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import {
    Search, Home, MessageSquare, FileText, Target,
    Settings, LogOut, Sun, Moon, Plus, HelpCircle,
    Command, Zap, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette = ({ isOpen, onClose, onNavigate, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Global shortcut listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else onAction('openPalette');
            }

            if (isOpen) {
                if (e.key === 'Escape') onClose();
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const cmd = filteredCommands[selectedIndex];
                    if (cmd) executeCommand(cmd);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, searchTerm]); // Add dependencies

    // COMMANDS LIST
    const COMMANDS = [
        { id: 'nav-home', label: 'Go to Dashboard', icon: Home, category: 'Navigation', action: () => onNavigate('home') },
        { id: 'nav-agent', label: 'Go to AI Agent', icon: MessageSquare, category: 'Navigation', shortcut: 'G A', action: () => onNavigate('agent') },
        { id: 'nav-docs', label: 'Go to Doc Builder', icon: FileText, category: 'Navigation', shortcut: 'G D', action: () => onNavigate('docs') },
        { id: 'nav-gtm', label: 'Go to GTM Pipeline', icon: Target, category: 'Navigation', shortcut: 'G T', action: () => onNavigate('gtm') },
        { id: 'nav-help', label: 'Open Help Center', icon: HelpCircle, category: 'Navigation', action: () => onNavigate('help') },

        { id: 'tool-new', label: 'Create New Document', icon: Plus, category: 'Tools', action: () => onNavigate('docs') },
        { id: 'tool-rec', label: 'Record New Workflow', icon: Zap, category: 'Tools', action: () => onNavigate('agent') },

        { id: 'sys-settings', label: 'Settings', icon: Settings, category: 'System', action: () => onAction('openSettings') },
        { id: 'sys-logout', label: 'Log Out', icon: LogOut, category: 'System', action: () => onAction('logout') },
    ];

    const filteredCommands = COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const executeCommand = (cmd) => {
        cmd.action();
        onClose();
        setSearchTerm('');
        setSelectedIndex(0);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(5, 8, 22, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '15vh'
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.1 }}
                style={{
                    width: '600px', maxWidth: '90%',
                    background: '#0f172a',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Search Header */}
                <div style={{
                    padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <Search color="#94a3b8" size={20} />
                    <input
                        autoFocus
                        placeholder="Type a command or search..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setSelectedIndex(0); }}
                        style={{
                            flex: 1, background: 'transparent', border: 'none',
                            color: 'white', fontSize: '16px', outline: 'none'
                        }}
                    />
                    <div style={{
                        padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)',
                        color: '#94a3b8', fontSize: '12px', fontWeight: 'bold'
                    }}>ESC</div>
                </div>

                {/* Results List */}
                <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
                    {filteredCommands.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                            No commands found.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {filteredCommands.map((cmd, index) => {
                                const Icon = cmd.icon;
                                const isSelected = index === selectedIndex;
                                return (
                                    <button
                                        key={cmd.id}
                                        onClick={() => executeCommand(cmd)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px 16px', borderRadius: '8px',
                                            background: isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                                            border: 'none', width: '100%', textAlign: 'left',
                                            cursor: 'pointer', color: isSelected ? 'white' : '#cbd5e1',
                                            borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent'
                                        }}
                                    >
                                        <Icon size={18} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                                        <span style={{ fontSize: '14px', flex: 1 }}>{cmd.label}</span>
                                        {cmd.shortcut && (
                                            <span style={{
                                                fontSize: '11px', color: '#64748b',
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '2px 6px', borderRadius: '4px'
                                            }}>
                                                {cmd.shortcut}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '11px', color: '#475569', marginLeft: '12px' }}>
                                            {cmd.category}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

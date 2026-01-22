import React, { useState, useEffect, useRef } from 'react';
import {
    Bot, Play, Square, Terminal, History, Brain, Sparkles,
    Plus, Clock, CheckCircle2, AlertCircle, Loader2,
    ChevronRight, Save, Trash2, Cpu, Globe
} from 'lucide-react';
import { RalphAgentService, RALPH_STATUS, RALPH_TASK_TYPES } from '../services/RalphAgentService';
import GlobalBrainService from '../services/GlobalBrainService';
import { AutomationService } from '../services/AutomationService';
import { motion, AnimatePresence } from 'framer-motion';
import CommandCenterCanvas from './CommandCenterCanvas';

export const RalphAgentDashboard = () => {
    // --- State ---
    const [status, setStatus] = useState(RALPH_STATUS.IDLE);
    const [activeTask, setActiveTask] = useState(null); // { id, description, type, ... }
    const [taskQueue, setTaskQueue] = useState([]);

    // UI Refresh Force
    const [logs, setLogs] = useState([]);
    const [steps, setSteps] = useState([]);
    const [iteration, setIteration] = useState(0);
    const [newTaskInput, setNewTaskInput] = useState('');
    const [newTaskType, setNewTaskType] = useState(RALPH_TASK_TYPES.DOCUMENT);
    const [showBrainSave, setShowBrainSave] = useState(false);
    const [showAutomationList, setShowAutomationList] = useState(false);
    const [automations, setAutomations] = useState([]);

    const logsEndRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        setAutomations(AutomationService.getAll());
    }, [showAutomationList]);

    useEffect(() => {
        const unsubscribe = RalphAgentService.subscribe((event, data) => {
            switch (event) {
                case 'start':
                    setStatus(RALPH_STATUS.RUNNING);
                    setIteration(0);
                    setLogs([]);
                    setSteps([]);
                    break;
                case 'breakdown':
                    setSteps(data.steps);
                    break;
                case 'iteration':
                    setIteration(data.iteration);
                    break;
                case 'step_complete':
                    setSteps(prev => prev.map(s => s.id === data.step.id ? { ...s, status: 'complete' } : s));
                    break;
                case 'step_failed':
                    setSteps(prev => prev.map(s => s.id === data.step.id ? { ...s, status: 'failed', feedback: data.feedback } : s));
                    break;
                case 'complete':
                    setStatus(RALPH_STATUS.COMPLETE);
                    setShowBrainSave(true);
                    break;
                case 'failed':
                case 'error':
                    setStatus(RALPH_STATUS.FAILED);
                    break;
                case 'log':
                    setLogs(prev => [...prev.slice(-199), data]); // Keep more logs in dashboard
                    break;
                default: break;
            }
        });

        const current = RalphAgentService.getStatus();
        setStatus(current.status);
        if (current.status !== RALPH_STATUS.IDLE) {
            // Restore active state if jumping back in
            setLogs(current.logs);
            setIteration(current.iteration);
        }

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // --- Actions ---
    const handleStartTask = async () => {
        if (!newTaskInput.trim()) return;

        const task = {
            id: Date.now(),
            description: newTaskInput,
            type: newTaskType,
            status: 'pending',
            timestamp: Date.now()
        };

        setTaskQueue(prev => [...prev, task]);
        setNewTaskInput('');

        // If idle, start immediately
        if (status === RALPH_STATUS.IDLE) {
            runTask(task);
        }
    };

    const runTask = async (task) => {
        setActiveTask(task);
        setShowBrainSave(false);
        try {
            await RalphAgentService.startLoop({
                description: task.description,
                type: task.type,
                maxIterations: 20,
                automationSteps: task.automationSteps || null // Pass pre-defined steps if any
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleRunAutomation = (automation) => {
        const task = {
            id: Date.now(),
            description: `Run Automation: ${automation.name}`,
            type: RALPH_TASK_TYPES.AUTOMATION,
            status: 'pending',
            timestamp: Date.now(),
            automationSteps: automation.steps
        };
        setTaskQueue(prev => [...prev, task]);
        setShowAutomationList(false);
        if (status === RALPH_STATUS.IDLE) {
            runTask(task);
        }
    };

    const handleAbort = () => {
        RalphAgentService.abort();
    };

    const handleSaveToBrain = async () => {
        if (!activeTask) return;
        try {
            const finalContent = logs.filter(l => l.type === 'info').map(l => l.message).join('\n');
            await GlobalBrainService.learnFromOutput(finalContent, 'ralph_dashboard', {
                task: activeTask.description,
                type: activeTask.type
            });
            setShowBrainSave(false);
            // Maybe show a toast here?
        } catch (e) {
            console.error(e);
        }
    };

    // --- Styles from DocBuilderDashboard ---
    const styles = {
        container: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#0f172a' },
        header: {
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(30,41,59,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
        },
        content: { flex: 1, overflow: 'auto', padding: '24px', display: 'flex', gap: '24px' },
        mainColumn: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
        sideColumn: { width: '360px', display: 'flex', flexDirection: 'column', gap: '16px' },
        card: {
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '16px',
            position: 'relative',
        },
        inputCard: {
            display: 'flex',
            alignItems: 'start',
            gap: '16px',
            padding: '24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(30,41,59,0.4), rgba(15,23,42,0.4))',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '32px',
        },
        input: {
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '15px',
            minHeight: '60px',
            resize: 'none',
            '::placeholder': { color: '#64748b' }
        },
        sectionTitle: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px'
        },
        buttonPrimary: {
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
        }
    };

    // --- Render ---
    return (
        <div style={styles.container}>
            {/* Background Gradients */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '300px', background: 'linear-gradient(to bottom, rgba(88,28,135,0.1), transparent)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Bot size={20} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'white' }}>
                            Ralph Agent
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status === RALPH_STATUS.RUNNING ? '#22c55e' : '#64748b' }} />
                            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                                {RALPH_STATUS[status] || status}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleAbort}
                        disabled={status !== RALPH_STATUS.RUNNING}
                        style={{
                            padding: '8px 16px', borderRadius: '10px',
                            border: '1px solid rgba(239,68,68,0.2)',
                            background: status === RALPH_STATUS.RUNNING ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                            color: status === RALPH_STATUS.RUNNING ? '#f87171' : '#64748b',
                            fontSize: '12px', fontWeight: 600,
                            cursor: status === RALPH_STATUS.RUNNING ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                        <Square size={12} fill="currentColor" /> Stop Mission
                    </button>
                    <button onClick={() => setShowAutomationList(!showAutomationList)} style={{
                        padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8',
                        fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <Globe size={14} /> Automations
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div style={styles.content}>

                {/* Left Column: Mission Input & Queue */}
                <div style={styles.mainColumn}>

                    {/* Mission Input */}
                    <div style={styles.inputCard}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'rgba(168,85,247,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Sparkles size={20} color="#a855f7" />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <textarea
                                value={newTaskInput}
                                onChange={e => setNewTaskInput(e.target.value)}
                                placeholder="Describe a new mission for Ralph..."
                                style={styles.input}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleStartTask();
                                    }
                                }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <select
                                        value={newTaskType}
                                        onChange={e => setNewTaskType(e.target.value)}
                                        style={{
                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#cbd5e1', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', outline: 'none'
                                        }}
                                    >
                                        {Object.entries(RALPH_TASK_TYPES).map(([k, v]) => (
                                            <option key={v} value={v}>{k}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleStartTask}
                                    style={{
                                        ...styles.buttonPrimary,
                                        opacity: newTaskInput.trim() ? 1 : 0.5,
                                        cursor: newTaskInput.trim() ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Start Mission <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Command Center Canvas (Visual Orchestration) */}
                    <div style={{ flex: 1, minHeight: '500px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        <CommandCenterCanvas />
                    </div>
                </div>

                {/* Right Column: Console & Strategy (Canvas style) */}
                <div style={styles.sideColumn}>

                    {/* Console / Terminal */}
                    <div style={{ ...styles.card, flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '12px 16px', background: 'rgba(30,41,59,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                            <Terminal size={14} color="#a855f7" /> Interface Canvas
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', fontFamily: 'monospace', fontSize: '11px', color: '#cbd5e1' }}>
                            {logs.length === 0 && (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, gap: '8px' }}>
                                    <Terminal size={32} />
                                    <span>System Ready</span>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '6px', display: 'flex', gap: '8px', lineHeight: 1.5 }}>
                                    <span style={{ color: '#64748b', userSelect: 'none' }}>›</span>
                                    <span style={{ color: log.type === 'error' ? '#f87171' : log.type === 'warn' ? '#fbbf24' : log.type === 'success' ? '#4ade80' : '#e2e8f0' }}>
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>

                    {/* Strategy / Steps */}
                    <div style={{ ...styles.card, height: '40%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '12px 16px', background: 'rgba(30,41,59,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Brain size={14} color="#ec4899" /> Strategy
                            </div>
                            <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>
                                {steps.length} steps
                            </span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {steps.map((step, idx) => (
                                <div key={idx} style={{
                                    padding: '10px', borderRadius: '8px', border: '1px solid',
                                    borderColor: step.status === 'complete' ? 'rgba(34,197,94,0.1)' : step.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                    background: step.status === 'complete' ? 'rgba(34,197,94,0.05)' : step.status === 'failed' ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                                    display: 'flex', gap: '10px'
                                }}>
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '4px',
                                        background: step.status === 'complete' ? 'rgba(34,197,94,0.2)' : step.status === 'failed' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        {step.status === 'complete' ? <CheckCircle2 size={10} color="#22c55e" /> :
                                            step.status === 'failed' ? <AlertCircle size={10} color="#f87171" /> :
                                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#94a3b8' }} />}
                                    </div>
                                    <span style={{ fontSize: '12px', color: step.status === 'complete' ? '#86efac' : '#cbd5e1', lineHeight: 1.4 }}>
                                        {step.description}
                                    </span>
                                </div>
                            ))}
                            {steps.length === 0 && <div style={{ textAlign: 'center', padding: '20px', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No steps generated yet</div>}
                        </div>

                        {/* Save Brain Button */}
                        <AnimatePresence>
                            {showBrainSave && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(168,85,247,0.05)' }}
                                >
                                    <button
                                        onClick={handleSaveToBrain}
                                        style={{ ...styles.buttonPrimary, width: '100%', justifyContent: 'center' }}
                                    >
                                        <Save size={14} /> Save to Global Brain
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Automation List Popover */}
                <AnimatePresence>
                    {showAutomationList && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            style={{
                                position: 'absolute', top: '70px', right: '24px', width: '300px',
                                background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 100, overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(30,41,59,0.5)' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Automations</span>
                                <button onClick={() => setShowAutomationList(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                                {automations.map(a => (
                                    <div
                                        key={a.id}
                                        onClick={() => handleRunAutomation(a)}
                                        style={{
                                            padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                            transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '12px'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                                            <Globe size={14} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{a.name}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.description || 'No description'}</div>
                                        </div>
                                    </div>
                                ))}
                                {automations.length === 0 && <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>No automations found.</div>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

};

const SectionHeader = ({ title, count }) => (
    <div className="flex items-center justify-between mb-4 mt-8">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
        {count > 0 && <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-slate-400">{count}</span>}
    </div>
);


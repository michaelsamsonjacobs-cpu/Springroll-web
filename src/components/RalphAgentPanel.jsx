import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, X, Play, Square, ChevronRight, ChevronDown,
    Loader2, AlertCircle, CheckCircle2, Terminal,
    History, Settings as SettingsIcon, Brain, Sparkles,
    Trash2, RefreshCw
} from 'lucide-react';
import { RalphAgentService, RALPH_STATUS, RALPH_TASK_TYPES } from '../services/RalphAgentService';
import GlobalBrainService from '../services/GlobalBrainService';

export const RalphAgentPanel = ({ onClose }) => {
    const [status, setStatus] = useState(RALPH_STATUS.IDLE);
    const [taskDescription, setTaskDescription] = useState('');
    const [taskType, setTaskType] = useState(RALPH_TASK_TYPES.DOCUMENT);
    const [iteration, setIteration] = useState(0);
    const [maxIterations, setMaxIterations] = useState(20);
    const [logs, setLogs] = useState([]);
    const [steps, setSteps] = useState([]);
    const [activeStepId, setActiveStepId] = useState(null);
    const [showLogs, setShowLogs] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [hasLearned, setHasLearned] = useState(false);

    const logsEndRef = useRef(null);

    useEffect(() => {
        // Subscribe to service updates
        const unsubscribe = RalphAgentService.subscribe((event, data) => {
            switch (event) {
                case 'start':
                    setStatus(RALPH_STATUS.RUNNING);
                    setIteration(0);
                    setLogs([]);
                    setSteps([]);
                    setHasLearned(false);
                    break;
                case 'breakdown':
                    setSteps(data.steps);
                    break;
                case 'iteration':
                    setIteration(data.iteration);
                    break;
                case 'step_start':
                    setActiveStepId(data.step.id);
                    break;
                case 'step_complete':
                    setSteps(prev => prev.map(s => s.id === data.step.id ? { ...s, status: 'complete' } : s));
                    setActiveStepId(null);
                    break;
                case 'step_failed':
                    setSteps(prev => prev.map(s => s.id === data.step.id ? { ...s, status: 'failed', feedback: data.feedback } : s));
                    break;
                case 'complete':
                    setStatus(RALPH_STATUS.COMPLETE);
                    break;
                case 'failed':
                    setStatus(RALPH_STATUS.FAILED);
                    break;
                case 'error':
                    setStatus(RALPH_STATUS.FAILED);
                    break;
                case 'log':
                    setLogs(prev => [...prev.slice(-99), data]);
                    break;
                default:
                    break;
            }
        });

        // Sync initial state
        const current = RalphAgentService.getStatus();
        setStatus(current.status);
        setIteration(current.iteration);
        setLogs(current.logs);

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (showLogs && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, showLogs]);

    const handleStart = async () => {
        if (!taskDescription.trim()) return;
        try {
            await RalphAgentService.startLoop({
                description: taskDescription,
                type: taskType,
                maxIterations
            });
        } catch (e) {
            console.error('Failed to start Ralph:', e);
        }
    };

    const handleAbort = () => {
        RalphAgentService.abort();
        setStatus(RALPH_STATUS.ABORTED);
    };

    const resetRalph = () => {
        setTaskDescription('');
        setSteps([]);
        setLogs([]);
        setIteration(0);
        setStatus(RALPH_STATUS.IDLE);
        setHasLearned(false);
    };

    const handleSaveToBrain = async () => {
        try {
            // Get the final output from logs or service
            // For now, we'll use the task description and summary of logs
            const status_info = RalphAgentService.getStatus();
            const finalContent = status_info.logs
                .filter(l => l.type === 'info')
                .map(l => l.message)
                .join('\n');

            await GlobalBrainService.learnFromOutput(finalContent, 'ralph', {
                taskDescription,
                taskType,
                iterations: iteration
            });

            setHasLearned(true);
        } catch (e) {
            console.error('Failed to save to brain:', e);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 w-96 glass-card rounded-2xl shadow-2xl z-[100] border border-white/10 overflow-hidden flex flex-col max-h-[600px]"
        >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status === RALPH_STATUS.RUNNING ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'} text-white`}>
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            Ralph Agent
                            {status === RALPH_STATUS.RUNNING && (
                                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                            )}
                        </h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                            Autonomous Loop • {RALPH_STATUS[status] || status}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {status === RALPH_STATUS.IDLE ? (
                        <div className="p-5 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Primary Objective
                                </label>
                                <textarea
                                    value={taskDescription}
                                    onChange={e => setTaskDescription(e.target.value)}
                                    placeholder="Describe a complex task for Ralph... (e.g., 'Draft a full grant proposal for a sustainable energy AI system')"
                                    className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Task Type
                                    </label>
                                    <select
                                        value={taskType}
                                        onChange={e => setTaskType(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                                    >
                                        {Object.entries(RALPH_TASK_TYPES).map(([k, v]) => (
                                            <option key={v} value={v}>{k}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Max Loops
                                    </label>
                                    <input
                                        type="number"
                                        value={maxIterations}
                                        onChange={e => setMaxIterations(parseInt(e.target.value))}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleStart}
                                disabled={!taskDescription.trim()}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                <Play size={16} fill="currentColor" />
                                Start Autonomous Loop
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Running Info */}
                            <div className="p-4 bg-slate-900/30 border-b border-white/5">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Iteration Context</div>
                                        <div className="text-xl font-bold text-white flex items-baseline gap-2">
                                            {iteration} <span className="text-xs text-slate-500 font-normal">/ {maxIterations} loops</span>
                                        </div>
                                    </div>
                                    {status === RALPH_STATUS.RUNNING && (
                                        <button
                                            onClick={handleAbort}
                                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                                        >
                                            <Square size={12} fill="currentColor" />
                                            Abort Task
                                        </button>
                                    )}
                                    {(status === RALPH_STATUS.COMPLETE || status === RALPH_STATUS.FAILED || status === RALPH_STATUS.ABORTED) && (
                                        <div className="flex gap-2">
                                            {status === RALPH_STATUS.COMPLETE && (
                                                <button
                                                    onClick={handleSaveToBrain}
                                                    disabled={hasLearned}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${hasLearned
                                                            ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                                            : 'bg-amber-500/20 border border-amber-500/30 text-amber-500 hover:bg-amber-500/30'
                                                        }`}
                                                >
                                                    {hasLearned ? <CheckCircle2 size={12} /> : <Brain size={12} />}
                                                    {hasLearned ? 'Stored in Brain' : 'Save to Brain'}
                                                </button>
                                            )}
                                            <button
                                                onClick={resetRalph}
                                                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-colors"
                                            >
                                                <RefreshCw size={12} />
                                                New Task
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Step visualization */}
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Brain size={12} /> Task Strategy Breakdown
                                    </div>
                                    {steps.map((step, idx) => (
                                        <div key={idx} className={`p-2 rounded-lg border flex items-center gap-3 transition-colors ${activeStepId === step.id
                                            ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
                                            : step.status === 'complete'
                                                ? 'bg-green-500/5 border-green-500/20'
                                                : step.status === 'failed'
                                                    ? 'bg-red-500/5 border-red-500/20'
                                                    : 'bg-white/5 border-white/5 opacity-60'
                                            }`}>
                                            {step.status === 'complete' ? (
                                                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                            ) : step.status === 'failed' ? (
                                                <AlertCircle size={14} className="text-red-500 shrink-0" />
                                            ) : activeStepId === step.id ? (
                                                <Loader2 size={14} className="text-amber-500 animate-spin shrink-0" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 ml-1.5 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-medium text-white truncate">{step.description}</div>
                                                {step.feedback && step.status === 'failed' && (
                                                    <div className="text-[9px] text-red-400 truncate">{step.feedback}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {steps.length === 0 && (
                                        <div className="py-4 flex flex-col items-center justify-center gap-3 text-slate-500">
                                            <Loader2 size={24} className="animate-spin" />
                                            <div className="text-[10px] font-medium uppercase tracking-widest">Architecting Strategy...</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Logs / Console Toggle */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <button
                                    onClick={() => setShowLogs(!showLogs)}
                                    className="p-3 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    <span className="flex items-center gap-2">
                                        <Terminal size={14} /> Agent Session Logs
                                    </span>
                                    {showLogs ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {showLogs && (
                                    <div className="flex-1 bg-slate-950/80 p-3 font-mono text-[10px] overflow-y-auto custom-scrollbar min-h-[150px]">
                                        {logs.map((log, i) => (
                                            <div key={i} className="mb-1.5 border-l border-white/5 pl-2">
                                                <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                                                <span className={`${log.type === 'error' ? 'text-red-400' :
                                                    log.type === 'warn' ? 'text-amber-400' : 'text-blue-400'
                                                    } font-bold`}>
                                                    {log.type.toUpperCase()}:
                                                </span>{' '}
                                                <span className="text-slate-300">{log.message}</span>
                                            </div>
                                        ))}
                                        <div ref={logsEndRef} />
                                    </div>
                                )}

                                {!showLogs && status === RALPH_STATUS.RUNNING && (
                                    <div className="p-8 flex flex-col items-center justify-center text-center gap-4 flex-1">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 flex items-center justify-center">
                                                <Bot size={32} className="text-amber-500 animate-pulse" />
                                            </div>
                                            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-t-amber-500 animate-spin"></div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white mb-1 italic">"I'm learned!"</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Ralph is iterating through logic...</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer / Info */}
            <div className="p-3 bg-slate-900 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500">
                <div className="flex items-center gap-2">
                    <History size={10} />
                    <span>Memory Store Active</span>
                </div>
                <div className="flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-500" />
                    <span>Deterministic Loop Engine v1.0</span>
                </div>
            </div>
        </motion.div>
    );
};

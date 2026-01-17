import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, ArrowRight, FolderOpen, Search, FileText, CheckCircle,
    Loader2, Sparkles, AlertCircle, ChevronDown, X
} from 'lucide-react';
import { GrantsService, FUNDING_CATEGORIES } from '../services/GrantsService';

/**
 * AgentWizard - Pre-generation wizard for Intelligent Document Agents
 * Collects context (folder, external sources) before generating document
 */
export const AgentWizard = ({ agent, onComplete, onBack }) => {
    const [answers, setAnswers] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [grantsResults, setGrantsResults] = useState([]);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [fileContext, setFileContext] = useState([]);

    if (!agent) return null;

    const questions = agent.preQuestions || [];
    const currentQuestion = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;
    const canProceed = !currentQuestion?.required || answers[currentQuestion?.id];

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleGrantSearch = async (keyword) => {
        if (!keyword) return;
        setLoading(true);
        const results = await GrantsService.searchOpportunities(keyword, 'all', 'posted', 10);
        setGrantsResults(results);
        setLoading(false);
    };

    const selectGrant = (grant) => {
        setSelectedGrant(grant);
        handleAnswer('opportunity_search', grant);
        setGrantsResults([]);
    };

    const handleFolderSelect = async () => {
        // In production: Use Tauri dialog to select folder
        // For now: Prompt user and store path
        const path = prompt('Enter folder path (e.g., C:\\Projects\\MyProject):');
        if (path) {
            handleAnswer(currentQuestion.id, path);
            // Simulate indexing files
            setFileContext([
                { name: 'project_overview.md', size: '4.2 KB' },
                { name: 'technical_specs.pdf', size: '1.1 MB' },
                { name: 'team_bios.docx', size: '234 KB' },
            ]);
        }
    };

    const handleNext = () => {
        if (isLastStep) {
            // Compile all context and complete
            const context = {
                agent: agent,
                answers: answers,
                selectedGrant: selectedGrant,
                fileContext: fileContext,
            };
            onComplete(context);
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep === 0) {
            onBack();
        } else {
            setCurrentStep(prev => prev - 1);
        }
    };

    const styles = {
        container: {
            maxWidth: '600px', margin: '0 auto', padding: '32px',
            background: 'rgba(15,23,42,0.8)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
        },
        header: { textAlign: 'center', marginBottom: '32px' },
        agentIcon: {
            width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px'
        },
        progress: {
            display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px'
        },
        progressDot: (active, completed) => ({
            width: '10px', height: '10px', borderRadius: '50%',
            background: completed ? agent.color : active ? 'white' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s'
        }),
        question: { marginBottom: '24px' },
        label: {
            display: 'block', fontSize: '14px', fontWeight: 600, color: 'white',
            marginBottom: '8px'
        },
        description: { fontSize: '12px', color: '#64748b', marginBottom: '12px' },
        input: {
            width: '100%', padding: '14px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
        },
        select: {
            width: '100%', padding: '14px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '14px', outline: 'none', cursor: 'pointer'
        },
        folderBtn: {
            width: '100%', padding: '16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)',
            color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
        },
        selectedFolder: {
            padding: '12px 16px', borderRadius: '10px',
            background: `${agent.color}20`, border: `1px solid ${agent.color}40`,
            color: 'white', fontSize: '13px', marginTop: '8px',
            display: 'flex', alignItems: 'center', gap: '8px'
        },
        grantResult: {
            padding: '12px', borderRadius: '10px', marginBottom: '8px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', transition: 'all 0.2s'
        },
        buttons: { display: 'flex', gap: '12px', marginTop: '32px' },
        btn: (primary) => ({
            flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
            background: primary ? `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)` : 'rgba(255,255,255,0.05)',
            color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: primary && !canProceed ? 0.5 : 1
        })
    };

    const renderQuestionInput = () => {
        if (!currentQuestion) return null;

        switch (currentQuestion.type) {
            case 'folder_picker':
                return (
                    <div>
                        <button onClick={handleFolderSelect} style={styles.folderBtn}>
                            <FolderOpen size={20} />
                            {answers[currentQuestion.id] ? 'Change Folder' : 'Select Folder'}
                        </button>
                        {answers[currentQuestion.id] && (
                            <div style={styles.selectedFolder}>
                                <CheckCircle size={16} color={agent.color} />
                                <span style={{ flex: 1 }}>{answers[currentQuestion.id]}</span>
                            </div>
                        )}
                        {fileContext.length > 0 && (
                            <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                                <p style={{ marginBottom: '8px' }}>📂 {fileContext.length} files found:</p>
                                {fileContext.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', marginLeft: '16px', marginBottom: '4px' }}>
                                        <FileText size={12} /> {f.name} ({f.size})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'grants_search':
                return (
                    <div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="Search grants (e.g., 'clean energy')"
                                style={{ ...styles.input, flex: 1 }}
                                onKeyDown={(e) => e.key === 'Enter' && handleGrantSearch(e.target.value)}
                            />
                            <button
                                onClick={(e) => handleGrantSearch(e.target.previousSibling.value)}
                                style={{ ...styles.btn(true), flex: 'none', padding: '14px 20px' }}
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            </button>
                        </div>
                        {selectedGrant && (
                            <div style={styles.selectedFolder}>
                                <CheckCircle size={16} color={agent.color} />
                                <span style={{ flex: 1 }}>{selectedGrant.title}</span>
                                <X size={14} style={{ cursor: 'pointer' }} onClick={() => { setSelectedGrant(null); handleAnswer('opportunity_search', null); }} />
                            </div>
                        )}
                        {grantsResults.length > 0 && !selectedGrant && (
                            <div style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                                {grantsResults.map(grant => (
                                    <div
                                        key={grant.id}
                                        onClick={() => selectGrant(grant)}
                                        style={styles.grantResult}
                                    >
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{grant.title}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{grant.agency} • {grant.deadline}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        style={styles.select}
                    >
                        <option value="" disabled>Select an option</option>
                        {currentQuestion.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case 'text':
            default:
                return (
                    <input
                        type="text"
                        placeholder={currentQuestion.placeholder || ''}
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        style={styles.input}
                    />
                );
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.agentIcon}>{agent.icon}</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                    {agent.name}
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                    Let me gather some context before we start...
                </p>
            </div>

            {/* Progress */}
            <div style={styles.progress}>
                {questions.map((_, i) => (
                    <div key={i} style={styles.progressDot(i === currentStep, i < currentStep)} />
                ))}
            </div>

            {/* Current Question */}
            {currentQuestion && (
                <div style={styles.question}>
                    <label style={styles.label}>
                        {currentStep + 1}. {currentQuestion.label}
                        {currentQuestion.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </label>
                    {currentQuestion.description && (
                        <p style={styles.description}>{currentQuestion.description}</p>
                    )}
                    {renderQuestionInput()}
                </div>
            )}

            {/* Navigation */}
            <div style={styles.buttons}>
                <button onClick={handlePrev} style={styles.btn(false)}>
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!canProceed}
                    style={styles.btn(true)}
                >
                    {isLastStep ? (
                        <>
                            <Sparkles size={16} /> Start Drafting
                        </>
                    ) : (
                        <>
                            Next <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AgentWizard;

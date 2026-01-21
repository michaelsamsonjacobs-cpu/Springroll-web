import React, { useState, useEffect } from 'react';
import { DocumentBuilder, DOCUMENT_TEMPLATES } from '../services/DocumentBuilder';
import { AgentWizard } from './AgentWizard';
import { getDocumentAgent, getAllDocumentAgents } from '../config/documentAgents';
import {
    FileText, Presentation, Mail, Award, File, Plus, ChevronRight,
    Sparkles, Loader2, Check, Download, Copy, Eye, Edit3, Trash2,
    ArrowLeft, Wand2, Clock, Folder, Layers, BookOpen, Search, Filter,
    Grid, List, Star, TrendingUp, Users, Briefcase, RefreshCw, CheckCircle2, ThumbsUp, ThumbsDown, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = {
    'presentation': Presentation,
    'file-text': FileText,
    'file': File,
    'mail': Mail,
    'award': Award
};

const GRADIENTS = {
    'pitch-deck': 'from-violet-500 via-purple-500 to-fuchsia-500',
    'exec-summary': 'from-blue-500 via-cyan-500 to-teal-500',
    'one-pager': 'from-amber-500 via-orange-500 to-red-500',
    'investor-update': 'from-emerald-500 via-green-500 to-lime-500',
    'grant-proposal': 'from-pink-500 via-rose-500 to-red-500'
};

const CATEGORIES = [
    { id: 'all', label: 'All Templates', icon: Grid },
    { id: 'investor', label: 'Investor Docs', icon: TrendingUp },
    { id: 'grants', label: 'Grants & Proposals', icon: Award },
    { id: 'internal', label: 'Internal', icon: Briefcase },
];

// Map template IDs to categories
const TEMPLATE_CATEGORIES = {
    'pitch-deck': 'investor',
    'exec-summary': 'investor',
    'one-pager': 'investor',
    'investor-update': 'investor',
    'grant-proposal': 'grants',
};

export const DocBuilderDashboard = ({ onPreview }) => {
    const [view, setView] = useState('templates');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [savedDocs, setSavedDocs] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [context, setContext] = useState({ companyName: '', industry: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [agentContext, setAgentContext] = useState(null); // Context from AgentWizard

    useEffect(() => {
        setSavedDocs(DocumentBuilder.getSavedDocuments());
    }, []);

    const handleSelectTemplate = (templateId) => {
        const template = DocumentBuilder.getTemplate(templateId);
        setSelectedTemplate(template);

        // Check if this template has an intelligent agent
        const agent = getDocumentAgent(templateId);
        if (agent) {
            setView('wizard');
        } else {
            setView('editor');
        }
        setCurrentDoc(null);
        setAgentContext(null);
    };

    const handleWizardComplete = (context) => {
        setAgentContext(context);
        setView('editor');
    };

    const handleWizardBack = () => {
        setView('templates');
        setSelectedTemplate(null);
    };

    const handleGenerateDoc = async () => {
        if (!selectedTemplate) return;
        setGenerating(true);
        try {
            // Pass agentContext if available (from wizard)
            const doc = await DocumentBuilder.generateDocument(
                selectedTemplate.id,
                context,
                agentContext // Pass the wizard-collected context
            );
            setCurrentDoc(doc);
        } catch (e) {
            console.error('Generation failed:', e);
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveDoc = () => {
        if (!currentDoc) return;
        DocumentBuilder.saveDocument(currentDoc);
        setSavedDocs(DocumentBuilder.getSavedDocuments());
    };

    const handleExport = (format) => {
        if (!currentDoc) return;

        let content, filename, type;
        if (format === 'markdown') {
            content = DocumentBuilder.exportToMarkdown(currentDoc);
            filename = `${currentDoc.templateName.toLowerCase().replace(/\s+/g, '-')}.md`;
            type = 'text/markdown';
        } else {
            content = DocumentBuilder.exportToHTML(currentDoc);
            filename = `${currentDoc.templateName.toLowerCase().replace(/\s+/g, '-')}.html`;
            type = 'text/html';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    const handlePreview = () => {
        if (!currentDoc || !onPreview) return;
        const html = DocumentBuilder.exportToHTML(currentDoc);
        onPreview(html);
    };

    // Filter templates based on search and category
    const allTemplates = DocumentBuilder.getTemplates();
    const filteredTemplates = allTemplates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || TEMPLATE_CATEGORIES[t.id] === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const styles = {
        container: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
        header: {
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(30,41,59,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
        },
        content: { flex: 1, overflow: 'auto', padding: '24px' },
        searchBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
        },
        searchInput: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
        },
        categoryTabs: {
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            flexWrap: 'wrap',
        },
        categoryTab: (isActive) => ({
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: isActive ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.05)',
            color: isActive ? 'white' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
        }),
        templateGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
        templateCard: {
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {view !== 'templates' && (
                        <button
                            onClick={() => { setView('templates'); setSelectedTemplate(null); setCurrentDoc(null); }}
                            style={{
                                padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8',
                            }}
                        >
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <BookOpen size={18} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                            {view === 'templates' ? 'Document Builder' : selectedTemplate?.name}
                        </h2>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {view === 'templates' ? `${filteredTemplates.length} templates available` : `${selectedTemplate?.sections?.length} sections`}
                        </span>
                    </div>
                </div>

                {currentDoc && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleExport('markdown')} style={{
                            padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8',
                            fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <Download size={14} /> Export
                        </button>
                        <button onClick={handlePreview} style={{
                            padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8',
                            fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <Eye size={14} /> Preview
                        </button>
                        <button onClick={handleSaveDoc} style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)', cursor: 'pointer', color: 'white',
                            fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <Check size={14} /> Save
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={styles.content}>
                {view === 'templates' && (
                    <>
                        {/* Search Bar */}
                        <div style={styles.searchBar}>
                            <div style={styles.searchInput}>
                                <Search size={18} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                        color: 'white', fontSize: '14px',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    style={{
                                        padding: '10px', borderRadius: '10px', border: 'none',
                                        background: viewMode === 'grid' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                                        cursor: 'pointer', color: viewMode === 'grid' ? '#a855f7' : '#64748b',
                                    }}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    style={{
                                        padding: '10px', borderRadius: '10px', border: 'none',
                                        background: viewMode === 'list' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                                        cursor: 'pointer', color: viewMode === 'list' ? '#a855f7' : '#64748b',
                                    }}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div style={styles.categoryTabs}>
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        style={styles.categoryTab(selectedCategory === cat.id)}
                                    >
                                        <Icon size={14} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Recent Documents */}
                        {savedDocs.length > 0 && (
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                                    Recent Documents
                                </h3>
                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                                    {savedDocs.slice(0, 5).map(doc => (
                                        <div
                                            key={doc.id}
                                            onClick={() => { setCurrentDoc(doc); setSelectedTemplate(DOCUMENT_TEMPLATES[doc.templateId]); setView('editor'); }}
                                            style={{
                                                minWidth: '200px', padding: '16px', borderRadius: '12px',
                                                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>{doc.templateName}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(doc.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Template Grid/List */}
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                            {selectedCategory === 'all' ? 'All Templates' : CATEGORIES.find(c => c.id === selectedCategory)?.label}
                        </h3>

                        {viewMode === 'grid' ? (
                            <div style={styles.templateGrid}>
                                {filteredTemplates.map(template => {
                                    const Icon = ICONS[template.icon] || FileText;
                                    const gradient = GRADIENTS[template.id] || 'from-purple-500 to-pink-500';
                                    return (
                                        <div
                                            key={template.id}
                                            onClick={() => handleSelectTemplate(template.id)}
                                            style={styles.templateCard}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                                backgroundImage: gradient.includes('violet') ? 'linear-gradient(135deg, #8b5cf6, #a855f7, #d946ef)' :
                                                    gradient.includes('blue') ? 'linear-gradient(135deg, #3b82f6, #06b6d4, #14b8a6)' :
                                                        gradient.includes('amber') ? 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444)' :
                                                            gradient.includes('emerald') ? 'linear-gradient(135deg, #10b981, #22c55e, #84cc16)' :
                                                                'linear-gradient(135deg, #ec4899, #f43f5e, #ef4444)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: '16px',
                                            }}>
                                                <Icon size={22} color="white" />
                                            </div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: 'white' }}>{template.name}</h4>
                                            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{template.description}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '11px', color: '#64748b', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }}>
                                                    {template.sections.length} sections
                                                </span>
                                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Start <ChevronRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredTemplates.map(template => {
                                    const Icon = ICONS[template.icon] || FileText;
                                    return (
                                        <div
                                            key={template.id}
                                            onClick={() => handleSelectTemplate(template.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                                                borderRadius: '12px', background: 'rgba(15,23,42,0.6)',
                                                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                                            }}
                                        >
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Icon size={18} color="white" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{template.name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{template.description}</div>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>{template.sections.length} sections</span>
                                            <ChevronRight size={18} color="#64748b" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredTemplates.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                                <Search size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <p>No templates found for "{searchQuery}"</p>
                            </div>
                        )}
                    </>
                )}

                {view === 'wizard' && selectedTemplate && (
                    <AgentWizard
                        agent={getDocumentAgent(selectedTemplate.id)}
                        onComplete={handleWizardComplete}
                        onBack={handleWizardBack}
                    />
                )}

                {view === 'editor' && selectedTemplate && (
                    <DocumentEditor
                        template={selectedTemplate}
                        document={currentDoc}
                        context={context}
                        setContext={setContext}
                        onGenerate={handleGenerateDoc}
                        generating={generating}
                        onUpdateSection={(sectionId, content) => {
                            if (!currentDoc) return;
                            const updated = {
                                ...currentDoc,
                                sections: currentDoc.sections.map(s =>
                                    s.sectionId === sectionId ? { ...s, content } : s
                                )
                            };
                            setCurrentDoc(updated);
                        }}
                        onRegenerate={async (sectionId) => {
                            if (!currentDoc || !selectedTemplate) return;
                            const regenerated = await DocumentBuilder.generateSection(
                                selectedTemplate.id,
                                sectionId,
                                context,
                                agentContext
                            );
                            const updated = {
                                ...currentDoc,
                                sections: currentDoc.sections.map(s =>
                                    s.sectionId === sectionId ? regenerated : s
                                )
                            };
                            setCurrentDoc(updated);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// Document Editor Component
const DocumentEditor = ({ template, document, context, setContext, onGenerate, generating, onUpdateSection, onRegenerate }) => {
    const [activeFeedback, setActiveFeedback] = useState({}); // { sectionId: 'accepted' | 'rejected' }
    const [regeneratingSection, setRegeneratingSection] = useState(null);

    const handleAccept = async (sectionId) => {
        await DocumentBuilder.captureAcceptance(document.id, sectionId);
        setActiveFeedback({ ...activeFeedback, [sectionId]: 'accepted' });
        // Auto-save to capture final state
        DocumentBuilder.saveDocument(document);
    };

    const handleRegenerate = async (sectionId) => {
        setRegeneratingSection(sectionId);
        // Capture rejection of current content
        const section = document.sections.find(s => s.sectionId === sectionId);
        await DocumentBuilder.captureRejection(document.id, sectionId, "Regenerated by user");

        // Trigger real AI regeneration via callback
        try {
            await onRegenerate(sectionId);
            setActiveFeedback({ ...activeFeedback, [sectionId]: 'regenerated' });
        } catch (err) {
            console.error('Regeneration failed:', err);
            setActiveFeedback({ ...activeFeedback, [sectionId]: 'error' });
        } finally {
            setRegeneratingSection(null);
        }
    };

    const handleBlur = (sectionId, content) => {
        // Capture edit
        DocumentBuilder.captureEdit(document.id, sectionId, content);
        DocumentBuilder.saveDocument(document);
    };

    const inputStyle = {
        width: '100%', padding: '14px 16px', borderRadius: '12px',
        background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'white', fontSize: '14px', outline: 'none',
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            {/* Context Inputs */}
            {!document && (
                <div style={{
                    padding: '24px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
                    border: '1px solid rgba(168,85,247,0.2)', marginBottom: '32px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Sparkles size={18} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'white' }}>Generate {template.name}</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>AI will use your indexed files as context</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Company Name</label>
                            <input
                                style={inputStyle}
                                placeholder="Acme Inc."
                                value={context.companyName}
                                onChange={e => setContext({ ...context, companyName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Industry</label>
                            <input
                                style={inputStyle}
                                placeholder="SaaS, Fintech, etc."
                                value={context.industry}
                                onChange={e => setContext({ ...context, industry: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={onGenerate}
                        disabled={generating || !context.companyName}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: generating || !context.companyName ? 0.5 : 1,
                        }}
                    >
                        {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Wand2 size={18} /> Generate {template.name}</>}
                    </button>

                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Or launch autonomous worker</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                    </div>

                    <button
                        onClick={() => {
                            // Since showRalph state is in App.jsx, we hope the global nav item is clicked.
                            // But we can trigger a custom event or just suggest it.
                            // For this MVP, we will assume the user opens the Ralph panel from the sidebar.
                            // We can use window.dispatchEvent if we want to be fancy.
                            window.dispatchEvent(new CustomEvent('open-ralph', {
                                detail: { task: `Generate a complete ${template.name} for ${context.companyName} in the ${context.industry} industry.` }
                            }));
                        }}
                        style={{
                            width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)',
                            background: 'rgba(245,158,11,0.05)',
                            color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.05)'}
                    >
                        <Bot size={16} />
                        Launch Ralph Loop (24/7 Autopilot)
                    </button>
                </div>
            )}

            {/* Document Structure */}
            {!document && (
                <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>
                        Document Structure ({template.sections.length} sections)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {template.sections.map((section, i) => (
                            <div key={section.id} style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                                borderRadius: '12px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <span style={{
                                    width: '28px', height: '28px', borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: 'bold', color: 'white',
                                }}>{i + 1}</span>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{section.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{section.prompt}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Generated Sections */}
            {document && (
                <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>
                        Edit Your {template.name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {document.sections.map((section, i) => (
                            <div key={section.sectionId} style={{
                                borderRadius: '12px', background: 'rgba(15,23,42,0.6)',
                                border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
                            }}>
                                <div style={{
                                    padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            width: '24px', height: '24px', borderRadius: '6px',
                                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: 'bold', color: 'white',
                                        }}>{i + 1}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{section.sectionName}</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {/* Learning Badge */}
                                        {section._generation?.enrichedWith && (
                                            <div style={{
                                                padding: '4px 8px', borderRadius: '6px',
                                                background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                fontSize: '10px', color: '#a855f7', fontWeight: 600
                                            }} title="This section was personalized based on your feedback">
                                                <Sparkles size={10} /> Learning
                                            </div>
                                        )}

                                        {/* Regenerate */}
                                        <button
                                            onClick={() => handleRegenerate(section.sectionId)}
                                            disabled={regeneratingSection === section.sectionId}
                                            style={{
                                                padding: '4px', background: 'transparent', border: 'none',
                                                cursor: 'pointer', color: '#64748b', transition: 'color 0.2s',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                            title="Regenerate Section"
                                        >
                                            <RefreshCw size={14} className={regeneratingSection === section.sectionId ? "animate-spin" : ""} />
                                        </button>

                                        {/* Accept */}
                                        <button
                                            onClick={() => handleAccept(section.sectionId)}
                                            style={{
                                                padding: '4px 8px', borderRadius: '6px', border: '1px solid',
                                                borderColor: activeFeedback[section.sectionId] === 'accepted' ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                                background: activeFeedback[section.sectionId] === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                                                cursor: 'pointer',
                                                color: activeFeedback[section.sectionId] === 'accepted' ? '#22c55e' : '#94a3b8',
                                                fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <CheckCircle2 size={14} />
                                            {activeFeedback[section.sectionId] === 'accepted' ? 'Accepted' : 'Accept'}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    style={{
                                        width: '100%', minHeight: '120px', padding: '16px',
                                        background: 'transparent', border: 'none', resize: 'vertical',
                                        color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, outline: 'none',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                    value={section.content}
                                    onChange={e => onUpdateSection(section.sectionId, e.target.value)}
                                    onBlur={e => handleBlur(section.sectionId, e.target.value)}
                                    placeholder={`Write content for "${section.sectionName}"...`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocBuilderDashboard;

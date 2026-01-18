import React, { useState } from 'react';
import { Search, Book, Code, Target, Zap, ChevronRight, ArrowLeft, Lightbulb, PlayCircle, HelpCircle } from 'lucide-react';

export const HelpCenter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);

    // Mock Data - "WikiHow" Style Articles
    const CATEGORIES = [
        { id: 'all', label: 'All Guides', icon: Book },
        { id: 'start', label: 'Getting Started', icon: Zap },
        { id: 'automation', label: 'Automation', icon: Code },
        { id: 'gtm', label: 'GTM Strategy', icon: Target },
        { id: 'docs', label: 'Documents', icon: Book },
    ];

    const ARTICLES = [
        {
            id: 1,
            title: "How to Create Your First Automation",
            category: 'automation',
            description: "Learn how to record a browser task and replay it automatically.",
            readTime: "5 min",
            steps: [
                {
                    title: "Open the Automation Tab",
                    text: "Navigate to the 'AI Agent' tab in the sidebar. This is your command center for all automation tasks.",
                    image: "https://placehold.co/600x300/10b981/white?text=Step+1:+Open+Tab"
                },
                {
                    title: "Click 'Record New Workflow'",
                    text: "Hit the big red record button. A browser window will open. Springroll is now watching your actions.",
                    image: "https://placehold.co/600x300/3b82f6/white?text=Step+2:+Record"
                },
                {
                    title: "Perform Your Task",
                    text: "Do the task exactly as you want the agent to learn it. Click links, fill forms, and scroll.",
                    image: "https://placehold.co/600x300/a855f7/white?text=Step+3:+Demonstrate"
                }
            ]
        },
        {
            id: 2,
            title: "Generating Investor Documents",
            category: 'docs',
            description: "Turn raw notes into a polished pitch deck or executive summary.",
            readTime: "3 min",
            steps: [
                {
                    title: "Select a Template",
                    text: "Go to Doc Builder and choose 'Pitch Deck' or 'Executive Summary' from the template gallery.",
                    image: "https://placehold.co/600x300/ec4899/white?text=Step+1:+Template"
                },
                {
                    title: "Input Your Data",
                    text: "Describe your company, product, and market. The more detail, the better the output.",
                    image: "https://placehold.co/600x300/10b981/white?text=Step+2:+Input"
                }
            ]
        },
        {
            id: 3,
            title: "Finding Leads with GTM Agent",
            category: 'gtm',
            description: "Scout for potential customers and add them to your pipeline.",
            readTime: "4 min",
            steps: [
                {
                    title: "Define Your ICP",
                    text: "Tell the GTM Agent who your Ideal Customer Profile is (e.g., 'CTOs at Series A startups').",
                    image: "https://placehold.co/600x300/a855f7/white?text=Step+1:+ICP"
                }
            ]
        }
    ];

    // Filter Logic
    const filteredArticles = ARTICLES.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const styles = {
        container: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        },
        searchSection: {
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center'
        },
        searchInput: {
            width: '100%',
            maxWidth: '600px',
            padding: '16px 24px 16px 48px',
            borderRadius: '16px',
            background: 'rgba(10,15,26,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '16px',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
        },
        card: {
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        stepCard: {
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            marginBottom: '32px'
        }
    };

    // Article View
    if (selectedArticle) {
        return (
            <div style={{ ...styles.container, padding: '0 24px 24px 24px', overflowY: 'auto' }}>
                <button
                    onClick={() => setSelectedArticle(null)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', color: '#94a3b8',
                        cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0
                    }}
                >
                    <ArrowLeft size={16} /> Back to Help Center
                </button>

                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{selectedArticle.title}</h1>
                    <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '32px', lineHeight: 1.6 }}>
                        {selectedArticle.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {selectedArticle.steps.map((step, index) => (
                            <div key={index} style={styles.stepCard}>
                                <div style={{
                                    padding: '16px 24px', background: 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', gap: '16px'
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: '#3b82f6', color: 'white', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px'
                                    }}>{index + 1}</div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{step.title}</h3>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    {step.image && (
                                        <div style={{
                                            width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden',
                                            marginBottom: '24px', background: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {/* Placeholder for actual screenshot - using div for now */}
                                            <img src={step.image} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                        </div>
                                    )}
                                    <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                                        {step.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        padding: '24px', background: 'rgba(16,185,129,0.1)',
                        borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)',
                        textAlign: 'center', marginTop: '32px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px', color: '#10b981' }}>
                            <CheckIcon /> <span style={{ fontWeight: 'bold' }}>You're all set!</span>
                        </div>
                        <p style={{ margin: 0, color: '#ecfdf5', fontSize: '14px' }}>
                            Ready to try it yourself? <button onClick={() => setSelectedArticle(null)} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Go back to tools</button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Home View
    return (
        <div style={styles.container}>
            {/* Search Header */}
            <div style={styles.searchSection}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>How can we help you?</h1>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Search guides, tutorials, and troubleshooting tips</p>

                <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '600px' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search for 'automation' or 'docs'..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                padding: '10px 20px', borderRadius: '9999px',
                                background: isActive ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: isActive ? 'white' : '#94a3b8',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                flexShrink: 0, transition: 'all 0.2s'
                            }}
                        >
                            <Icon size={16} />
                            <span style={{ fontWeight: 500 }}>{cat.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Results */}
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '12px' }}>
                {activeCategory === 'all' && !searchTerm ? 'Popular Guides' : 'Search Results'}
            </h2>

            <div style={styles.grid}>
                {filteredArticles.map(article => (
                    <div
                        key={article.id}
                        style={styles.card}
                        onClick={() => setSelectedArticle(article)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: 'rgba(59,130,246,0.2)', color: '#3b82f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Lightbulb size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{article.title}</h3>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: 1.5 }}>{article.description}</p>
                        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
                            <PlayCircle size={14} /> {article.readTime} read
                        </div>
                    </div>
                ))}

                {filteredArticles.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: '#64748b' }}>
                        <HelpCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No guides found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default HelpCenter;

import React, { useState, useEffect } from 'react';
import { GrantsService, FUNDING_CATEGORIES, OPP_STATUSES } from '../services/GrantsService';
import {
    Search, Filter, DollarSign, Calendar, Building2, ExternalLink, BookOpen, Star, StarOff,
    Loader2, ChevronRight, ArrowLeft, FileText, Sparkles, Clock, MapPin, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GrantAgentDashboard = ({ onStartApplication }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('posted');
    const [opportunities, setOpportunities] = useState([]);
    const [savedOpps, setSavedOpps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [source, setSource] = useState('grants'); // 'grants' or 'contracts'

    useEffect(() => {
        setSavedOpps(GrantsService.getSavedOpportunities());
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
            let results;
            if (source === 'contracts') {
                results = await GrantsService.searchContracts(
                    searchQuery,
                    selectedCategory,
                    selectedStatus
                );
            } else {
                results = await GrantsService.searchOpportunities(
                    searchQuery,
                    selectedCategory,
                    selectedStatus
                );
            }
            setOpportunities(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOpp = (opp) => {
        const saved = GrantsService.saveOpportunity(opp);
        setSavedOpps(saved);
    };

    const handleRemoveSaved = (id) => {
        const saved = GrantsService.removeSavedOpportunity(id);
        setSavedOpps(saved);
    };

    const isSaved = (id) => savedOpps.some(o => o.id === id);

    const styles = {
        container: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: 'white' },
        header: {
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(30,41,59,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        },
        content: { flex: 1, overflow: 'auto', padding: '24px' },
        searchBox: {
            padding: '24px', borderRadius: '16px', marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
            border: '1px solid rgba(16,185,129,0.2)'
        },
        inputRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
        input: {
            flex: 1, padding: '14px 16px', borderRadius: '12px',
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '14px', outline: 'none'
        },
        select: {
            padding: '14px 16px', borderRadius: '12px', minWidth: '180px',
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '14px', outline: 'none', cursor: 'pointer'
        },
        searchBtn: {
            padding: '14px 24px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: 'white',
            fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
        },
        resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
        card: {
            padding: '20px', borderRadius: '16px', background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s'
        },
        badge: (color) => ({
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            background: `${color}20`, color: color, display: 'inline-flex', alignItems: 'center', gap: '4px'
        }),
        btn: {
            padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
        }
    };

    // Detail View
    if (selectedOpp) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <button onClick={() => setSelectedOpp(null)} style={styles.btn}>
                        <ArrowLeft size={16} /> Back to Results
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => isSaved(selectedOpp.id) ? handleRemoveSaved(selectedOpp.id) : handleSaveOpp(selectedOpp)}
                            style={{ ...styles.btn, background: isSaved(selectedOpp.id) ? 'rgba(234,179,8,0.2)' : undefined }}
                        >
                            {isSaved(selectedOpp.id) ? <Star size={14} fill="#eab308" color="#eab308" /> : <StarOff size={14} />}
                            {isSaved(selectedOpp.id) ? 'Saved' : 'Save'}
                        </button>
                        <a href={selectedOpp.url} target="_blank" rel="noopener noreferrer" style={{ ...styles.btn, textDecoration: 'none' }}>
                            <ExternalLink size={14} /> View on Grants.gov
                        </a>
                        <button
                            onClick={() => onStartApplication && onStartApplication(selectedOpp)}
                            style={{ ...styles.btn, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none' }}
                        >
                            <FileText size={14} /> Start Application
                        </button>
                    </div>
                </div>
                <div style={styles.content}>
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={styles.badge('#10b981')}>{selectedOpp.agencyCode || selectedOpp.agency}</span>
                            <span style={styles.badge('#3b82f6')}>{selectedOpp.number}</span>
                        </div>
                        <h1 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 'bold', lineHeight: 1.3 }}>
                            {selectedOpp.title}
                        </h1>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <DollarSign size={12} /> AWARD AMOUNT
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{selectedOpp.awardAmount}</div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={12} /> DEADLINE
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>{selectedOpp.deadline}</div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Building2 size={12} /> AGENCY
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{selectedOpp.agency}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Description
                            </h3>
                            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#cbd5e1' }}>
                                {selectedOpp.description}
                            </p>
                        </div>

                        <div style={{
                            padding: '20px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
                            border: '1px solid rgba(168,85,247,0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <Sparkles size={20} color="#a855f7" />
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Start Your Application</h3>
                            </div>
                            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                                Create a grant proposal document using Springroll's AI-assisted Doc Builder.
                                We'll pre-fill the opportunity details and help you draft each section.
                            </p>
                            <button
                                onClick={() => onStartApplication && onStartApplication(selectedOpp)}
                                style={{
                                    padding: '14px 24px', borderRadius: '12px', border: 'none',
                                    background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white',
                                    fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <FileText size={18} /> Create Grant Proposal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: source === 'grants'
                            ? 'linear-gradient(135deg, #10b981, #3b82f6)'
                            : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <TrendingUp size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Opportunity Finder</h2>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {source === 'grants' ? 'Federal Grants (Grants.gov)' : 'Government Contracts (SAM.gov)'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Source Toggle */}
                    <div style={{
                        display: 'flex', background: 'rgba(15,23,42,0.8)',
                        borderRadius: '10px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <button
                            onClick={() => setSource('grants')}
                            style={{
                                padding: '6px 14px', borderRadius: '8px', border: 'none',
                                background: source === 'grants' ? 'linear-gradient(135deg, #10b981, #3b82f6)' : 'transparent',
                                color: source === 'grants' ? 'white' : '#64748b',
                                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            💰 Grants
                        </button>
                        <button
                            onClick={() => setSource('contracts')}
                            style={{
                                padding: '6px 14px', borderRadius: '8px', border: 'none',
                                background: source === 'contracts' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'transparent',
                                color: source === 'contracts' ? 'white' : '#64748b',
                                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            📄 Contracts
                        </button>
                    </div>
                    {savedOpps.length > 0 && (
                        <div style={styles.badge('#eab308')}>
                            <Star size={12} fill="#eab308" /> {savedOpps.length} Saved
                        </div>
                    )}
                </div>
            </div>

            <div style={styles.content}>
                {/* Search Box */}
                <div style={styles.searchBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Search size={20} color="#10b981" />
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>Find Opportunities</h3>
                    </div>
                    <div style={styles.inputRow}>
                        <input
                            type="text"
                            placeholder="Search by keyword (e.g., 'autonomous drones', 'clean energy', 'AI')"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={styles.input}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            style={styles.select}
                        >
                            {FUNDING_CATEGORIES.map(cat => (
                                <option key={cat.code} value={cat.code}>{cat.label}</option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            style={styles.select}
                        >
                            {OPP_STATUSES.map(s => (
                                <option key={s.code} value={s.code}>{s.label}</option>
                            ))}
                        </select>
                        <button onClick={handleSearch} disabled={loading} style={{
                            ...styles.searchBtn,
                            background: source === 'grants'
                                ? 'linear-gradient(135deg, #10b981, #3b82f6)'
                                : 'linear-gradient(135deg, #f59e0b, #ef4444)'
                        }}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            Search Opportunities
                        </button>
                    </div>
                </div>

                {/* Results */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        <Loader2 size={32} className="animate-spin" style={{ marginBottom: '12px' }} />
                        <p>Searching federal opportunities...</p>
                    </div>
                )}

                {!loading && hasSearched && opportunities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                        <Search size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <p>No opportunities found. Try different keywords or categories.</p>
                    </div>
                )}

                {!loading && opportunities.length > 0 && (
                    <>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>
                            {opportunities.length} Opportunities Found
                        </h3>
                        <div style={styles.resultsGrid}>
                            {opportunities.map(opp => (
                                <motion.div
                                    key={opp.id}
                                    whileHover={{ scale: 1.02, borderColor: 'rgba(16,185,129,0.3)' }}
                                    style={styles.card}
                                    onClick={() => setSelectedOpp(opp)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <span style={styles.badge('#10b981')}>{opp.agencyCode || opp.agency.split(' ')[0]}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); isSaved(opp.id) ? handleRemoveSaved(opp.id) : handleSaveOpp(opp); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                        >
                                            {isSaved(opp.id) ? <Star size={16} fill="#eab308" color="#eab308" /> : <StarOff size={16} color="#64748b" />}
                                        </button>
                                    </div>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: 'white' }}>
                                        {opp.title}
                                    </h4>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {opp.description}
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <DollarSign size={12} color="#10b981" /> {opp.awardAmount}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} color="#f59e0b" /> {opp.deadline}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            View Details <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Empty State - Before Search */}
                {!hasSearched && (
                    <div style={{ textAlign: 'center', padding: '48px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 20px',
                            background: source === 'grants'
                                ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))'
                                : 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <BookOpen size={32} color={source === 'grants' ? '#10b981' : '#f59e0b'} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                            {source === 'grants'
                                ? 'Find Federal Funding Opportunities'
                                : 'Find Government Contract Opportunities'}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto 24px' }}>
                            {source === 'grants'
                                ? 'Search thousands of grants from agencies like NSF, NIH, DOE, DOD, and USDA. Filter by category and start building your proposal.'
                                : 'Search federal contracts from SAM.gov. Find RFPs, RFIs, and procurement opportunities from DOD, GSA, and other agencies.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {(source === 'grants'
                                ? ['SBIR', 'Clean Energy', 'AI Research', 'Agriculture', 'Health']
                                : ['IT Services', 'Defense', 'Construction', 'Healthcare', 'Logistics']
                            ).map(term => (
                                <button
                                    key={term}
                                    onClick={() => { setSearchQuery(term); setTimeout(handleSearch, 100); }}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrantAgentDashboard;

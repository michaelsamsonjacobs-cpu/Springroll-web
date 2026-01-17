import React, { useState, useEffect } from 'react';
import { GTMService } from '../services/GTMService';
import { SearchService } from '../services/SearchService';
import {
    Users, Target, Mail, TrendingUp, Plus, Search, Filter,
    ArrowUpRight, MoreVertical, Send, UserPlus, Building2,
    DollarSign, Briefcase, ChevronRight, Sparkles, FolderSearch, Loader2, FileText, Wand2,
    X, Link, Key, ExternalLink, Check, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// LinkedIn icon as SVG component
const LinkedInIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
);

const DATA_SOURCES = [
    {
        id: 'linkedin',
        name: 'LinkedIn Sales Navigator',
        icon: LinkedInIcon,
        color: '#0077B5',
        description: 'Import leads from your Sales Navigator lists',
        fields: ['API Key or Session Cookie']
    },
    {
        id: 'apollo',
        name: 'Apollo.io',
        icon: Sparkles,
        color: '#6366f1',
        description: 'Search and enrich leads from Apollo database',
        fields: ['API Key']
    },
    {
        id: 'csv',
        name: 'CSV Import',
        icon: FileText,
        color: '#10b981',
        description: 'Upload a CSV file with your leads',
        fields: []
    },
];

export const GTMDashboard = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('leads');
    const [leads, setLeads] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [stats, setStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [showDataSourceModal, setShowDataSourceModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLeads(GTMService.getLeads());
        setInvestors(GTMService.getInvestors());
        setStats(GTMService.getStats());
    };

    const handleAddLead = (lead) => {
        GTMService.saveLead(lead);
        loadData();
        setShowAddModal(false);
    };

    const handleAddInvestor = (investor) => {
        GTMService.saveInvestor(investor);
        loadData();
        setShowAddModal(false);
    };

    const filteredLeads = leads.filter(l =>
        (l.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInvestors = investors.filter(i =>
        (i.firm || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        container: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        header: {
            padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(30,41,59,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        },
        statsBar: {
            padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0,
        },
        statCard: (color) => ({
            padding: '16px', borderRadius: '12px',
            background: `rgba(${color}, 0.1)`, border: '1px solid rgba(255,255,255,0.05)',
        }),
        tabBar: {
            padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
        },
        tabBtn: (active) => ({
            padding: '8px 16px', borderRadius: '10px', border: 'none',
            background: active ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: active ? 'white' : '#94a3b8',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
        }),
        content: { flex: 1, overflow: 'auto', padding: '24px' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        td: { padding: '16px', fontSize: '13px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.03)' },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Target size={20} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>GTM Agent</h2>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Go-to-Market Command Center</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Data Sources Button */}
                    <button
                        onClick={() => setShowDataSourceModal(true)}
                        style={{
                            padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8',
                            fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                    >
                        <Link size={14} />
                        Connect Data Sources
                    </button>
                    <button
                        onClick={() => setShowScanModal(true)}
                        style={{
                            padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8',
                            fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                    >
                        <FolderSearch size={14} /> Scan Folder
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: '8px 14px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #10b981, #059669)', cursor: 'pointer', color: 'white',
                            fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                    >
                        <Plus size={14} /> Add {activeTab === 'leads' ? 'Lead' : 'Investor'}
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsBar}>
                <StatCard icon={Users} label="Total Leads" value={stats.totalLeads || 0} color="59,130,246" />
                <StatCard icon={Target} label="Qualified" value={stats.qualifiedLeads || 0} color="16,185,129" />
                <StatCard icon={DollarSign} label="Investors" value={stats.totalInvestors || 0} color="168,85,247" />
                <StatCard icon={Mail} label="Emails Sent" value={stats.emailsSent || 0} color="236,72,153" />
            </div>

            {/* Tab Bar */}
            <div style={styles.tabBar}>
                <button onClick={() => setActiveTab('leads')} style={styles.tabBtn(activeTab === 'leads')}>
                    <Building2 size={14} /> Customer Leads <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '10px' }}>{leads.length}</span>
                </button>
                <button onClick={() => setActiveTab('investors')} style={styles.tabBtn(activeTab === 'investors')}>
                    <Briefcase size={14} /> Investor Pipeline <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '10px' }}>{investors.length}</span>
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            style={{
                                width: '200px', padding: '8px 12px 8px 36px', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', fontSize: '12px', outline: 'none',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                {activeTab === 'leads' ? (
                    filteredLeads.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Company</th>
                                    <th style={styles.th}>Contact</th>
                                    <th style={styles.th}>Industry</th>
                                    <th style={styles.th}>Fit Score</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, i) => (
                                    <tr key={i}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 600 }}>{lead.company || 'Unknown'}</div>
                                        </td>
                                        <td style={styles.td}>{lead.name || 'No contact'}</td>
                                        <td style={styles.td}><span style={{ color: '#94a3b8' }}>{lead.industry || '—'}</span></td>
                                        <td style={styles.td}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '6px',
                                                background: lead.fitScore >= 70 ? 'rgba(16,185,129,0.2)' : lead.fitScore >= 40 ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)',
                                                color: lead.fitScore >= 70 ? '#10b981' : lead.fitScore >= 40 ? '#fbbf24' : '#ef4444',
                                                fontSize: '11px', fontWeight: 'bold',
                                            }}>{lead.fitScore || 0}%</span>
                                        </td>
                                        <td style={styles.td}><span style={{ color: '#94a3b8', fontSize: '12px' }}>{lead.status || 'New'}</span></td>
                                        <td style={styles.td}>
                                            <button style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#94a3b8' }}>
                                                <Mail size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState type="leads" onAdd={() => setShowAddModal(true)} onConnect={() => setShowDataSourceModal(true)} />
                    )
                ) : (
                    filteredInvestors.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Firm</th>
                                    <th style={styles.th}>Partner</th>
                                    <th style={styles.th}>Stage</th>
                                    <th style={styles.th}>Check Size</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvestors.map((inv, i) => (
                                    <tr key={i}>
                                        <td style={styles.td}><div style={{ fontWeight: 600 }}>{inv.firm || 'Unknown'}</div></td>
                                        <td style={styles.td}>{inv.name || '—'}</td>
                                        <td style={styles.td}><span style={{ color: '#a855f7' }}>{inv.stage || '—'}</span></td>
                                        <td style={styles.td}>{inv.checkSize || '—'}</td>
                                        <td style={styles.td}><span style={{ color: '#94a3b8' }}>{inv.status || 'Prospect'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState type="investors" onAdd={() => setShowAddModal(true)} onConnect={() => setShowDataSourceModal(true)} />
                    )
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddModal
                    type={activeTab === 'leads' ? 'lead' : 'investor'}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={activeTab === 'leads' ? handleAddLead : handleAddInvestor}
                />
            )}

            {showScanModal && (
                <ScanModal
                    type={activeTab === 'leads' ? 'lead' : 'investor'}
                    onClose={() => setShowScanModal(false)}
                    onImport={(contacts) => {
                        contacts.forEach(c => {
                            if (activeTab === 'leads') GTMService.saveLead(c);
                            else GTMService.saveInvestor(c);
                        });
                        loadData();
                        setShowScanModal(false);
                    }}
                />
            )}

            {showDataSourceModal && (
                <DataSourceModal
                    onClose={() => { setShowDataSourceModal(false); setSelectedSource(null); }}
                    selectedSource={selectedSource}
                    setSelectedSource={setSelectedSource}
                />
            )}
        </div>
    );
};

// Empty State Component
const EmptyState = ({ type, onAdd, onConnect }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '48px' }}>
        <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
        }}>
            {type === 'leads' ? <Building2 size={32} color="#10b981" /> : <Briefcase size={32} color="#10b981" />}
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
            No {type === 'leads' ? 'leads' : 'investors'} yet
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b', maxWidth: '300px' }}>
            {type === 'leads'
                ? 'Import leads from LinkedIn, Apollo, or add them manually to start building your pipeline.'
                : 'Add investors to track your fundraising pipeline and outreach status.'}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onConnect} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: 'white',
                fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <Link size={16} /> Connect Data Source
            </button>
            <button onClick={onAdd} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)', cursor: 'pointer', color: 'white',
                fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <Plus size={16} /> Add {type === 'leads' ? 'Lead' : 'Investor'}
            </button>
        </div>
    </div>
);

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{
        padding: '16px', borderRadius: '12px',
        background: `rgba(${color}, 0.1)`, border: '1px solid rgba(255,255,255,0.05)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Icon size={18} style={{ color: `rgb(${color})` }} />
            <ArrowUpRight size={12} style={{ color: '#64748b' }} />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>{label}</div>
    </div>
);

// Data Source Modal
const DataSourceModal = ({ onClose, selectedSource, setSelectedSource }) => {
    const [apiKey, setApiKey] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);

    const handleConnect = () => {
        setConnecting(true);
        // Simulate connection
        setTimeout(() => {
            setConnecting(false);
            setConnected(true);
            // Save to localStorage
            if (selectedSource && apiKey) {
                localStorage.setItem(`springroll_${selectedSource.id}_key`, apiKey);
            }
        }, 1500);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px',
        }} onClick={onClose}>
            <div style={{
                width: '100%', maxWidth: '520px', background: '#0a0f1a', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                        {selectedSource ? `Connect ${selectedSource.name}` : 'Connect Data Source'}
                    </h3>
                    <button onClick={onClose} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {!selectedSource ? (
                        // Source Selection
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>
                                Choose a data source to import and enrich your leads
                            </p>
                            {DATA_SOURCES.map(source => {
                                const Icon = source.icon;
                                const isConnected = localStorage.getItem(`springroll_${source.id}_key`);
                                return (
                                    <button
                                        key={source.id}
                                        onClick={() => setSelectedSource(source)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                                            borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', textAlign: 'left',
                                        }}
                                    >
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '10px',
                                            background: source.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icon size={20} style={{ color: 'white' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{source.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{source.description}</div>
                                        </div>
                                        {isConnected ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981' }}>
                                                <Check size={12} /> Connected
                                            </span>
                                        ) : (
                                            <ChevronRight size={18} style={{ color: '#64748b' }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        // Configuration Form
                        <div>
                            {connected ? (
                                <div style={{ textAlign: 'center', padding: '32px' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '50%',
                                        background: 'rgba(16,185,129,0.1)', border: '2px solid #10b981',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                                    }}>
                                        <Check size={28} color="#10b981" />
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                                        Connected Successfully!
                                    </h4>
                                    <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b' }}>
                                        You can now import leads from {selectedSource.name}
                                    </p>
                                    <button onClick={onClose} style={{
                                        padding: '10px 24px', borderRadius: '10px', border: 'none',
                                        background: 'linear-gradient(135deg, #10b981, #059669)', cursor: 'pointer',
                                        color: 'white', fontSize: '13px', fontWeight: 'bold',
                                    }}>
                                        Start Importing
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                                        borderRadius: '12px', background: 'rgba(255,255,255,0.03)', marginBottom: '20px',
                                    }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: selectedSource.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <selectedSource.icon size={18} style={{ color: 'white' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{selectedSource.name}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedSource.description}</div>
                                        </div>
                                    </div>

                                    {selectedSource.id === 'csv' ? (
                                        <div style={{
                                            padding: '32px', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.1)',
                                            textAlign: 'center', cursor: 'pointer',
                                        }}>
                                            <FileText size={32} style={{ color: '#64748b', marginBottom: '12px' }} />
                                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                                Drop your CSV file here or click to browse
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                <Key size={12} style={{ display: 'inline', marginRight: '6px' }} />
                                                API Key
                                            </label>
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={e => setApiKey(e.target.value)}
                                                placeholder={`Enter your ${selectedSource.name} API key`}
                                                style={{
                                                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                                                }}
                                            />
                                            <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                                                <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                Your API key is stored locally and never sent to our servers.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedSource && !connected && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={() => setSelectedSource(null)} style={{
                            padding: '10px 16px', borderRadius: '10px', border: 'none',
                            background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', fontWeight: 500,
                        }}>
                            ← Back
                        </button>
                        <button
                            onClick={handleConnect}
                            disabled={selectedSource.id !== 'csv' && !apiKey}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', border: 'none',
                                background: (selectedSource.id === 'csv' || apiKey) ? selectedSource.color : 'rgba(255,255,255,0.05)',
                                cursor: (selectedSource.id === 'csv' || apiKey) ? 'pointer' : 'default',
                                color: (selectedSource.id === 'csv' || apiKey) ? 'white' : '#64748b',
                                fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                        >
                            {connecting ? <><Loader2 size={14} className="animate-spin" /> Connecting...</> : 'Connect'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Add Modal Component  
const AddModal = ({ type, onClose, onSubmit }) => {
    const [form, setForm] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px',
        }} onClick={onClose}>
            <div style={{
                width: '100%', maxWidth: '420px', background: '#0a0f1a', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                        Add {type === 'lead' ? 'Lead' : 'Investor'}
                    </h3>
                    <button onClick={onClose} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {type === 'lead' ? (
                        <>
                            <input placeholder="Company Name" onChange={e => setForm({ ...form, company: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            <input placeholder="Contact Name" onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            <input placeholder="Industry" onChange={e => setForm({ ...form, industry: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            <input type="number" placeholder="Fit Score (0-100)" onChange={e => setForm({ ...form, fitScore: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        </>
                    ) : (
                        <>
                            <input placeholder="Firm Name" onChange={e => setForm({ ...form, firm: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            <input placeholder="Partner Name" onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            <input placeholder="Stage (Seed, Series A, etc.)" onChange={e => setForm({ ...form, stage: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            <input placeholder="Check Size" onChange={e => setForm({ ...form, checkSize: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        </>
                    )}
                    <button type="submit" style={{
                        padding: '12px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)', cursor: 'pointer',
                        color: 'white', fontSize: '13px', fontWeight: 'bold',
                    }}>
                        Add {type === 'lead' ? 'Lead' : 'Investor'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Scan Modal (simplified)
const ScanModal = ({ type, onClose, onImport }) => {
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState([]);

    const handleScan = async () => {
        setScanning(true);
        const found = await SearchService.findContacts(type);
        setResults(found || []);
        setScanning(false);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px',
        }} onClick={onClose}>
            <div style={{
                width: '100%', maxWidth: '480px', background: '#0a0f1a', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Scan Local Files</h3>
                    <button onClick={onClose} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                </div>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <FolderSearch size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
                    <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '13px' }}>
                        Scan your indexed workspace for potential {type}s in documents, emails, and notes.
                    </p>
                    <button onClick={handleScan} disabled={scanning} style={{
                        padding: '12px 24px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)', cursor: 'pointer',
                        color: 'white', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
                    }}>
                        {scanning ? <><Loader2 size={14} className="animate-spin" /> Scanning...</> : <><FolderSearch size={14} /> Start Scan</>}
                    </button>
                    {results.length > 0 && (
                        <div style={{ marginTop: '24px', textAlign: 'left' }}>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Found {results.length} potential {type}s</p>
                            <button onClick={() => { onImport(results); }} style={{
                                width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                                background: 'rgba(16,185,129,0.2)', cursor: 'pointer', color: '#10b981', fontSize: '12px', fontWeight: 'bold',
                            }}>
                                Import All
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GTMDashboard;

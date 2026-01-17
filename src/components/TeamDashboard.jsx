import React, { useState, useEffect } from 'react';
import { ClassroomService } from '../services/ClassroomService';
import {
    Users, FolderOpen, MessageSquare, TrendingUp, Clock, ChevronRight,
    Grid, List, Search, Settings, Download, Eye, FileText, CheckCircle,
    AlertCircle, ArrowLeft, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TeamDashboard = ({ onNavigateToStudent, onExit }) => {
    const [students, setStudents] = useState([]);
    const [activity, setActivity] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [studentsData, activityData] = await Promise.all([
            ClassroomService.getStudents(),
            ClassroomService.getRecentActivity()
        ]);
        setStudents(studentsData);
        setActivity(activityData);
        setLoading(false);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: students.length,
        submitted: students.filter(s => s.progress >= 80).length,
        pending: students.filter(s => s.progress < 80).length,
    };

    const handleSendFeedback = async () => {
        if (!feedbackText.trim() || !selectedStudent) return;
        await ClassroomService.saveFeedback(selectedStudent.folder, feedbackText);
        setFeedbackText('');
        alert('Feedback saved!');
    };

    const styles = {
        container: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: 'white' },
        header: {
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(30,41,59,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        },
        content: { flex: 1, overflow: 'auto', padding: '24px' },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
        statCard: {
            padding: '20px', borderRadius: '16px', background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)'
        },
        studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
        studentCard: {
            padding: '20px', borderRadius: '16px', background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s'
        },
        progressBar: (progress) => ({
            height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)',
            position: 'relative', overflow: 'hidden', marginTop: '12px'
        }),
        progressFill: (progress) => ({
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${progress}%`, borderRadius: '3px',
            background: progress >= 80 ? 'linear-gradient(90deg, #10b981, #22c55e)' :
                progress >= 50 ? 'linear-gradient(90deg, #f59e0b, #eab308)' : 'linear-gradient(90deg, #ef4444, #f97316)'
        }),
        btn: {
            padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
        }
    };

    if (selectedStudent) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setSelectedStudent(null)} style={styles.btn}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                                {selectedStudent.name}'s Workspace
                            </h2>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {selectedStudent.files} files • Last active: {selectedStudent.lastActivity}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ ...styles.content, display: 'flex', gap: '24px' }}>
                    {/* Mock File List */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Student Files
                        </h3>
                        {['Draft1.docx', 'FinalDraft.docx', 'notes.txt'].map((file, i) => (
                            <div key={i} style={{
                                padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <FileText size={18} color="#64748b" />
                                <span style={{ flex: 1, fontSize: '14px' }}>{file}</span>
                                <button style={{ ...styles.btn, padding: '6px 10px' }}>
                                    <Eye size={14} /> View
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Feedback Panel */}
                    <div style={{ width: '320px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Leave Feedback
                        </h3>
                        <div style={{
                            padding: '16px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)',
                            border: '1px solid rgba(168,85,247,0.2)'
                        }}>
                            <textarea
                                value={feedbackText}
                                onChange={e => setFeedbackText(e.target.value)}
                                placeholder="Write your feedback here..."
                                style={{
                                    width: '100%', height: '120px', padding: '12px', borderRadius: '8px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white', fontSize: '13px', resize: 'none', outline: 'none',
                                    boxSizing: 'border-box', marginBottom: '12px'
                                }}
                            />
                            <button
                                onClick={handleSendFeedback}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                                    background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white',
                                    fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <Send size={16} /> Send Feedback
                            </button>
                        </div>

                        {/* Previous Feedback */}
                        <div style={{ marginTop: '24px' }}>
                            <h4 style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>PREVIOUS FEEDBACK</h4>
                            {ClassroomService.getFeedback(selectedStudent.folder).map((fb, i) => (
                                <div key={i} style={{
                                    padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px'
                                }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>{fb.content}</p>
                                    <span style={{ fontSize: '10px', color: '#64748b' }}>{new Date(fb.date).toLocaleDateString()}</span>
                                </div>
                            ))}
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
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Users size={24} color="white" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Classroom Dashboard</h2>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {ClassroomService.getClassroomPath() || 'BUS301 - Business Writing'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.btn}><Download size={14} /> Export Report</button>
                    <button style={styles.btn}><Settings size={14} /> Settings</button>
                </div>
            </div>

            <div style={styles.content}>
                {/* Stats */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{stats.total}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={14} /> Total Students
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{stats.submitted}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={14} /> Submitted (80%+)
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={14} /> In Progress
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        borderRadius: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '14px' }}
                        />
                    </div>
                    <button onClick={() => setViewMode('grid')} style={{ ...styles.btn, background: viewMode === 'grid' ? 'rgba(168,85,247,0.2)' : undefined }}>
                        <Grid size={16} />
                    </button>
                    <button onClick={() => setViewMode('list')} style={{ ...styles.btn, background: viewMode === 'list' ? 'rgba(168,85,247,0.2)' : undefined }}>
                        <List size={16} />
                    </button>
                </div>

                {/* Student Grid */}
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    Student Work
                </h3>
                <div style={styles.studentGrid}>
                    {filteredStudents.map(student => (
                        <motion.div
                            key={student.id}
                            whileHover={{ scale: 1.02, borderColor: 'rgba(168,85,247,0.3)' }}
                            style={styles.studentCard}
                            onClick={() => setSelectedStudent(student)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '16px', fontWeight: 'bold', color: 'white'
                                }}>
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{student.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{student.files} files</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                                <span>Progress</span>
                                <span style={{ fontWeight: 600 }}>{student.progress}%</span>
                            </div>
                            <div style={styles.progressBar(student.progress)}>
                                <div style={styles.progressFill(student.progress)} />
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {student.lastActivity}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div style={{ marginTop: '32px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                        Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activity.map((item, i) => (
                            <div key={i} style={{
                                padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                {item.type === 'upload' ? <FolderOpen size={16} color="#3b82f6" /> : <MessageSquare size={16} color="#a855f7" />}
                                <span style={{ flex: 1, fontSize: '13px' }}>
                                    <strong>{item.student}</strong> {item.type === 'upload' ? 'uploaded' : 'received feedback on'} "{item.file}"
                                </span>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;

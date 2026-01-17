import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, AlertCircle, Users, FolderOpen, Shield, User } from 'lucide-react';
import { ClassroomService } from '../services/ClassroomService';

export const AuthScreen = ({ onLogin, onGuest }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [teamMode, setTeamMode] = useState(false);
    const [role, setRole] = useState('student'); // 'admin' or 'student'
    const [classroomPath, setClassroomPath] = useState('');

    const handleGoogleLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (teamMode) {
                ClassroomService.setClassroomPath(classroomPath || 'BUS301');
                ClassroomService.setRole(role);
                if (role === 'student') {
                    ClassroomService.setStudentName(username || 'Student');
                }
            }
            onLogin({ type: 'google', name: 'Google User', role: teamMode ? role : 'personal' });
        }, 1500);
    };

    const handleLocalLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (username && password) {
                if (teamMode) {
                    ClassroomService.setClassroomPath(classroomPath || 'BUS301');
                    ClassroomService.setRole(role);
                    if (role === 'student') {
                        ClassroomService.setStudentName(username);
                    }
                }
                onLogin({ type: 'local', name: username, role: teamMode ? role : 'personal' });
            }
        }, 1000);
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#050816',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Gradients */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%',
                width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%',
                width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%', pointerEvents: 'none'
            }} />

            <div style={{
                width: '420px',
                padding: '40px',
                background: 'rgba(10,15,26,0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Logo */}
                <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '24px',
                    boxShadow: '0 0 20px rgba(59,130,246,0.3)'
                }}>
                    <Sparkles size={32} color="white" />
                </div>

                <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Springroll Team</h1>
                <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '14px' }}>Sovereign Agentic Workstation</p>

                {/* Team Mode Toggle */}
                <div style={{
                    width: '100%', padding: '16px', borderRadius: '12px', marginBottom: '20px',
                    background: teamMode ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                    border: teamMode ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: teamMode ? '16px' : 0 }}>
                        <div
                            onClick={() => setTeamMode(!teamMode)}
                            style={{
                                width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                                background: teamMode ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', padding: '2px', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '10px', background: 'white',
                                transform: teamMode ? 'translateX(20px)' : 'translateX(0)', transition: 'all 0.2s'
                            }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={14} /> Team Mode
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Join a classroom or team workspace</div>
                        </div>
                    </div>

                    {teamMode && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Classroom folder name (e.g., BUS301)"
                                value={classroomPath}
                                onChange={e => setClassroomPath(e.target.value)}
                                style={inputStyle}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setRole('student')}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                        background: role === 'student' ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.05)',
                                        color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                    }}
                                >
                                    <User size={14} /> Student
                                </button>
                                <button
                                    onClick={() => setRole('admin')}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                        background: role === 'admin' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.05)',
                                        color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                    }}
                                >
                                    <Shield size={14} /> Admin
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        cursor: isLoading ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '24px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {isLoading ? 'Connecting...' : 'Sign in with Google'}
                </button>

                <div style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px',
                    color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    OR
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Local Login Form */}
                <form onSubmit={handleLocalLogin} style={{ width: '100%' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                            color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: isLoading ? 'wait' : 'pointer',
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px' }}>
                    <button
                        onClick={onGuest}
                        style={{
                            background: 'none', border: 'none', color: '#64748b',
                            fontSize: '13px', cursor: 'pointer', textDecoration: 'underline'
                        }}
                    >
                        Continue as Guest (Sovereign Mode)
                    </button>
                </div>
            </div>
        </div>
    );
};

import { authAPI, tournamentAPI, requestAPI, notificationAPI, supportAPI } from '../services/api';
import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl, handleAvatarError, VALID_AVATARS } from '../utils/avatarUtils';
import axios from 'axios';
import {
    Activity, Trophy, Users, Key, LayoutGrid, Settings,
    Bell, ShieldAlert, Plus, Minus, Search, Filter, Edit2,
    Trash2, X, CheckCircle2, XCircle, Crown, Clock, Eye, Download, Share2, Copy,
    ChevronRight, ChevronDown, Zap, Target, Calendar, ChevronLeft, LogOut, Loader2, Menu,
    Info, Mail, Send, PanelLeftOpen, PanelLeftClose
} from 'lucide-react';

// Simple CountUp Component for stats
const CountUp = ({ end, duration = 2000, prefix = "", suffix = "" }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime = null;
        let animationFrame = null;
        const endNum = parseInt(end.toString().replace(/[^0-9]/g, ''));
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setCount(Math.floor(percentage * endNum));
            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            }
        };
        
        animationFrame = requestAnimationFrame(animate);
        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [end, duration]);
    
    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const PlayerDashboard = () => {
    
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [activeNav, setActiveNav] = useState('Overview');
    const [revealKey, setRevealKey] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [modalTab, setModalTab] = useState('Profile'); // 'Profile', 'Identity'
    const [showHypeCard, setShowHypeCard] = useState(null);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [tournamentTab, setTournamentTab] = useState('ALL'); // 'ALL', 'BOOKED'
    const [userRequests, setUserRequests] = useState([]);

    // Support / Chat States
    const [supportMessages, setSupportMessages] = useState([]);
    const [supportInput, setSupportInput] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeNav === 'Support') {
            scrollToBottom();
        }
    }, [supportMessages, activeNav]);

    
    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterGame, setFilterGame] = useState('ALL');
    const [filterFee, setFilterFee] = useState('ALL'); // 'ALL', 'FREE', 'PAID'

    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Slot Booking States
    const [selectedTourneyId, setSelectedTourneyId] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    
    // Settings States
    const [settings, setSettings] = useState({
        theme: 'cyan',
        scanlines: true,
        highFidelity: true,
        notifications: {
            tournaments: true,
            achievements: true,
            security: true,
            system: false
        },
        mfaEnabled: false
    });
    
    // Dynamic Settings Effects
    useEffect(() => {
        const root = document.documentElement;
        const themes = {
            cyan: { primary: '#00F3FF', glow: 'rgba(0, 243, 255, 0.25)' },
            red: { primary: '#FF0055', glow: 'rgba(255, 0, 85, 0.25)' },
            gold: { primary: '#F59E0B', glow: 'rgba(245, 158, 11, 0.25)' },
            purple: { primary: '#7C3AED', glow: 'rgba(124, 58, 237, 0.25)' }
        };
        
        const currentTheme = themes[settings.theme] || themes.cyan;
        root.style.setProperty('--accent', currentTheme.primary);
        root.style.setProperty('--accent-glow', currentTheme.glow);
        
        // Save to localStorage whenever settings change
        localStorage.setItem('elite_settings', JSON.stringify(settings));
    }, [settings]);

    // Initial settings load
    useEffect(() => {
        const savedSettings = localStorage.getItem('elite_settings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    // Unified Auth & Data Synchronization
    useEffect(() => {
        checkAuth();
    }, []);

    const [playerData, setPlayerData] = useState({
        name: 'NOVA',
        role: 'ELITE STRIKER',
        rank: '4',
        sector: 'SEC-ALPHA',
        joinDate: '10 JAN 2025',
        avatar: 'generic',
        level: 42,
        xp: 2840,
        nextLevelXp: 5000,
        banner: 'neon',
        frame: 'elite'
    });

    const fetchTournaments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/tournaments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTournaments(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Fetch error:", error);
            showNotify("CONNECTION FAILURE: OFFLINE MODE", "danger");
            setLoading(false);
        }
    };

    const fetchUserRequests = async () => {
        try {
            const res = await requestAPI.getUserRequests();
            setUserRequests(res.data);
        } catch (error) {
            console.error('Error fetching user requests:', error);
        }
    };

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        try {
            const res = await authAPI.getMe();
            
            // ROLE-BASED REDIRECTION
            if (res.data.role === 'ADMIN') {
                window.location.href = '/admin';
                return;
            }
            if (res.data.role === 'MASTER') {
                window.location.href = '/master';
                return;
            }

            console.log("DEBUG: Setting currentUserId to", res.data._id); setCurrentUserId(res.data._id); // INITIALIZE CURRENT USER ID
            setPlayerData(prev => ({
                ...prev,
                name: res.data.name,
                email: res.data.email,
                avatar: res.data.avatar || 'generic',
                role: res.data.role.toUpperCase(),
                level: res.data.level || prev.level,
                xp: res.data.xp || prev.xp
            }));
            setIsAuthorized(true);
            fetchTournaments();
            fetchNotifications();
            fetchUserRequests(); // Fetch user requests after auth
        } catch (error) {
            console.error("Auth error:", error);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!requestMessage.trim()) return;
        
        setRequestLoading(true);
        try {
            await requestAPI.create({ message: requestMessage, type: 'HOST_ACCESS' });
            showNotify("REQUEST DISPATCHED TO OVERSEERS", "success");
            setShowRequestModal(false);
            setRequestMessage('');
        } catch (error) {
            showNotify(error.response?.data?.message || "TRANSMISSION FAILED", "danger");
        } finally {
            setRequestLoading(false);
        }
    };

    const fetchSupportMessages = async () => {
        try {
            const res = await supportAPI.getMessages();
            setSupportMessages(res.data.data);
        } catch (error) {
            console.error('Error fetching support messages:', error);
        }
    };

    const handleSendSupportMessage = async (e) => {
        if (e) e.preventDefault();
        if (!supportInput.trim()) return;

        setIsSendingMessage(true);
        try {
            await supportAPI.sendMessage({
                message: supportInput,
                senderRole: 'PLAYER'
            });

            setSupportInput('');
            fetchSupportMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            showNotify('FAILED TO TRANSMIT MESSAGE', 'danger');
        } finally {
            setIsSendingMessage(false);
        }
    };

    useEffect(() => {
        if (isAuthorized && activeNav === 'Support') {
            fetchSupportMessages();
            const interval = setInterval(fetchSupportMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isAuthorized, activeNav]);


    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [stats, setStats] = useState([
        { label: 'Ops Handled', value: '422', color: 'amber', icon: <Target size={20} /> },
        { label: 'Tactical Wins', value: '48', color: 'emerald', icon: <Trophy size={20} /> },
        { label: 'Current Sync', value: '99.8', color: 'sky', icon: <Activity size={20} />, suffix: '%' },
        { label: 'Battle Badges', value: '12', color: 'purple', icon: <Crown size={20} /> },
    ]);

    // IDENTITY & PROGRESSION ASSETS
    const BANNERS = [
        { id: 'neon', name: 'Neon Strike', color: 'from-cyan-500 to-blue-600', icon: <Zap size={14} /> },
        { id: 'vanguard', name: 'Vanguard', color: 'from-red-500 to-amber-600', icon: <ShieldAlert size={14} /> },
        { id: 'phantom', name: 'Phantom', color: 'from-purple-500 to-pink-600', icon: <Eye size={14} /> },
        { id: 'omega', name: 'Omega Protocol', color: 'from-slate-700 to-black', icon: <Key size={14} /> }
    ];

    const FRAMES = [
        { id: 'standard', name: 'Standard', border: 'border-white/20' },
        { id: 'elite', name: 'Elite Sync', border: 'border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.3)]' },
        { id: 'legendary', name: 'Legendary', border: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.4)]' }
    ];

    const AVATARS = VALID_AVATARS;

    

    const [achievements, setAchievements] = useState([
        { id: 1, name: 'First Blood', emoji: '🩸', earned: true, category: 'Combat', rarity: 'Common', description: 'Secured the first kill in a competitive match.', date: 'JAN 12, 2026' },
        { id: 2, name: 'Veteran', emoji: '🎖', earned: true, category: 'Rank', rarity: 'Epic', description: 'Completed over 100 tactical missions.', date: 'FEB 05, 2026' },
        { id: 3, name: 'Multi-Game Master', emoji: '🕹', earned: true, category: 'Skill', rarity: 'Legendary', description: 'Achieved top ranks in at least three distinct deployment zones.', date: 'MAR 01, 2026' },
        { id: 4, name: 'Slot Booker', emoji: '🎫', earned: true, category: 'Social', rarity: 'Common', description: 'Successfully secured 10 premium tournament slots.', date: 'MAR 10, 2026' },
        { id: 5, name: 'Top 3 Finisher', emoji: '🥉', earned: true, category: 'Combat', rarity: 'Epic', description: 'Placed in the Top 3 of a major championship.', date: 'MAR 12, 2026' },
        { id: 6, name: 'Champion', emoji: '👑', earned: false, category: 'Combat', rarity: 'Legendary', description: 'Won a Tier-1 Global Tournament. Awaiting fulfillment.', requirement: 'Win 1 World Championship' },
        { id: 7, name: 'Legend', emoji: '🌟', earned: false, category: 'Rank', rarity: 'Legendary', description: 'Maintained a win streak of 20+ matches. Awaiting fulfillment.', requirement: '20 Win Streak' },
        { id: 8, name: 'Season Victor', emoji: '⚔', earned: false, category: 'Skill', rarity: 'Epic', description: 'Crowned overall victor of the competitive season. Awaiting fulfillment.', requirement: 'Top 1 Season Rank' },
    ]);

    const showNotify = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleLogout = () => {
        showNotify("LOGGING OUT...", "danger");
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('elite_tournaments');
            window.location.href = '/login';
        }, 1000);
    };

    const handleReserveSlot = async (id) => {
        try {
            const token = localStorage.getItem('token');
            showNotify("RESERVING SLOT... INITIALIZING HANDSHAKE", "info");
            
            const res = await axios.post(`http://localhost:5000/api/tournaments/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showNotify("TACTICAL SLOT SECURED", "success");
            fetchTournaments(); // Refresh data
        } catch (error) {
            const msg = error.response?.data?.message || "TRANSMISSION ERROR";
            showNotify(msg.toUpperCase(), "danger");
        }
    };

    const handleSyncProfile = async () => {
        showNotify("SYNCHRONIZING IDENTITY...", "info");
        try {
            const res = await authAPI.updateProfile({
                name: playerData.name,
                avatar: playerData.avatar,
                banner: playerData.banner,
                frame: playerData.frame
            });
            
            setPlayerData(prev => ({
                ...prev,
                name: res.data.name,
                avatar: res.data.avatar,
                banner: res.data.banner || prev.banner,
                frame: res.data.frame || prev.frame
            }));
            
            setShowProfile(false);
            showNotify("IDENTITY VAULT UPDATED", "success");
        } catch (error) {
            console.error("Sync error:", error);
            showNotify(error.response?.data?.message || "SYNCHRONIZATION FAILED", "danger");
        }
    };


    return (
        <div className="flex flex-col h-screen bg-[var(--bg-deep)] text-white font-inter selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
            {/* Background Layers */}
            <div className="cyber-bg" />
            <div className={`scan-layer transition-opacity duration-1000 ${settings.scanlines ? 'opacity-20' : 'opacity-0'}`} />
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
                    
                    :root {
                        --bg-deep: #080B10;
                        --surface: #0F172A;
                        --accent: #00F3FF;
                        --accent-glow: rgba(0, 243, 255, 0.25);
                        --secondary: #3B82F6;
                        --danger: #FF0055;
                        --success: #00FF9D;
                        --text-primary: #F8FAFC;
                        --text-secondary: #64748B;
                    }

                    .font-outfit { font-family: 'Outfit', sans-serif; }
                    .font-inter { font-family: 'Inter', sans-serif; }
                    .font-mono-premium { font-family: 'JetBrains Mono', monospace; }

                    .glass-panel {
                        background: rgba(15, 23, 42, 0.6);
                        backdrop-filter: blur(16px);
                        border: 1px solid color-mix(in srgb, var(--accent), transparent 95%);
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
                    }

                    .premium-card {
                        background: rgba(15, 23, 42, 0.4);
                        border: 1px solid rgba(255, 255, 255, 0.03);
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                    }

                    .premium-card:hover {
                        border-color: color-mix(in srgb, var(--accent), transparent 70%);
                        transform: translateY(-4px) scale(1.01);
                        background: rgba(15, 23, 42, 0.6);
                        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px 0 color-mix(in srgb, var(--accent), transparent 90%);
                    }

                    .accent-gradient {
                        background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
                    }

                    .text-gradient {
                        background: linear-gradient(to right, var(--accent), #A5F3FC);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }

                    .nav-indicator {
                        position: absolute;
                        left: 0;
                        width: 3px;
                        height: 20px;
                        background: var(--accent);
                        border-radius: 0 4px 4px 0;
                        box-shadow: 0 0 15px var(--accent-glow);
                    }
                    
                    @keyframes rotate-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    .animate-rotate-slow {
                        animation: rotate-slow 20s linear infinite;
                    }

                    .cyber-bg {
                        position: fixed;
                        inset: 0;
                        background: radial-gradient(circle at 50% 50%, #0F172A 0%, #020617 100%);
                        z-index: -1;
                    }

                    .scan-layer {
                        position: fixed;
                        inset: 0;
                        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, color-mix(in srgb, var(--accent), transparent 97%), transparent, color-mix(in srgb, var(--accent), transparent 97%));
                        background-size: 100% 4px, 4px 100%;
                        pointer-events: none;
                        z-index: 100;
                        opacity: 0.2;
                    }

                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                    @keyframes shine {
                        0% { transform: translateX(-100%) skewX(-30deg); opacity: 0; }
                        50% { opacity: 0.5; }
                        100% { transform: translateX(200%) skewX(-30deg); opacity: 0; }
                    }

                    .achievement-light-effect {
                        position: relative;
                        overflow: hidden;
                    }

                    .achievement-light-effect::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 50%;
                        height: 100%;
                        background: linear-gradient(
                            to right,
                            transparent,
                            rgba(255, 255, 255, 0.1),
                            rgba(255, 255, 255, 0.2),
                            rgba(255, 255, 255, 0.1),
                            transparent
                        );
                        transform: skewX(-30deg);
                        transition: none;
                        pointer-events: none;
                        z-index: 10;
                    }

                    .achievement-light-effect:hover::before {
                        animation: shine 1.2s ease-in-out forwards;
                    }

                    .achievement-light-effect:hover {
                        box-shadow: 
                            0 0 30px rgba(168, 85, 247, 0.2),
                            inset 0 0 15px rgba(168, 85, 247, 0.1);
                        border-color: rgba(168, 85, 247, 0.4);
                        background: rgba(15, 23, 42, 0.7);
                    }

                    `}
            </style>

            {/* Header / Top Bar */}
            <div className="h-20 bg-[var(--bg-deep)]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-50 relative">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            if (window.innerWidth >= 1024) {
                                setSidebarOpen(!sidebarOpen);
                            } else {
                                setIsMobileSidebarOpen(true);
                            }
                        }}
                        className={`p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center`}
                    >
                        {sidebarOpen ? <PanelLeftClose size={20} className="hidden md:block" /> : <PanelLeftOpen size={20} className="hidden md:block" />}
                        <Menu size={20} className="md:hidden" />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-outfit text-xl font-black tracking-tighter text-gradient">ELITES ARENA</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]"></div>
                            <span className="font-mono-premium text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Operational</span>
                        </div>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                    <div className="px-6 py-2 glass-panel rounded-full flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-[var(--accent)] shadow-[0_0_10px_rgba(0,243,255,0.4)]" />
                            <span className="font-mono-premium text-xs font-bold text-[var(--text-primary)]">
                                {currentTime.toLocaleTimeString([], { hour12: false })}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-white/10"></div>
                        <span className="font-mono-premium text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">
                            {currentTime.toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div 
                        onClick={() => setShowProfile(true)}
                        className="flex items-center gap-3 pr-4 border-r border-white/10 cursor-pointer group hover:opacity-80 transition-all"
                    >
                        <div className="flex flex-col items-end leading-tight">
                            <span className="font-outfit text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">{playerData.name}</span>
                            <span className="font-mono-premium text-[9px] text-[var(--accent)] opacity-80 uppercase tracking-wider">{playerData.role}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl accent-gradient p-0.5 shadow-lg shadow-cyan-600/20 group-hover:shadow-cyan-500/40 transition-all">
                            <div className="w-full h-full bg-[var(--surface)] rounded-[10px] flex items-center justify-center overflow-hidden">
                                <img 
                                    src={getAvatarUrl(playerData.avatar)} 
                                    onError={handleAvatarError} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        </div>
                    </div>
                                        <div className="relative">
                        <div 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border cursor-pointer group ${showNotifications ? 'border-[var(--accent)]' : 'border-white/5'}`}
                        >
                            <Bell size={18} className={notifications.some(n => !n.isRead) ? "text-[var(--accent)] animate-pulse" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"} />
                        </div>
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[var(--bg-deep)] animate-in zoom-in duration-300">
                                {notifications.filter(n => !n.isRead).length}
                            </span>
                        )}

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-4 w-80 glass-panel rounded-3xl overflow-hidden shadow-2xl z-[100] animate-in slide-in-from-top-4 duration-300">
                                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <span className="font-outfit text-sm font-bold text-white uppercase tracking-widest">Alert Center</span>
                                    <span className="font-mono-premium text-[10px] text-[var(--accent)] opacity-60">DRCT-092</span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <Info size={32} className="mx-auto text-white/10 mb-3" />
                                            <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-tighter">No active transmissions</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n._id} 
                                                onClick={() => !n.isRead && handleMarkRead(n._id)}
                                                className={`p-5 border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.03] relative overflow-hidden ${!n.isRead ? 'bg-[var(--accent)]/5' : ''}`}
                                            >
                                                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)]" />}
                                                <div className="flex gap-4">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'KEY_GRANT' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                                                        {n.type === 'KEY_GRANT' ? <Key size={14} /> : <Mail size={14} />}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-[11px] font-bold text-white leading-tight uppercase tracking-tight">{n.title}</p>
                                                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                                                        <span className="text-[9px] text-[var(--text-secondary)] opacity-50 font-mono-premium mt-1">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                                    <button className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">Clear All Logs</button>
                                </div>
                            </div>
                        )}
            </div>
            </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative z-10">

            {/* Sidebar */}
            <aside className={`z-[60] flex flex-col bg-[var(--bg-deep)]/80 backdrop-blur-xl transition-all duration-500 ease-in-out 
                ${isMobileSidebarOpen 
                    ? 'fixed inset-y-0 left-0 w-64 translate-x-0 shadow-2xl border-r border-white/10' 
                    : `fixed inset-y-0 left-0 -translate-x-full md:translate-x-0 md:relative ${sidebarOpen ? 'w-64 border-r border-white/5' : 'w-0 overflow-hidden border-none'}`
                }`}>
                {/* Sidebar Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                    <button 
                        onClick={() => setActiveNav('Overview')}
                        className={`flex items-center gap-3 overflow-hidden transition-all hover:opacity-80 active:scale-95 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div className="w-10 h-10 rounded-xl accent-gradient p-0.5 shadow-lg shadow-cyan-600/20">
                            <div className="w-full h-full bg-[var(--surface)] rounded-[10px] flex items-center justify-center overflow-hidden font-outfit font-black text-xs text-white">
                                EA
                            </div>
                        </div>
                        <span className="font-outfit text-xl font-black tracking-tighter text-gradient">ELITES ARENA</span>
                    </button>
                    <button 
                        onClick={() => {
                            if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
                            else setSidebarOpen(false);
                        }}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                        {isMobileSidebarOpen ? <X size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 flex flex-col gap-1.5 px-4 overflow-y-auto tactical-scrollbar">
                    {[
                        { id: 'Overview', icon: <Activity size={20} /> },
                        { id: 'Tournaments', icon: <Trophy size={20} /> },
                        { id: 'Book Slots', icon: <Target size={20} /> },
                        { id: 'Achievements', icon: <LayoutGrid size={20} /> },
                        { id: 'Support', icon: <Mail size={20} /> },
                        { id: 'Settings', icon: <Settings size={20} /> }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { console.log("DEBUG: Navigating to", item.id); setActiveNav(item.id); }}
                            className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-inter font-semibold transition-all duration-300 relative overflow-hidden ${activeNav === item.id
                                ? 'bg-cyan-600/10 text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                }`}
                        >
                            {activeNav === item.id && <div className="nav-indicator" />}
                            <span className={`transition-transform duration-300 group-hover:scale-110 shrink-0 ${activeNav === item.id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                                {item.icon}
                            </span>
                            {(sidebarOpen || isMobileSidebarOpen) && <span className="text-sm tracking-wide animate-in fade-in duration-300">{item.id}</span>}
                        </button>
                    ))}
                                        <div className="px-4 py-2 mt-4 mb-2">
                             <button
                                 onClick={() => setShowRequestModal(true)}
                                 className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-amber-600/10 text-amber-500 border border-amber-500/20 hover:bg-amber-600/20 transition-all font-bold group"
                             >
                                 <ShieldAlert size={20} className="group-hover:rotate-12 transition-transform shrink-0" />
                                 {(sidebarOpen || isMobileSidebarOpen) && <span className="text-xs uppercase tracking-widest font-black animate-in fade-in duration-300">Request Host</span>}
                             </button>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[var(--danger)] hover:bg-red-500/5 transition-all"
                        >
                            <LogOut size={20} className="shrink-0" />
                            {sidebarOpen && <span className="text-sm font-bold tracking-wide uppercase">Logout</span>}
                        </button>
                    </div>
                </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-12 relative tactical-scrollbar">

                                {activeNav === 'Overview' && (
                    <>
                        {/* 2. STATS OVERVIEW */}
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="premium-card rounded-3xl p-8 group hover:bg-white/[0.04]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
                                            {stat.icon}
                                        </div>
                                        <div className="flex gap-1 h-3">
                                            {[1,2,3].map(i => <div key={i} className="w-1 h-full bg-white/5 rounded-full" />)}
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <h3 className="text-3xl font-outfit font-black text-white">
                                            <CountUp end={stat.value} duration={2500} />
                                        </h3>
                                        {stat.suffix && <span className="text-slate-500 font-bold text-xs uppercase">{stat.suffix}</span>}
                                    </div>
                                    <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                                        {stat.label}
                                    </p>

                                    {/* Decorative Shimmer */}
                                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-[var(--accent)]/5 transition-all" />
                                </div>
                            ))}
                        </section>

                        {/* 3. MISSION PROFILE (Active Booking) */}
                        <div className="mb-6">
                            <h2 className="font-outfit font-black text-[10px] tracking-[0.4em] text-[var(--accent)] uppercase flex items-center gap-3">
                                <div className="w-8 h-px bg-cyan-500/20" />
                                Current Active Mission
                                <div className="w-8 h-px bg-cyan-500/20" />
                            </h2>
                        </div>
                        <section className="mb-16">
                            {tournaments.filter(t => t.participants?.some(p => (p.user?._id || p.user) === currentUserId)).length > 0 ? (
                                tournaments.filter(t => t.participants?.some(p => (p.user?._id || p.user) === currentUserId)).slice(-1).map(activeMission => (
                                    <div key={activeMission._id || activeMission.id} className="premium-card rounded-[2.5rem] overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,0.4)] border-cyan-500/10 hover:border-cyan-500/30 animate-in fade-in zoom-in duration-700">
                                        <div className="flex flex-col lg:flex-row">
                                            <div className="flex-1 p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/5 relative">
                                                <div className="absolute top-0 left-0 w-1 h-1/3 bg-[var(--accent)]" />
                                                
                                                <div className="flex items-center gap-4 mb-8">
                                                    <span className="px-3 py-1 bg-[var(--accent)] text-black text-[9px] font-black rounded-lg uppercase tracking-widest">{activeMission.game} Premier</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_12px_var(--accent-glow)]" />
                                                    <span className="font-mono-premium text-[9px] text-[var(--success)] font-bold uppercase tracking-widest">Deployment Ready</span>
                                                </div>

                                                <h3 className="text-4xl md:text-5xl font-outfit font-black text-white mb-6 uppercase tracking-tight leading-none">{activeMission.title || activeMission.name}</h3>
                                                
                                                <div className="grid grid-cols-2 gap-10">
                                                    <div className="space-y-1">
                                                        <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest">Mission Window</p>
                                                        <p className="font-outfit font-bold text-white text-lg">{activeMission.date} · 20:30 IST</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest">Assignment ID</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                            <p className="font-outfit font-bold text-[var(--accent)] text-lg">SLOT ALPHA-{(activeMission._id || activeMission.id || "0000").slice(-4)}07</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full lg:w-[450px] bg-white/[0.02] p-10 lg:p-14 flex flex-col items-center justify-center text-center relative group-hover:bg-white/[0.04] transition-all">
                                                <div className="mb-8">
                                                    <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-[0.4em] mb-3">Unit Identity</p>
                                                    <h4 className="text-3xl font-outfit font-black text-white tracking-widest uppercase">TEAM <span className="text-gradient">{playerData.name}</span></h4>
                                                </div>

                                                <div className="w-full p-8 bg-black/40 rounded-[2rem] border border-white/5 border-dashed mb-10 group-hover:border-[var(--accent)]/30 transition-all shadow-inner">
                                                    <p className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-3">Secure Access Key</p>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <code className={`font-mono-premium text-2xl font-black tracking-[0.2em] transition-all duration-500 ${revealKey ? 'text-[var(--accent)] blur-0 drop-shadow-[0_0_8px_var(--accent-glow)]' : 'text-slate-800 blur-md select-none'}`}>
                                                            EA-{(activeMission._id || activeMission.id || "0000").slice(-4)}F2A-B91C
                                                        </code>
                                                        <button 
                                                            onClick={() => setRevealKey(!revealKey)}
                                                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-slate-400 hover:text-white"
                                                        >
                                                            {revealKey ? <Eye size={18} /> : <Eye size={18} className="opacity-30" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 w-full">
                                                    <button 
                                                        onClick={() => setShowHypeCard(activeMission)}
                                                        className="flex-1 py-5 bg-[var(--accent)] text-black font-outfit font-black text-[10px] tracking-[0.3em] rounded-2xl shadow-xl shadow-cyan-600/20 hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all uppercase flex justify-center items-center gap-2"
                                                    >
                                                        <Eye size={16} /> Preview Hype
                                                    </button>
                                                    <button className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                                        <Download size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="premium-card rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center bg-white/[0.02] border-dashed border-white/10">
                                    <ShieldAlert size={48} className="text-slate-700 mb-6" />
                                    <h3 className="font-outfit font-black text-2xl text-slate-500 uppercase tracking-tighter mb-2">No Active Missions</h3>
                                    <p className="font-mono-premium text-[10px] text-slate-600 uppercase tracking-widest">Deploy a protocol from the list below to begin.</p>
                                </div>
                            )}
                        </section>

                        {/* 3.5 HOST IDENTITY CARD (If Approved) */}
                        {userRequests.filter(req => req.status === 'APPROVED' && req.keyGenerated).map((approvedReq) => (
                            <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                                <div className="premium-card rounded-[2.5rem] bg-emerald-500/5 border-emerald-500/20 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform">
                                        <ShieldAlert size={80} className="text-emerald-500" />
                                    </div>
                                    <div className="p-10 lg:p-14">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                <Crown size={24} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-mono-premium text-emerald-500 font-bold uppercase tracking-[0.4em]">Elite Deployment Authority</h4>
                                                <p className="text-white font-bold uppercase tracking-tight">Host Clearance: Level Alpha</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-12 items-center">
                                            <div className="flex-1">
                                                <h3 className="text-3xl font-outfit font-black text-white mb-4 uppercase tracking-tighter">Tactical Host Key</h3>
                                                <p className="text-slate-500 text-xs leading-relaxed max-w-md uppercase tracking-widest font-medium">Use this unique identifier to initialize and manage your sanctioned tournaments. This key identifies you as a verified Elite Arena operative.</p>
                                            </div>
                                            <div className="bg-black/60 p-8 rounded-3xl border border-emerald-500/10 min-w-[320px] text-center backdrop-blur-xl">
                                                <p className="font-mono-premium text-[9px] text-emerald-500/60 uppercase tracking-[0.4em] mb-4">Secure Key String</p>
                                                <div className="flex items-center justify-center gap-6">
                                                    <code className="text-3xl font-mono-premium font-black text-emerald-500 tracking-[0.2em] drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                                                        {approvedReq.keyGenerated}
                                                    </code>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(approvedReq.keyGenerated);
                                                            showNotify('Tactical Key copied to secure buffer');
                                                        }}
                                                        className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all active:scale-90 text-emerald-500 border border-emerald-500/20"
                                                    >
                                                        <Copy size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-emerald-500/20">
                                        <div className="h-full bg-emerald-500 w-full animate-pulse" />
                                    </div>
                                </div>
                            </section>
                        ))}

                        {/* 4. AVAILABLE DEPLOYMENTS (Tournaments) */}
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="font-outfit font-black text-[10px] tracking-[0.4em] text-white flex items-center gap-3 uppercase">
                                <div className="w-4 h-4 bg-[var(--accent)] rounded-sm" />
                                Available Deployments
                            </h2>
                            <button 
                                onClick={() => setActiveNav('Tournaments')}
                                className="font-mono-premium text-[10px] font-bold tracking-widest text-[var(--accent)] hover:translate-x-2 transition-transform uppercase"
                            >
                                Global Field View →
                            </button>
                        </div>
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
                            {tournaments.slice(0, 3).map((t) => {
                                const isBooked = t.participants?.some(p => (p.user?._id || p.user) === currentUserId);
                                return (
                                <div key={t._id || t.id} className="premium-card rounded-[2.5rem] overflow-hidden group hover:border-[var(--accent)]/30">
                                    <div className="p-8 space-y-8">
                                        <div className="flex justify-between items-start">
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-widest">{t.game}</span>
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-[var(--accent)] transition-colors">
                                                <Target size={16} />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-outfit font-black text-white mb-2 leading-tight uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">{t.title || t.name}</h3>
                                            <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest opacity-60 italic">Window: {t.date}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between font-mono-premium text-[9px] tracking-widest mb-1 uppercase">
                                                <span className="text-slate-500">Unit Capacity</span>
                                                <span className="text-[var(--accent)] font-bold">{`${t.slots?.booked || 0}/${t.slots?.total || 0}`}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full accent-gradient rounded-full w-2/3 group-hover:w-3/4 transition-all duration-1000 shadow-[0_0_10px_rgba(0,243,255,0.4)]" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group-hover:bg-cyan-500/5 transition-all">
                                                <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Fee</p>
                                                <p className="font-outfit font-black text-[var(--success)] text-sm">{t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group-hover:bg-cyan-500/5 transition-all">
                                                <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Yield</p>
                                                <p className="font-outfit font-black text-[var(--accent)] text-sm uppercase">{`₹${t.prizePool || t.prize}`}</p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleReserveSlot(t._id || t.id)}
                                            disabled={isBooked}
                                            className={`w-full py-5 border border-white/5 font-outfit font-black text-[10px] tracking-[0.3em] rounded-2xl transition-all uppercase shadow-lg ${
                                                isBooked 
                                                ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30 cursor-default' 
                                                : 'bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] group-hover:shadow-cyan-500/20'
                                            }`}
                                        >
                                            {isBooked ? 'Slot Secured' : 'Reserve Slot'}
                                        </button>
                                    </div>
                                </div>
                                );
                             })}
                        </section>
                    </>
                )}

                {activeNav === 'Achievements' && (() => {
                    const rarityColors = {
                        'Common': 'slate',
                        'Epic': 'purple',
                        'Legendary': 'amber'
                    };
                    const earnedByCat = (cat) => achievements.filter(a => a.category === cat && a.earned).length;
                    const totalByCat = (cat) => achievements.filter(a => a.category === cat).length;

                    return (
                        <div className="relative animate-in fade-in duration-500">
                            {/* Background Decor */}
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <LayoutGrid size={16} className="text-purple-500" />
                                        <span className="font-mono-premium text-[10px] text-purple-500 font-bold uppercase tracking-[0.4em]">Merit Repository</span>
                                    </div>
                                    <h1 className="font-outfit font-black text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none mb-4">
                                        Tactical Vault
                                    </h1>
                                    <p className="font-inter text-slate-400 max-w-xl text-sm leading-relaxed">
                                        Review your established legacy within the arena. Each badge represents a synchronized operational success or a milestone in your deployment history.
                                    </p>
                                </div>

                                <div className="flex items-center gap-8 px-8 py-6 glass-panel rounded-[2.5rem] border-white/5">
                                    <div className="text-center">
                                        <p className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-widest mb-1">Total Merits</p>
                                        <p className="font-outfit font-black text-white text-3xl leading-none">
                                            {achievements.filter(a => a.earned).length}<span className="text-slate-600 text-lg">/{achievements.length}</span>
                                        </p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="text-center">
                                        <p className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-widest mb-1">Mastery Sync</p>
                                        <p className="font-outfit font-black text-purple-500 text-3xl leading-none">
                                            {Math.round((achievements.filter(a => a.earned).length / (achievements.length || 1)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 relative z-10">
                                {['Combat', 'Rank', 'Skill', 'Social'].map(cat => (
                                    <div key={cat} className="premium-card rounded-3xl p-6 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest font-bold">{cat} Sector</span>
                                            <span className="font-outfit font-bold text-white text-sm">{earnedByCat(cat)}/{totalByCat(cat)}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-1000" 
                                                style={{ width: `${(earnedByCat(cat) / (totalByCat(cat) || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
                                {achievements.map((item) => {
                                    const isSelected = selectedAchievement?.id === item.id;
                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => setSelectedAchievement(isSelected ? null : item)}
                                            className={`premium-card achievement-light-effect rounded-[2.5rem] overflow-hidden group cursor-pointer transition-all duration-500 
                                                ${isSelected ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_40px_rgba(168,85,247,0.1)] scale-[1.02]' : 'hover:border-white/10'}
                                                ${!item.earned ? 'opacity-60' : ''}`}
                                        >
                                            <div className="p-8 space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest 
                                                        ${item.rarity === 'Legendary' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 
                                                          item.rarity === 'Epic' ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' : 
                                                          'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                                                        {item.rarity}
                                                    </div>
                                                    <span className="font-mono-premium text-[8px] text-slate-600 uppercase tracking-widest font-bold">{item.category}</span>
                                                </div>

                                                <div className="flex justify-center py-4">
                                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl relative
                                                        ${item.earned ? 'bg-white/5 shadow-inner' : 'grayscale opacity-40'}`}>
                                                        <span className={item.earned ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : ""}>{item.emoji}</span>
                                                        {item.earned && (
                                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent)] rounded-full border-4 border-[#0F172A] flex items-center justify-center">
                                                                <CheckCircle2 size={10} className="text-black" />
                                                            </div>
                                                        )}
                                                        {!item.earned && (
                                                            <ShieldAlert size={20} className="text-slate-800" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-center">
                                                    <h3 className="font-outfit font-black text-xl text-white uppercase tracking-tight mb-1 group-hover:text-purple-400 transition-colors">{item.name}</h3>
                                                    <p className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-widest">
                                                        {item.earned ? `Unlocked ${item.date}` : 'Deployment Required'}
                                                    </p>
                                                </div>

                                                <div className={`overflow-hidden transition-all duration-500 ${isSelected ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                                        <p className="text-[11px] text-slate-400 leading-relaxed text-center italic">
                                                            "${item.description}"
                                                        </p>
                                                        {!item.earned && (
                                                            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                                                                <p className="font-mono-premium text-[8px] text-slate-600 uppercase tracking-widest mb-1">Protocol</p>
                                                                <p className="font-outfit font-bold text-xs text-white">{item.requirement}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex justify-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isSelected ? 'rotate-180 bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-600'}`}>
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}

                {activeNav === 'Tournaments' && (
                    <div className="relative duration-500">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy size={16} className="text-[var(--accent)]" />
                                    <span className="font-mono-premium text-[10px] text-[var(--accent)] font-bold uppercase tracking-[0.4em]">Global Field</span>
                                </div>
                                <h1 className="font-outfit font-black text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none mb-4">
                                    Tournaments
                                </h1>
                                <p className="font-inter text-slate-400 max-w-xl text-sm leading-relaxed">
                                    Deploy into tactical arenas across the globe. Secure superior ranking and high-yield bounties.
                                </p>
                            </div>

                            {/* Tactical Tabs */}
                            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                                {[
                                    { id: 'ALL', label: 'All Deployments' },
                                    { id: 'BOOKED', label: 'My Bookings' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setTournamentTab(tab.id)}
                                        className={`px-8 py-3 rounded-xl font-outfit font-bold text-xs uppercase tracking-widest transition-all ${
                                            tournamentTab === tab.id 
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4 relative z-30">
                            <div className="flex-1 relative group">
                                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--accent)] transition-colors pointer-events-none" />
                                <input 
                                    type="text" 
                                    placeholder="Search specific engagements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-14 py-5 font-mono-premium text-xs text-white uppercase tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-[var(--accent)]/50 focus:bg-white/5 transition-all shadow-inner"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-8 py-5 border rounded-2xl flex items-center justify-center gap-3 font-mono-premium text-xs font-bold uppercase tracking-widest transition-all ${
                                    showFilters 
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30' 
                                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5'
                                }`}
                            >
                                <Filter size={16} /> Filters {(filterGame !== 'ALL' || filterFee !== 'ALL') && <span className="w-2 h-2 rounded-full bg-[var(--accent)] ml-1" />}
                            </button>
                        </div>

                        {/* Expandable Filter Box */}
                        <div className={`grid transition-all duration-500 ease-in-out ${showFilters ? 'grid-rows-[1fr] opacity-100 mb-12' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
                            <div className="overflow-hidden">
                                <div className="p-6 glass-panel rounded-[2rem] border border-white/10 relative z-20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Protocol (Game)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['ALL', 'VALORANT', 'BGMI', 'FREEFIRE'].map(game => (
                                                    <button
                                                        key={game}
                                                        onClick={() => setFilterGame(game)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold font-inter uppercase tracking-wide transition-all ${
                                                            filterGame === game
                                                            ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                                                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        {game}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Entry Class (Fee)</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['ALL', 'FREE', 'PAID'].map(fee => (
                                                    <button
                                                        key={fee}
                                                        onClick={() => setFilterFee(fee)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold font-inter uppercase tracking-wide transition-all ${
                                                            filterFee === fee
                                                            ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                                                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        {fee}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                            {tournaments
                                .filter(t => tournamentTab === 'ALL' || t.participants?.some(p => (p.user?._id || p.user) === currentUserId))
                                .filter(t => {
                                    const title = t.title || t.name || '';
                                    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
                                    const matchesGame = filterGame === 'ALL' || t.game === filterGame;
                                    const matchesFee = filterFee === 'ALL' || (filterFee === 'FREE' ? t.entryFee === 0 : t.entryFee > 0);
                                    return matchesSearch && matchesGame && matchesFee;
                                })
                                .map((t) => {
                                    const isBooked = t.participants?.some(p => (p.user?._id || p.user) === currentUserId);
                                    return (
                                        <div key={t._id || t.id} className="premium-card rounded-[2.5rem] overflow-hidden group hover:border-[var(--accent)]/30 transition-all duration-500">
                                            <div className="p-8 space-y-8">
                                                <div className="flex justify-between items-start">
                                                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-widest">{t.game}</span>
                                                    <div className="flex gap-2">
                                                        {isBooked && <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black rounded uppercase">Booked</div>}
                                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-[var(--accent)] transition-colors">
                                                            <Target size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-2xl font-outfit font-black text-white mb-2 leading-tight uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">{t.title || t.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} className="text-slate-600" />
                                                        <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest">{t.date}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group-hover:bg-cyan-500/5 transition-all">
                                                        <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Entry</p>
                                                        <p className="font-outfit font-black text-white text-sm">{t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}</p>
                                                    </div>
                                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group-hover:bg-cyan-500/5 transition-all">
                                                        <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Bounty</p>
                                                        <p className="font-outfit font-black text-[var(--accent)] text-sm uppercase">{`₹${t.prizePool || t.prize}`}</p>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => handleReserveSlot(t._id || t.id)}
                                                    disabled={isBooked}
                                                    className={`w-full py-5 border border-white/5 font-outfit font-black text-[10px] tracking-[0.3em] rounded-2xl transition-all uppercase shadow-lg ${
                                                        isBooked 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 cursor-default' 
                                                        : 'bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)]'
                                                    }`}
                                                >
                                                    {isBooked ? 'Slot Secured' : 'Reserve Slot'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {activeNav === 'Settings' && (
                    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Settings size={16} className="text-amber-500" />
                                    <span className="font-mono-premium text-[10px] text-amber-500 font-bold uppercase tracking-[0.4em]">Configuration Terminal</span>
                                </div>
                                <h1 className="font-outfit font-black text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none mb-4">
                                    Settings
                                </h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="premium-card rounded-[2.5rem] p-10">
                                    <h3 className="font-outfit font-black text-xl text-white uppercase tracking-widest mb-8 flex items-center gap-4">
                                        <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                        Interface Synchronization
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest font-bold">Theme Protocol</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['cyan', 'red', 'gold', 'purple'].map(theme => (
                                                    <button 
                                                        key={theme}
                                                        onClick={() => setSettings({...settings, theme})}
                                                        className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${settings.theme === theme ? 'bg-white/10 border-amber-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full ${
                                                            theme === 'cyan' ? 'bg-cyan-500' :
                                                            theme === 'red' ? 'bg-red-500' :
                                                            theme === 'gold' ? 'bg-amber-500' : 'bg-purple-500'
                                                        }`} />
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">{theme}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-outfit font-bold text-white text-sm">Visual Scanlines</p>
                                                    <p className="text-[10px] text-slate-500">CRT terminal emulation overlay</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSettings({...settings, scanlines: !settings.scanlines})}
                                                    className={`w-14 h-8 rounded-full relative transition-all ${settings.scanlines ? 'bg-amber-500' : 'bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.scanlines ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-outfit font-bold text-white text-sm">High Fidelity</p>
                                                    <p className="text-[10px] text-slate-500">Maximum bloom and particle effects</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSettings({...settings, highFidelity: !settings.highFidelity})}
                                                    className={`w-14 h-8 rounded-full relative transition-all ${settings.highFidelity ? 'bg-amber-500' : 'bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.highFidelity ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="premium-card rounded-[2.5rem] p-10 border-amber-500/20">
                                    <h3 className="font-outfit font-black text-xl text-white uppercase tracking-widest mb-8">Data Vault</h3>
                                    <button 
                                        onClick={() => {
                                            localStorage.clear();
                                            window.location.reload();
                                        }}
                                        className="w-full py-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-outfit font-black text-[10px] tracking-[0.4em] rounded-2xl hover:bg-rose-500 hover:text-white transition-all uppercase"
                                    >
                                        Wipe Cache
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button 
                                onClick={() => {
                                    localStorage.setItem('elite_settings', JSON.stringify(settings));
                                    showNotify("CONFIG SAVED TO VAULT", "success");
                                }}
                                className="px-12 py-5 bg-amber-500 text-black font-outfit font-black text-xs tracking-[0.4em] rounded-2xl shadow-xl shadow-amber-600/30 hover:bg-amber-400 hover:scale-[1.05] active:scale-95 transition-all uppercase"
                            >
                                Persist Changes
                            </button>
                        </div>
                    </div>
                )}

                {activeNav === "Book Slots" && (() => {
                    const bookedMatches = tournaments.filter(t => t.participants?.some(p => (p.user?._id || p.user) === currentUserId));

                    return (
                        <div className="relative animate-in fade-in duration-500">
                            {/* Background Decor */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar size={16} className="text-emerald-500" />
                                        <span className="font-mono-premium text-[10px] text-emerald-500 font-bold uppercase tracking-[0.4em]">Reservation Manifest</span>
                                    </div>
                                    <h1 className="font-outfit font-black text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none mb-4">
                                        Booked Slots
                                    </h1>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                                {bookedMatches.length > 0 ? (
                                    bookedMatches.map((t) => (
                                        <div key={t._id || t.id} className="premium-card rounded-[2.5rem] overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                                            <div className="p-8 space-y-8">
                                                <div className="flex justify-between items-start">
                                                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black rounded uppercase">Active Reserve</span>
                                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-outfit font-black text-white mb-2 leading-tight uppercase tracking-tight">{t.title || t.name}</h3>
                                                    <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest">{t.date}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                                    <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1 text-center">Deployment ID</p>
                                                    <p className="font-outfit font-bold text-white text-center tracking-widest uppercase">EA-{(t._id || t.id).slice(-6)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center glass-panel rounded-[3rem] border-dashed border-white/10">
                                        <Calendar size={48} className="text-slate-800 mb-6" />
                                        <h3 className="font-outfit font-black text-2xl text-slate-600 uppercase tracking-tighter mb-2">No Active Bookings</h3>
                                        <p className="font-mono-premium text-[10px] text-slate-700 uppercase tracking-widest">Explore the Global Field to secure your first slot.</p>
                                        <button 
                                            onClick={() => setActiveNav('Tournaments')}
                                            className="mt-8 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            View Tournaments
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}



                {activeNav === 'Support' && (
                    <div className="h-full flex flex-col relative z-20 animate-in fade-in duration-500">
                        {/* Chat Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
                            <div className="min-w-0">
                                <h1 className="font-outfit font-black text-3xl md:text-4xl text-white uppercase tracking-tighter mb-2 truncate">Support Center</h1>
                                <p className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-widest font-bold opacity-60">Designated Recipient: Global Support Overseer • EA-SUP-SYNC-01</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-5 py-2 glass-panel rounded-full border-[var(--accent)]/20 animate-pulse whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                                        <span className="font-mono text-[10px] text-white uppercase tracking-widest">Overseer Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Window */}
                        <div className="flex-1 glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border-white/5 shadow-2xl relative">
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-8 tactical-scrollbar" id="chat-scroll">
                                {supportMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <Mail size={48} className="mb-6" />
                                        <p className="font-outfit font-black text-xl uppercase tracking-widest mb-2">No Active Logs</p>
                                        <p className="font-mono text-[10px] uppercase tracking-widest">Initiate contact with Admin Panel</p>
                                    </div>
                                ) : (
                                    supportMessages.map((msg, i) => (
                                        <div key={msg._id || i} className={`flex ${msg.senderRole === 'ADMIN' ? 'justify-start' : 'justify-end'}`}>
                                            <div className="max-w-[80%] flex flex-col gap-2">
                                                <div className={`p-6 rounded-3xl font-inter text-sm leading-relaxed shadow-xl ${
                                                    msg.senderRole === 'ADMIN' 
                                                    ? 'bg-white/5 border border-white/10 text-white rounded-tl-none' 
                                                    : 'accent-gradient text-white rounded-tr-none shadow-cyan-500/10'
                                                }`}>
                                                    {msg.message}
                                                </div>
                                                <div className={`flex items-center gap-2 px-2 ${msg.senderRole === 'ADMIN' ? 'justify-start' : 'justify-end'}`}>
                                                    <span className="font-mono text-[9px] text-white/30 uppercase">
                                                        {msg.createdAt && !isNaN(new Date(msg.createdAt)) 
                                                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                            : 'Just now'}
                                                    </span>
                                                    {msg.senderRole === 'ADMIN' && <span className="font-mono text-[9px] text-[var(--accent)] uppercase font-bold tracking-tighter">Admin</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-8 bg-black/40 border-t border-white/5">
                                <form onSubmit={handleSendSupportMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={supportInput}
                                        onChange={(e) => setSupportInput(e.target.value)}
                                        placeholder="Transmit message to overseers..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all font-inter"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isSendingMessage || !supportInput.trim()}
                                        className="px-10 py-4 accent-gradient text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSendingMessage ? <Loader2 size={18} className="animate-spin mx-auto" /> : <Send size={18} className="mx-auto" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {/* PLAYER IDENTITY MODAL */}
            {showProfile && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setShowProfile(false)} />
                    <div className="relative w-full max-w-4xl glass-panel rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[var(--accent)]/20">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-2/5 p-12 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-center text-center">
                                <div className="relative mb-8 group">
                                    <div className="absolute inset-[-20px] border border-[var(--accent)]/10 rounded-full animate-rotate-slow" />
                                    <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-rotate-slow [animation-direction:reverse] [animation-duration:30s]" />
                                    <div className={`w-48 h-48 rounded-[3rem] p-1 relative z-10 shadow-2xl transition-all duration-500 overflow-hidden ${FRAMES.find(f => f.id === playerData.frame)?.border || 'border-white/10'}`}>
                                        <div className="w-full h-full bg-[var(--surface)] rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                                            <img 
                                                src={getAvatarUrl(playerData.avatar)} 
                                                onError={handleAvatarError}
                                                alt="Avatar" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setModalTab(modalTab === 'Profile' ? 'Identity' : 'Profile')}
                                        className="absolute bottom-2 -right-2 w-12 h-12 bg-[var(--accent)] text-black rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-110 active:scale-90 transition-all z-20"
                                        title={modalTab === 'Profile' ? "Change Identity" : "View profile"}
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                </div>
                                <h4 className="font-outfit font-black text-2xl text-white uppercase tracking-tight mb-1">{playerData.name}</h4>
                                <p className="font-mono-premium text-[10px] text-[var(--accent)] uppercase tracking-[0.3em] mb-6 font-bold">{playerData.role}</p>
                                <div className="w-full space-y-3">
                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center">
                                        <span className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-widest">Global Rank</span>
                                        <span className="font-outfit font-black text-white text-lg">#{playerData.rank}</span>
                                    </div>
                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center">
                                        <span className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-widest">Sector</span>
                                        <span className="font-outfit font-black text-white text-lg">{playerData.sector}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-12 overflow-y-auto tactical-scrollbar">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <div className="flex gap-4 mb-2">
                                            {['Profile', 'Identity'].map(tab => (
                                                <button key={tab} onClick={() => setModalTab(tab)} className={`font-mono-premium text-[10px] uppercase tracking-[0.3em] font-black pb-1 border-b-2 transition-all ${modalTab === tab ? 'text-[var(--accent)] border-[var(--accent)]' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                        <h2 className="font-outfit font-black text-3xl text-white uppercase tracking-tighter">Identity Vault</h2>
                                    </div>
                                    <button onClick={() => setShowProfile(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                                {modalTab === 'Profile' ? (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="space-y-3">
                                            <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Tactical Alias</label>
                                            <div className="relative group">
                                                <input type="text" value={playerData.name} onChange={(e) => setPlayerData({...playerData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-outfit font-bold text-white focus:outline-none focus:border-[var(--accent)]/50 transition-all" />
                                                <Edit2 size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-[var(--accent)]" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Deployment Sector</label>
                                                <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-outfit font-bold text-slate-400 text-sm">{playerData.sector}</div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold">Registry Date</label>
                                                <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-outfit font-bold text-slate-400 text-sm">{playerData.joinDate}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div className="space-y-4">
                                            <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold block mb-4">Tactical Avatar Selection</label>
                                            <div className="grid grid-cols-5 gap-3 max-h-[220px] overflow-y-auto tactical-scrollbar p-1">
                                                {AVATARS.map(avatar => (
                                                    <button 
                                                        key={avatar} 
                                                        onClick={() => setPlayerData({...playerData, avatar})} 
                                                        className={`aspect-square rounded-xl border-2 overflow-hidden transition-all hover:scale-105 active:scale-95 ${playerData.avatar === avatar ? 'border-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]' : 'border-white/5 hover:border-white/20'}`}
                                                    >
                                                        <img 
                                                            src={getAvatarUrl(avatar)} 
                                                            onError={handleAvatarError} 
                                                            alt={avatar} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-4">
                                            <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold block mb-4">Select Tactical Banner</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {BANNERS.map(banner => (
                                                    <button key={banner.id} onClick={() => setPlayerData({...playerData, banner: banner.id})} className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${playerData.banner === banner.id ? 'border-[var(--accent)] bg-white/5' : 'border-white/5 bg-black/40 hover:border-white/20'}`}>
                                                        <div className={`absolute inset-0 bg-gradient-to-r opacity-10 ${banner.color}`} />
                                                        <div className="flex items-center gap-3 relative z-10">
                                                            <div className={`p-2 rounded-lg ${playerData.banner === banner.id ? 'bg-[var(--accent)] text-black' : 'bg-white/5 text-slate-400'}`}>{banner.icon}</div>
                                                            <span className={`font-outfit font-bold text-sm ${playerData.banner === banner.id ? 'text-white' : 'text-slate-400'}`}>{banner.name}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-4">
                                            <label className="font-mono-premium text-[9px] text-slate-500 uppercase tracking-[0.3em] font-bold block mb-4">Neuro-Sync Frame</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {FRAMES.map(frame => (
                                                    <button key={frame.id} onClick={() => setPlayerData({...playerData, frame: frame.id})} className={`p-4 rounded-2xl border transition-all text-center ${playerData.frame === frame.id ? 'border-[var(--accent)] bg-white/5' : 'border-white/5 bg-black/40 hover:border-white/20'}`}>
                                                        <span className={`font-outfit font-bold text-xs block mb-2 ${playerData.frame === frame.id ? 'text-[var(--accent)]' : 'text-slate-500'}`}>{frame.name}</span>
                                                        <div className={`w-12 h-12 mx-auto rounded-xl border-2 ${frame.border} bg-[#0a1220]`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-8 mt-4 border-t border-white/5 flex gap-4">
                                    <button onClick={() => setShowProfile(false)} className="flex-1 py-5 rounded-2xl border border-white/5 font-outfit font-black text-[10px] tracking-[0.3em] text-slate-500 hover:text-white hover:bg-white/5 transition-all uppercase">Abort</button>
                                    <button onClick={handleSyncProfile} className="flex-[2] py-5 rounded-2xl bg-[var(--accent)] text-black font-outfit font-black text-[10px] tracking-[0.3em] shadow-xl shadow-cyan-600/20 hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all uppercase">Sync Profile</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HYPE CARD MODAL */}
            {showHypeCard && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setShowHypeCard(null)} />
                    <div className="relative flex flex-col items-center">
                        <div className="absolute -right-20 top-0 flex-col gap-4 hidden lg:flex">
                            <button className="w-12 h-12 bg-[var(--accent)] text-black rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                                <Download size={20} />
                            </button>
                            <button className="w-12 h-12 bg-white/10 text-white border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                                <Share2 size={20} />
                            </button>
                            <button onClick={() => setShowHypeCard(null)} className="w-12 h-12 bg-white/5 text-slate-400 border border-white/10 rounded-2xl flex items-center justify-center hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all mt-4">
                                <X size={20} />
                            </button>
                        </div>
                        <div id="hype-card-render" className={`w-[350px] md:w-[450px] aspect-[4/5] bg-[#050810] rounded-[2rem] border-[3px] overflow-hidden relative shadow-2xl ${FRAMES.find(f => f.id === playerData.frame)?.border || 'border-cyan-500/30 shadow-[0_0_100px_rgba(0,243,255,0.15)]'}`}>
                            <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-br opacity-20 ${BANNERS.find(b => b.id === playerData.banner)?.color || 'from-cyan-600 to-blue-600'}`} />
                            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#050810]/50 to-[#050810] pointer-events-none" />
                            <div className="relative z-10 p-8 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
                                        <span className="font-mono-premium text-[8px] text-[var(--accent)] uppercase tracking-[0.4em] font-bold">Elite Operative</span>
                                    </div>
                                    <h2 className="font-outfit font-black text-2xl text-white uppercase tracking-tight">{showHypeCard.game}</h2>
                                </div>
                                <div className="text-white/20">{BANNERS.find(b => b.id === playerData.banner)?.icon || <ShieldAlert size={32} strokeWidth={1.5} />}</div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[280px] h-[280px] flex justify-center items-center">
                                <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                                <div className="absolute inset-4 border border-dashed border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                                <div className={`w-[200px] h-[200px] rounded-[3rem] p-[3px] relative z-20 ${FRAMES.find(f => f.id === playerData.frame)?.border || 'border-cyan-500/30'}`}>
                                    <div className="w-full h-full bg-[#0F172A] rounded-[2.8rem] overflow-hidden relative z-10">
                                        <img 
                                            src={getAvatarUrl(playerData.avatar)} 
                                            onError={handleAvatarError}
                                            className="w-full h-full object-cover scale-110" 
                                            alt="Avatar" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full p-8 z-10 bg-gradient-to-t from-[#050810] via-[#050810]/95 to-transparent">
                                <div className="text-center mb-6">
                                    <h1 className="font-outfit font-black text-5xl md:text-6xl text-white uppercase tracking-tighter mb-1">{playerData.name}</h1>
                                    <p className="font-mono-premium text-[12px] text-[var(--accent)] uppercase tracking-[0.4em] font-bold">LVL {playerData.level} • {playerData.role}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                                    <div className="text-center">
                                        <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Rank</p>
                                        <p className="font-outfit font-bold text-white text-xl">#{playerData.rank}</p>
                                    </div>
                                    <div className="text-center border-l border-r border-white/5 px-2">
                                        <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Mission</p>
                                        <p className="font-outfit text-[var(--accent)] text-[10px] font-black truncate">{showHypeCard.name}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Sector</p>
                                        <p className="font-outfit font-bold text-white text-xl">{playerData.sector}</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-between items-end opacity-20">
                                    <div className="flex gap-1 h-6">
                                        {[1,2,0.5,3,1,0.5,2,1.5,4].map((w,i) => (
                                            <div key={i} style={{width: `${w*2}px`}} className="h-full bg-white ml-[0.5px]" />
                                        ))}
                                    </div>
                                    <span className="font-mono-premium text-[8px] text-white font-bold tracking-widest uppercase">EA-{showHypeCard.id}-PROTOCOL</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowHypeCard(null)} className="mt-6 py-4 px-8 bg-white/5 border border-white/10 text-white font-mono-premium text-xs uppercase tracking-widest rounded-xl lg:hidden active:bg-white/10 transition-all">
                            Close Preview
                        </button>
                    </div>
                </div>
            )}

            {/* Tactical Notification Toast */}
            {notification && (
                <div className={`fixed bottom-10 right-10 z-[200] px-6 py-4 glass-panel border animate-in slide-in-from-right duration-500 flex items-center gap-4 ${
                    notification.type === 'success' ? 'border-[var(--success)]/50' :
                    notification.type === 'danger' ? 'border-[var(--danger)]/50' : 'border-[var(--accent)]/50'
                }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse blur-[2px] ${
                        notification.type === 'success' ? 'bg-[var(--success)] shadow-[0_0_10px_var(--success)]' :
                        notification.type === 'danger' ? 'bg-[var(--danger)] shadow-[0_0_10px_var(--danger)]' : 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]'
                    }`} />
                    <span className="font-mono-premium text-[10px] font-bold text-white tracking-[0.2em] uppercase">{notification.message}</span>
                </div>
            )}

            {/* Boot Loader */}
            {loading && (
                <div className="fixed inset-0 z-[300] bg-[var(--bg-deep)] flex flex-col items-center justify-center gap-6">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[var(--accent)] rounded-full border-t-transparent animate-spin" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-outfit font-black text-xl tracking-tighter text-gradient animate-pulse">BOOTING ELITE_ARENA v4.0</span>
                        <span className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-[0.4em]">Establishing Neural Sync</span>
                    </div>
                </div>
            )}

            {/* Host Access Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-xl glass-panel rounded-[3rem] p-10 relative overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-cyan-500/5 rotate-45 blur-[80px]" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                        <ShieldAlert size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h2 className="font-outfit text-2xl font-black text-white uppercase tracking-tight">Petition for Host Access</h2>
                                        <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest">Protocol: EA-AUTH-HOST-REQ</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowRequestModal(false)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitRequest} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="font-mono-premium text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Message to Overseers</label>
                                    <textarea
                                        value={requestMessage}
                                        onChange={(e) => setRequestMessage(e.target.value)}
                                        placeholder="Briefly describe your hosting experience or tournament plans..."
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm focus:border-amber-500 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 resize-none"
                                        required
                                    />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                                        Abort
                                    </button>
                                    <button type="submit" disabled={requestLoading || !requestMessage.trim()} className="flex-1 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50">
                                        {requestLoading ? (
                                            <div className="flex items-center justify-center gap-3"><Loader2 size={16} className="animate-spin" /> Transmitting...</div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3"><Send size={16} /> Submit Petition</div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default PlayerDashboard;

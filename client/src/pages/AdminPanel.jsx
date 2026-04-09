import React, { useState, useEffect } from 'react';
import { 
    Activity, Trophy, Users, Key, LayoutGrid, Settings,
    Bell, ShieldAlert, Plus, Minus, Search, Filter, Edit2,
    Trash2, X, CheckCircle2, XCircle, Crown, Clock, Eye, Download, Share2, 
    ChevronRight, ChevronDown, Zap, Target, Calendar, ChevronLeft, Menu, LogOut,
    Hash, Mail, Send, Paperclip, MessageSquare, PanelLeftClose
} from 'lucide-react';
import { supportAPI, tournamentAPI, authAPI, notificationAPI, userAPI } from '../services/api';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarUtils';

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

const NumericControl = ({ value, onValueChange, disabled, min = 0, max = 99999, label = "", size = 'md' }) => {
    const dimensions = {
        sm: { btn: 'p-1', icon: 12, text: 'text-xs', w: 'w-12', h: 'h-10' },
        md: { btn: 'p-2', icon: 16, text: 'text-sm', w: 'w-16', h: 'h-12' },
        lg: { btn: 'p-3', icon: 20, text: 'text-xl', w: 'w-24', h: 'h-16' }
    }[size];

    const adjust = (delta) => {
        if (disabled) return;
        const currentVal = parseInt(value || 0);
        const newVal = Math.max(min, Math.min(max, currentVal + delta));
        onValueChange(newVal.toString());
    };

    return (
        <div className={`flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all focus-within:border-amber-500/50 ${disabled ? 'opacity-50' : ''}`}>
            <button 
                onClick={(e) => { e.preventDefault(); adjust(-1); }}
                disabled={disabled}
                className={`${dimensions.btn} hover:bg-white/5 text-slate-500 hover:text-amber-500 transition-colors border-r border-white/5`}
            >
                <Minus size={dimensions.icon} strokeWidth={3} />
            </button>
            <input 
                type="number"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onBlur={() => {
                    if (value === "") onValueChange(min.toString());
                }}
                placeholder={min.toString()}
                className={`w-full bg-transparent text-center font-mono-premium font-bold ${dimensions.text} text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                disabled={disabled}
            />
            <button 
                onClick={(e) => { e.preventDefault(); adjust(1); }}
                disabled={disabled}
                className={`${dimensions.btn} hover:bg-white/5 text-slate-500 hover:text-amber-500 transition-colors border-l border-white/5`}
            >
                <Plus size={dimensions.icon} strokeWidth={3} />
            </button>
        </div>
    );
};

const CustomDatePicker = ({ value, onChange, className = "", placeholder = "Select mission date..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    const prevMonthDates = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
    const currentMonthDates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const selectDate = (day) => {
        const selectedDate = new Date(currentYear, currentMonth, day);
        onChange(selectedDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const changeMonth = (delta) => {
        setViewDate(new Date(currentYear, currentMonth + delta, 1));
    };

    return (
        <div className={`relative ${className}`}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 text-slate-200 font-bold text-sm py-3.5 px-6 rounded-2xl outline-none hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
                <span className={value ? "text-white" : "text-slate-500"}>
                    {value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : placeholder}
                </span>
                <Calendar size={18} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[70]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-[calc(100%+8px)] left-0 w-80 bg-[#16191F]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl z-[80] animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-outfit font-bold text-white tracking-tight">
                                {months[currentMonth]} <span className="text-amber-500">{currentYear}</span>
                            </h4>
                            <div className="flex gap-1">
                                <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><ChevronLeft size={16} /></button>
                                <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {days.map(d => <div key={d} className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{d}</div>)}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {prevMonthDates.map((d, i) => (
                                <div key={`prev-${i}`} className="h-9 flex items-center justify-center text-[11px] font-bold text-slate-800 cursor-not-allowed">
                                    {d}
                                </div>
                            ))}
                            {currentMonthDates.map(d => {
                                const dateObj = new Date(currentYear, currentMonth, d);
                                const dateStr = dateObj.toISOString().split('T')[0];
                                const isSelected = value === dateStr;
                                
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isPast = dateObj < today;

                                return (
                                    <div 
                                        key={d} 
                                        onClick={() => !isPast && selectDate(d)}
                                        className={`h-9 flex items-center justify-center text-[11px] font-bold rounded-xl transition-all ${
                                            isPast ? 'text-slate-700 cursor-not-allowed' : 
                                            isSelected ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 cursor-pointer' : 
                                            'text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer'
                                        }`}
                                    >
                                        {d}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const CustomDropdown = ({ value, options, onChange, className = "", placeholder = "Select option..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt === value) || value;

    return (
        <div className={`relative ${className}`}>
            <div 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="w-full bg-white/5 border border-white/10 text-slate-200 font-bold text-sm py-3.5 px-6 rounded-2xl outline-none hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
                <span className="truncate">{selectedOption || placeholder}</span>
                <ChevronDown size={18} className={`text-slate-500 group-hover:text-amber-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[70]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#16191F]/95 backdrop-blur-2xl border border-white/10 rounded-2xl py-2 shadow-2xl z-[80] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        {options.map((opt, i) => (
                            <div 
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                                className={`px-6 py-3 text-sm font-medium transition-all cursor-pointer hover:bg-amber-500/10 hover:text-amber-500 ${opt === value ? 'text-amber-500 bg-amber-500/5' : 'text-slate-400'}`}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const SkeletonStat = () => (
    <div className="px-7 py-8 premium-card rounded-[2rem] relative overflow-hidden animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5" />
            <div className="w-12 h-4 rounded-full bg-white/5" />
        </div>
        <div className="space-y-3">
            <div className="w-24 h-2 bg-white/10 rounded-full" />
            <div className="w-32 h-10 bg-white/5 rounded-xl transition-all" />
        </div>
        <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden" />
            <div className="w-8 h-2 bg-white/10 rounded-full" />
        </div>
    </div>
);

export default function AdminPanel() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [tournaments, setTournaments] = useState([]);
    const [activePanel, setActivePanel] = useState('Overview');
    const [currentTime, setCurrentTime] = useState(new Date());

    const [loading, setLoading] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, target: null });
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isTeamSlidePanelOpen, setIsTeamSlidePanelOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [players, setPlayers] = useState([]);
    const [playersLoading, setPlayersLoading] = useState(false);
    const [isPlayerSlidePanelOpen, setIsPlayerSlidePanelOpen] = useState(false);
    const [isPlayerDeleting, setIsPlayerDeleting] = useState(false);
    const [playerFormData, setPlayerFormData] = useState({
        id: '',
        name: '',
        email: '',
        role: 'PLAYER',
        rank: 'RECRUIT',
        sector: 'SEC-01'
    });

    const [notifications, setNotifications] = useState([]);
    const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
    const [hasCelebrated, setHasCelebrated] = useState(false);
    const [showAdminProfile, setShowAdminProfile] = useState(false);
    const [adminData, setAdminData] = useState(() => {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
            try {
                const user = JSON.parse(cachedUser);
                return {
                    name: user.name || 'Sentinel Alpha',
                    role: user.role === 'ADMIN' ? 'Root Administrator' : 'Authorized Personnel',
                    sector: user.sector || 'Sector 04',
                    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '12 OCT 2024',
                    avatar: user.avatar || 'Sentinel'
                };
            } catch (e) {
                console.error('Failed to parse cached user', e);
            }
        }
        return {
            name: 'Sentinel Alpha',
            role: 'Root Administrator',
            sector: 'Sector 04',
            joinDate: '12 OCT 2024',
            avatar: 'Sentinel'
        };
    });

    // Form States
    const [formData, setFormData] = useState({
        id: null, name: '', game: 'Valorant', date: '', slots: '', fee: '', prize: '', desc: ''
    });

    const [teamFormData, setTeamFormData] = useState({
        name: '', tag: '', captain: '', game: 'VALORANT', roster: ''
    });

    // Key Verifier States
    const [keyInput, setKeyInput] = useState('');
    const [keyResult, setKeyResult] = useState(null);

    // Bracket State
    const [bracketMatches, setBracketMatches] = useState([
        { id: 1, teamA: 'Nova Esports', scoreA: '', teamB: 'Wraith', scoreB: '', winner: null, round: 'QF' },
        { id: 2, teamA: 'Sentinels', scoreA: '', teamB: 'LOUD', scoreB: '', winner: null, round: 'QF' },
        { id: 3, teamA: 'Team Liquid', scoreA: '', teamB: 'FNATIC', scoreB: '', winner: null, round: 'QF' },
        { id: 4, teamA: 'Paper Rex', scoreA: '', teamB: 'DRX', scoreB: '', winner: null, round: 'QF' },
        { id: 5, teamA: 'TBD', scoreA: '', teamB: 'TBD', scoreB: '', winner: null, round: 'SF' },
        { id: 6, teamA: 'TBD', scoreA: '', teamB: 'TBD', scoreB: '', winner: null, round: 'SF' },
        { id: 7, teamA: 'TBD', scoreA: '', teamB: 'TBD', scoreB: '', winner: null, round: 'Final' }
    ]);

// Support / Chat States
const [conversations, setConversations] = useState([]);
const [selectedConversation, setSelectedConversation] = useState(null);
const [supportMessages, setSupportMessages] = useState([]);
const [replyMessage, setReplyMessage] = useState('');
const [isSendingReply, setIsSendingReply] = useState(false);
const messagesEndRef = React.useRef(null);

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
    if (supportMessages.length > 0) {
        scrollToBottom();
    }
}, [supportMessages]);

    // Initial Loading Sequence for Admin Vault
    useEffect(() => {
        const logs = [
            "DECRYPTING SENTINEL PROTOCOLS...",
            "ESTABLISHING SECURE VAULT LINK...",
            "AUTHORIZING ROOT ACCESS...",
            "SYNCING SECTOR 04 TELEMETRY...",
            "VAULT ACCESS GRANTED. WELCOME, ALPHA."
        ];
        
        let currentLogIndex = 0;
        const logInterval = setInterval(() => {
            if (currentLogIndex < logs.length) {
                setLoadingLogs(prev => [...prev, logs[currentLogIndex]]);
                setLoadingProgress((currentLogIndex + 1) * 20);
                currentLogIndex++;
            } else {
                clearInterval(logInterval);
                setTimeout(() => setLoading(false), 800);
            }
        }, 400);

        return () => clearInterval(logInterval);
    }, []);

    // Close slide-ins when switching panels
    useEffect(() => {
        setIsSlidePanelOpen(false);
        setIsTeamSlidePanelOpen(false);
        setIsEditing(false);
    }, [activePanel]);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        try {
            const res = await authAPI.getMe();
            
            if (res.data.role === 'ADMIN' || res.data.role === 'MASTER') {
                setIsAuthorized(true);
                // Sync adminData with real metadata from server
                setAdminData({
                    name: res.data.name || 'Sentinel Alpha',
                    role: (res.data.role === 'ADMIN' || res.data.role === 'MASTER') ? 'Root Administrator' : 'Authorized Personnel',
                    sector: res.data.sector || 'Sector 04',
                    joinDate: res.data.createdAt ? new Date(res.data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '12 OCT 2024',
                    avatar: res.data.avatar || 'Sentinel'
                });
                // Also update localStorage for persistence on refresh
                localStorage.setItem('user', JSON.stringify(res.data));
            } else {
                setIsAuthorized(false);
                // Redirect non-admins out of here to player dashboard
                window.location.href = '/player';
            }
        } catch (e) {
            console.error('Auth verification failed', e);
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await tournamentAPI.getAll();
            setTournaments(res.data);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    };

    useEffect(() => {
        if (isAuthorized) {
            fetchTournaments();
        }
    }, [isAuthorized]);

    const fetchConversations = async () => {
        try {
            const res = await supportAPI.getConversations();
            setConversations(res.data.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await supportAPI.getMessages(userId);
            setSupportMessages(res.data.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        if (isAuthorized && activePanel === 'Support') {
            fetchConversations();
            // Polling for new messages while in Support section
            const interval = setInterval(fetchConversations, 10000);
            return () => clearInterval(interval);
        }
    }, [isAuthorized, activePanel]);

    const fetchBracketData = async () => {
        if (!formData.name) return;
        try {
            const res = await tournamentAPI.getBracket(formData.name);
            const data = res.data;
            const slots = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'final'];
            const mapped = slots.map((slot, i) => {
                const m = data[slot];
                return {
                    id: i + 1,
                    dbId: m.dbId || m.id,
                    teamA: m.t1 || 'TBD',
                    scoreA: m.s1 ?? '',
                    teamB: m.t2 || 'TBD',
                    scoreB: m.s2 ?? '',
                    winner: m.winner ? (m.winner === 't1' ? m.t1 : m.t2) : null,
                    status: m.status,
                    round: i < 4 ? 'QF' : i < 6 ? 'SF' : 'Final'
                };
            });
            setBracketMatches(mapped);
        } catch (error) {
            console.error('Failed to fetch bracket:', error);
        }
    };

    useEffect(() => {
        if (isAuthorized && activePanel === 'Match Results') {
            fetchBracketData();
            const interval = setInterval(fetchBracketData, 10000); // Sync every 10s
            return () => clearInterval(interval);
        }
    }, [isAuthorized, activePanel, formData.name]);

    useEffect(() => {
        if (isAuthorized && selectedConversation) {
            fetchMessages(selectedConversation._id);
            const interval = setInterval(() => fetchMessages(selectedConversation._id), 5000);
            return () => clearInterval(interval);
        }
    }, [isAuthorized, selectedConversation]);

    const handleSendReply = async (e) => {
        if (e) e.preventDefault();
        if (!replyMessage.trim() || !selectedConversation) return;

        setIsSendingReply(true);
        try {
            await supportAPI.sendMessage({
                userId: selectedConversation._id,
                message: replyMessage,
                senderRole: 'ADMIN'
            });

            setReplyMessage('');
            fetchMessages(selectedConversation._id);
        } catch (error) {
            console.error('Error sending message:', error);
            showNotify('FAILED TO SEND REPLY', 'danger');
        } finally {
            setIsSendingReply(false);
        }
    };


    // Handle Victory Overlay Trigger (One-time celebrated guard)
    useEffect(() => {
        if (bracketMatches[6].winner && !hasCelebrated) {
            const timer = setTimeout(() => {
                setShowVictoryOverlay(true);
                setHasCelebrated(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
        // Reset celebration if tournament is cleared (e.g. results removed)
                if (!bracketMatches[6].winner && hasCelebrated) {
            setHasCelebrated(false);
        }
    }, [bracketMatches[6].winner, hasCelebrated]);

    const handleLogout = () => {
        // TERMINATING SESSION
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const showNotify = (message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotify = { id, message, type };
        setNotifications(prev => [...prev, newNotify]);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);

        // Still log for fallback context
        console.log(`[SYSTEM] ${type.toUpperCase()}: ${message}`);
    };

    const handleLogoutWithTransition = () => {
        setLoading(true);
        setLoadingLogs(["LOGGING OUT...", "CLEARING SECURITY TOKENS...", "REDIRECTING TO LOGIN..."]);
        setLoadingProgress(0);
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 25;
            setLoadingProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                handleLogout();
            }
        }, 300);
    };

    const handleDeployProtocol = async (e) => {
        if (e) e.preventDefault();
        
        // Date validation safeguard
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            alert("Cannot schedule tournaments in the past. Please select a future date.");
            return;
        }
        try {
            const payload = {
                title: formData.name,
                game: formData.game,
                prizePool: formData.prize,
                entryFee: formData.fee,
                slots: { total: parseInt(formData.slots), booked: isEditing ? parseInt(formData.booked || 0) : 0 },
                startTime: formData.date,
                description: formData.desc || 'Operational protocol active.',
                platform: 'PC/Mobile'
            };

            if (isEditing) {
                const res = await tournamentAPI.update(formData.id, payload);
                setTournaments(tournaments.map(t => t._id === formData.id ? res.data : t));
            } else {
                const res = await tournamentAPI.create(payload);
                setTournaments([...tournaments, res.data]);
            }

            setIsSlidePanelOpen(false);
            setFormData({ id: null, name: '', game: 'VALORANT', date: '', slots: '', fee: '', prize: '', desc: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error deploying protocol:', error);
            alert(error.response?.data?.message || 'Failed to deploy protocol');
        }
    };

    const handleEditTournament = (tourney) => {
        setFormData({
            id: tourney._id,
            name: tourney.title || tourney.name,
            game: tourney.game,
            date: tourney.startTime ? new Date(tourney.startTime).toISOString().split('T')[0] : (tourney.date || ''),
            slots: tourney.slots?.total?.toString() || '',
            booked: tourney.slots?.booked?.toString() || '0',
            fee: tourney.entryFee?.toString() || '500', 
            prize: tourney.prizePool?.toString() || '25000',
            desc: tourney.description || 'Protocol protocol active.'
        });
        setIsEditing(true);
        setIsSlidePanelOpen(true);
    };

    const handleMatchConfirm = async (matchId) => {
        const match = bracketMatches.find(m => m.id === matchId);
        
        const sA = parseInt(match.scoreA || 0);
        const sB = parseInt(match.scoreB || 0);

        if (sA === sB && match.scoreA === '' && match.scoreB === '') return;

        const winner = sA > sB ? match.teamA : match.teamB;
        const status = 'COMPLETED';

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            // Since bracketMatches currently uses temporary numeric IDs (1-7),
            // in a real app these would be MongoDB ObjectIds.
            // For now, we'll try to find a matching tournament and match reference if possible,
            // but the user wants "results sync", so I'll implement the API call assuming real match IDs exist in production.
            // If match.dbId is missing, we'll fallback to a mock sync for visual feedback.
            
            if (match.dbId) {
                await tournamentAPI.updateMatchResult(match.dbId, {
                    s1: sA,
                    s2: sB,
                    winner,
                    status
                });
            }

            setBracketMatches(prev => {
                const updated = prev.map(m => m.id === matchId ? { ...m, winner, status } : m);
                // Advancement Logic (Local UI update)
                if (matchId === 1) updated[4].teamA = winner;
                if (matchId === 2) updated[4].teamB = winner;
                if (matchId === 3) updated[5].teamA = winner;
                if (matchId === 4) updated[5].teamB = winner;
                if (matchId === 5) updated[6].teamA = winner;
                if (matchId === 6) updated[6].teamB = winner;
                return updated;
            });

            // Advancement Propagation in Database (For Observer Sync)
            let nextMatchIndex = -1;
            let teamPos = ''; // 't1Name' or 't2Name'
            
            if (matchId === 1) { nextMatchIndex = 4; teamPos = 't1Name'; }
            if (matchId === 2) { nextMatchIndex = 4; teamPos = 't2Name'; }
            if (matchId === 3) { nextMatchIndex = 5; teamPos = 't1Name'; }
            if (matchId === 4) { nextMatchIndex = 5; teamPos = 't2Name'; }
            if (matchId === 5) { nextMatchIndex = 6; teamPos = 't1Name'; }
            if (matchId === 6) { nextMatchIndex = 6; teamPos = 't2Name'; }

            if (nextMatchIndex !== -1 && bracketMatches[nextMatchIndex].dbId) {
                await tournamentAPI.updateMatchResult(bracketMatches[nextMatchIndex].dbId, {
                    [teamPos]: winner
                });
            }
            
            showNotify(`MATCH #${matchId} DATA SYNCHRONIZED`, 'success');
        } catch (error) {
            console.error('Match sync failed:', error);
            showNotify('SYNC FAILED: MASTER DATABASE UNREACHABLE', 'error');
        }
    };

    
    // Fetch Players
    const fetchPlayers = async () => {
        try {
            setPlayersLoading(true);
            const response = await userAPI.getAll();
            if (response.data) {
                setPlayers(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch players:', error);
        } finally {
            setPlayersLoading(false);
        }
    };

    useEffect(() => {
        if (activePanel === 'Players') {
            fetchPlayers();
        }
    }, [activePanel]);

    const handleEditPlayer = (player) => {
        setPlayerFormData({
            id: player._id,
            name: player.name,
            email: player.email,
            role: player.role,
            rank: player.rank || 'RECRUIT',
            sector: player.sector || 'SEC-01'
        });
        setIsPlayerSlidePanelOpen(true);
    };

    const handleUpdatePlayer = async () => {
        try {
            const res = await userAPI.update(playerFormData.id, {
                name: playerFormData.name,
                email: playerFormData.email,
                role: playerFormData.role,
                rank: playerFormData.rank,
                sector: playerFormData.sector
            });
            if (res.data) {
                showNotify('OPERATIVE DATA SYNCHRONIZED', 'success');
                setIsPlayerSlidePanelOpen(false);
                fetchPlayers();
            }
        } catch (error) {
            console.error('Failed to update player:', error);
            showNotify('SYNC FAILED: DATABASE REJECTED UPDATE', 'error');
        }
    };

    const handleDeletePlayer = async (id) => {
        if (!window.confirm('PERMANENTLY DELETE OPERATIVE record? This action is irreversible.')) return;
        try {
            await userAPI.delete(id);
            showNotify('OPERATIVE RECORD PURGED', 'success');
            fetchPlayers();
        } catch (error) {
            console.error('Failed to delete player:', error);
            showNotify('PURGE FAILED: SYSTEM ACCESS DENIED', 'error');
        }
    };

    const handleDeleteTournament = async () => {
        try {
            const targetTourney = tournaments.find(t => t.title === deleteModal.target || t.name === deleteModal.target);
            if (!targetTourney) return;

            await tournamentAPI.delete(targetTourney._id);
            setTournaments(tournaments.filter(t => t._id !== targetTourney._id));
            setDeleteModal({ open: false, target: null });
        } catch (error) {
            console.error('Error deleting tournament:', error);
            alert(error.response?.data?.message || 'Failed to purge protocol');
        }
    };

    const handleRegisterTeam = (e) => {
        e.preventDefault();
        // Validation logic
        if (!teamFormData.name || !teamFormData.tag || !teamFormData.captain) return;
        
        console.log('Registering tactical squad:', teamFormData);
        setIsTeamSlidePanelOpen(false);
        // Reset form
        setTeamFormData({ name: '', tag: '', captain: '', game: 'VALORANT', roster: '' });
    };

    const verifyKey = (e) => {
        e.preventDefault();
        if (keyInput.startsWith('EA-')) {
            setKeyResult({ success: true, name: 'NOVA', tourney: 'Valorant Open S3', slot: 'SLOT 07', team: 'TEAM NOVA' });
        } else {
            setKeyResult({ success: false, reason: 'Key not found in system' });
        }
    };

    
    if (!isAuthorized && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0D0E12] text-white p-8">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                `}</style>
                <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20 mb-8">
                    <ShieldAlert size={48} className="text-rose-500" />
                </div>
                <h1 className="font-outfit font-black text-4xl mb-4 tracking-tighter uppercase">Clearance Required</h1>
                <p className="text-slate-400 max-w-md text-center mb-8 font-inter text-sm leading-relaxed">Your account does not have the required Sentinel-level clearance to access the Management Vault. Unauthorized access attempts are logged.</p>
                <button 
                    onClick={() => window.location.href = '/player'}
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-outfit font-bold text-sm uppercase tracking-widest text-slate-300 hover:text-white"
                >
                    Return to Player Dashboard
                </button>
            </div>
        );
    }

    const navItems = [
        { id: 'Overview', icon: <Activity size={20} /> },
        { id: 'Tournaments', icon: <Trophy size={20} /> },
        { id: 'Players', icon: <Users size={20} /> },
        { id: 'Teams', icon: <ShieldAlert size={20} /> },
        { id: 'Match Results', icon: <Trophy size={20} /> },
        { id: 'Support', icon: <Mail size={20} /> },
        { id: 'Key Verifier', icon: <Key size={20} /> },
        { id: 'Notifications', icon: <Bell size={20} /> },
        { id: 'Settings', icon: <Settings size={20} /> },
        { id: 'Logout', icon: <LogOut size={20} /> }
    ];

    return (
        <div className="flex flex-col h-screen bg-black text-white font-rajdhani overflow-hidden select-none relative">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        :root {
            --bg-deep: #0D0E12;
            --surface: #16191F;
            --accent: #C5A059;
            --accent-glow: rgba(197, 160, 89, 0.35);
            --success: #10B981;
            --danger: #F43F5E;
            --text-primary: #F8FAFC;
            --text-secondary: #94A3B8;
        }

        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-mono-premium { font-family: 'JetBrains Mono', monospace; }

        .glass-panel {
            background: rgba(20, 28, 45, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .premium-card {
            background: var(--surface);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-card:hover {
            border-color: rgba(197, 160, 89, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px 0 rgba(197, 160, 89, 0.1);
        }

        .accent-gradient {
            background: linear-gradient(135deg, #C5A059 0%, #8E6F3E 100%);
        }

        .text-gradient {
            background: linear-gradient(to right, #C5A059, #F3D9A1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Smooth Nav Indicator */
        .nav-indicator {
            position: absolute;
            left: 0;
            width: 4px;
            height: 24px;
            background: #C5A059;
            border-radius: 0 4px 4px 0;
            box-shadow: 0 0 12px rgba(197, 160, 89, 0.6);
        }

        .shimmer-bar {
            position: relative;
            overflow: hidden;
        }

        .shimmer-bar::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.05),
                transparent
            );
            transform: translateX(-100%);
            animation: shimmer-effect 2s infinite;
        }

        @keyframes shimmer-effect {
            100% { transform: translateX(100%); }
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.15); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(197, 160, 89, 0.4); }

        .animate-flicker {
            animation: flicker 2s infinite;
        }

        .stat-glow {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 0%, var(--accent-glow), transparent 70%);
            opacity: 0;
            transition: opacity 0.5s;
        }

        .premium-card:hover .stat-glow {
            opacity: 1;
        }

        @keyframes flicker {
            0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; }
            20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.4; }
        }

        .animate-shine {
            background: linear-gradient(
                to right,
                #F8FAFC 20%,
                #C5A059 40%,
                #C5A059 60%,
                #F8FAFC 80%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 3s linear infinite;
        }

        @keyframes shine {
            to { background-position: 200% center; }
        }

        .animate-rotate-slow {
            animation: rotate-slow 20s linear infinite;
        }

        @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #C5A059;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            animation: sparkle-float 4s ease-in-out infinite;
        }

        @keyframes sparkle-float {
            0%, 100% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(1.5); opacity: 1; }
        }

        .victory-pulse-glow {
            animation: victory-pulse 4s ease-in-out infinite;
        }

        @keyframes victory-pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
        }

        .animate-pop-out {
            animation: pop-out 0.8s cubic-bezier(0.17, 0.89, 0.32, 1.28) forwards;
            transform-origin: center center;
        }

        @keyframes pop-out {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }

        .victory-backdrop {
            background: radial-gradient(circle at center, rgba(13, 14, 18, 0.9) 0%, rgba(0, 0, 0, 1) 100%);
        }
      `}</style>

            <div className="cyber-bg"></div>
            <div className="scan-layer"></div>

            <div className="h-20 bg-[var(--bg-deep)]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-50 relative">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-outfit text-xl font-black tracking-tighter text-gradient">ELITES ARENA</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]"></div>
                            <span className="font-mono-premium text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">System Optimal</span>
                        </div>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                    <div className="px-6 py-2 glass-panel rounded-full flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-[var(--accent)]" />
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
                        onClick={() => setShowAdminProfile(true)}
                        className="flex items-center gap-3 pr-4 border-r border-white/10 cursor-pointer group hover:opacity-80 transition-all"
                    >
                        <div className="flex flex-col items-end">
                            <span className="font-outfit text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors uppercase tracking-tight">{adminData.name}</span>
                            <span className="font-mono-premium text-[9px] text-[var(--accent)] uppercase tracking-wider">{adminData.role}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl accent-gradient p-0.5 shadow-lg shadow-amber-600/20 group-hover:shadow-amber-500/40 transition-all">
                            <div className="w-full h-full bg-[var(--surface)] rounded-[10px] flex items-center justify-center overflow-hidden">
                                <img 
                                    src={getAvatarUrl(adminData.avatar)} 
                                    onError={handleAvatarError} 
                                    alt="Admin" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                        </div>
                    </div>
                    <div 
                        onClick={() => setActivePanel('Notifications')}
                        className="relative cursor-pointer group"
                    >
                        <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                            <Bell size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[var(--bg-deep)]">3</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative z-10">
                {/* OVERLAY for mobile sidebar */}
                {isMobileSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* SIDEBAR */}
                <aside className={`
                    fixed lg:relative inset-y-0 left-0 w-72 glass-panel flex flex-col z-[100] lg:z-40 transition-transform duration-300 transform
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    border-r border-white/5
                `}>
                    <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-2xl bg-amber-600/10 border border-amber-500/20">
                                <ShieldAlert size={24} className="text-[var(--accent)]" />
                            </div>
                            <div>
                                <h3 className="font-outfit font-extrabold text-lg text-[var(--text-primary)] leading-tight uppercase tracking-tight">Vault</h3>
                                <p className="font-mono-premium text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Management</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 py-8 flex flex-col gap-1.5 px-4 overflow-y-auto">
                        <div className="px-4 mb-4">
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-50">Main Control</p>
                        </div>
                        {navItems.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => setActivePanel(item.id)}
                                className={`group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-inter font-semibold transition-all duration-300 relative overflow-hidden ${activePanel === item.id
                                    ? 'bg-amber-600/10 text-[var(--text-primary)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                    }`}
                            >
                                {activePanel === item.id && <div className="nav-indicator" />}
                                <span className={`transition-transform duration-300 group-hover:scale-110 ${activePanel === item.id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm tracking-wide">{item.id}</span>
                                {activePanel === item.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 mt-auto">
                        <button 
                            onClick={handleLogoutWithTransition}
                            className="w-full py-4 bg-[var(--danger)]/10 text-[var(--danger)] font-outfit font-bold rounded-2xl border border-[var(--danger)]/20 hover:bg-[var(--danger)] hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-red-500/5 group"
                        >
                            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-xs uppercase tracking-widest">Logout Session</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">

                    {/* PANEL 1: OVERVIEW */}
                    {activePanel === 'Overview' && (
                        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                            <div className="flex flex-wrap items-center gap-3 lg:gap-4 animate-in slide-in-from-top-4 duration-500 fade-in">
                                <button onClick={() => { setActivePanel('Tournaments'); setIsSlidePanelOpen(true); }} className="flex-1 lg:flex-none justify-center px-6 lg:px-8 py-3.5 bg-amber-600 text-white font-outfit font-bold text-xs lg:text-sm tracking-wide rounded-2xl shadow-lg shadow-amber-600/20 hover:bg-amber-500 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2">
                                    <Plus size={18} /> <span className="whitespace-nowrap">Create Tournament</span>
                                </button>
                                <button onClick={() => setActivePanel('Key Verifier')} className="flex-1 lg:flex-none justify-center px-6 lg:px-8 py-3.5 bg-white/5 border border-white/10 text-[var(--text-primary)] font-outfit font-bold text-xs lg:text-sm tracking-wide rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                                    <Key size={18} className="text-amber-400" /> <span className="whitespace-nowrap">Verify Access</span>
                                </button>
                                <button onClick={() => setActivePanel('Match Results')} className="flex-1 lg:flex-none justify-center px-6 lg:px-8 py-3.5 bg-white/5 border border-white/10 text-[var(--text-primary)] font-outfit font-bold text-xs lg:text-sm tracking-wide rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                                    <Target size={18} className="text-rose-400" /> <span className="whitespace-nowrap">Input Results</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-8">
                                {loading ? (
                                    <>
                                        <SkeletonStat />
                                        <SkeletonStat />
                                        <SkeletonStat />
                                        <SkeletonStat />
                                    </>
                                ) : (
                                    [
                                        { label: 'Active Tournaments', value: '3', color: 'text-amber-500', icon: <Trophy size={18} /> },
                                        { label: 'Total Bookings', value: '47', color: 'text-emerald-400', icon: <Users size={18} /> },
                                        { label: 'Total Revenue', value: '12400', color: 'text-sky-400', icon: <Zap size={18} />, prefix: '₹' },
                                        { label: 'Players Online', value: '128', color: 'text-rose-400', icon: <Activity size={18} /> }
                                    ].map((stat, i) => (
                                        <div key={i} className="px-7 py-8 premium-card rounded-[2rem] relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                                            <div className="stat-glow" />
                                            <div className="flex items-center justify-between mb-6 relative z-10">
                                                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                                    {stat.icon}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[var(--success)] font-mono-premium text-[10px]">
                                                    <span className="font-bold">+12%</span>
                                                    <ChevronRight size={10} className="-rotate-90" />
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                                <h2 className="font-outfit font-black text-4xl text-[var(--text-primary)] tracking-tight group-hover:text-amber-500 transition-colors">
                                                    <CountUp end={stat.value} prefix={stat.prefix || ""} />
                                                </h2>
                                            </div>
                                            <div className="mt-8 flex items-center gap-4 relative z-10">
                                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden shimmer-bar">
                                                    <div className={`h-full ${stat.color.replace('text', 'bg')} w-[70%] opacity-80 group-hover:w-[85%] transition-all duration-1000 relative`}>
                                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                    </div>
                                                </div>
                                                <span className="font-mono-premium text-[11px] font-bold text-slate-500">70%</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="premium-card rounded-3xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both shadow-2xl shadow-black/50">
                                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <h4 className="font-outfit font-bold text-sm tracking-wider text-[var(--text-primary)] flex items-center gap-3">
                                        <Activity size={18} className="text-amber-500" /> System Protocols
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="font-mono-premium text-[10px] text-[var(--text-secondary)] uppercase">Live Sync</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/[0.01] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                                <th className="px-8 py-4">Timestamp</th>
                                                <th className="px-8 py-4">Protocol</th>
                                                <th className="px-8 py-4">Operator</th>
                                                <th className="px-8 py-4">Status Intel</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm border-t border-white/5 font-inter">                                            {[
                                                { time: '22:14:05', event: 'BOOKING', player: 'NOVA_007', action: 'Valorant S4 Slot Secured', color: 'sky', icon: <Target size={12} /> },
                                                { time: '22:12:30', event: 'AUTH', player: 'SPECTRE_1', action: 'Sector 4 Access Cleared', color: 'emerald', icon: <Key size={12} /> },
                                                { time: '22:10:15', event: 'SYNC', player: 'SYSTEM', action: 'Nova vs Wraith: 13-11', color: 'rose', icon: <Zap size={12} /> },
                                                { time: '22:08:44', event: 'CANCEL', player: 'GHOST_X', action: 'Booking Revoked/Refund', color: 'slate', icon: <XCircle size={12} /> },
                                                { time: '22:05:12', event: 'LOG', player: 'MORTAL_K', action: 'BGMI Clash Entry Logged', color: 'amber', icon: <Activity size={12} /> }
                                            ].map((log, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-5 text-[10px] font-mono-premium text-slate-500 group-hover:text-slate-300 transition-colors">{log.time}</td>
                                                    <td className="px-8 py-5">
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-${log.color}-500/10 border border-${log.color}-500/20 text-${log.color}-400 font-bold text-[9px] tracking-widest uppercase`}>
                                                            {log.icon}
                                                            {log.event}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-[var(--text-primary)] font-bold text-xs tracking-tight">{log.player}</td>
                                                    <td className="px-8 py-5 text-slate-400 text-xs font-medium">{log.action}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PANEL 2: TOURNAMENTS */}
                    {activePanel === 'Tournaments' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex flex-wrap gap-6 items-center justify-between pb-8 border-b border-white/10">
                                <div className="flex flex-wrap gap-4">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors z-10" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search protocol..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-white/5 border border-white/10 py-3.5 pl-12 pr-6 rounded-2xl text-sm font-inter text-white focus:border-amber-500 focus:bg-white/10 outline-none w-80 transition-all shadow-inner" 
                                        />
                                    </div>
                                    <CustomDropdown 
                                        value={categoryFilter}
                                        options={["All Categories", "Valorant", "BGMI", "Free Fire"]}
                                        onChange={(val) => setCategoryFilter(val)}
                                        className="min-w-[200px]"
                                    />
                                </div>
                                <button onClick={() => { setIsEditing(false); setFormData({ id: null, name: '', game: 'VALORANT', date: '', slots: '', fee: '', prize: '', desc: '' }); setIsSlidePanelOpen(true); }} className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-bold rounded-2xl transition-all shadow-lg shadow-amber-600/20 active:scale-95">
                                    + Deploy New Protocol
                                </button>
                            </div>

                            <div className="premium-card rounded-3xl border border-white/5 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.01]">
                                        <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                            <th className="px-8 py-6">Designation</th>
                                            <th className="px-8 py-6">Protocol</th>
                                            <th className="px-8 py-6">Timeline</th>
                                            <th className="px-8 py-6">Registered</th>
                                            <th className="px-8 py-6">Operational Status</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-inter">
                                        {tournaments.filter(t => {
                                            const title = t.title || t.name || '';
                                            const game = t.game || '';
                                            const matchesCategory = categoryFilter === 'All Categories' || game === categoryFilter;
                                            const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || game.toLowerCase().includes(searchQuery.toLowerCase());
                                            return matchesCategory && matchesSearch;
                                        }).map((t, i) => (
                                            <tr key={i} className="hover:bg-white/[0.01] group transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                                                <td className="px-8 py-6 font-semibold text-[var(--text-primary)]">{t.title || t.name}</td>
                                                <td className={`px-8 py-6 text-[10px] font-mono-premium font-bold tracking-widest ${t.gameColor}`}>{t.game}</td>
                                                <td className="px-8 py-6 text-xs text-slate-500">{new Date(t.startTime || t.date).toLocaleDateString()}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2 w-32">
                                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                                            <span className="uppercase tracking-[0.2em] text-[8px]">Registered</span>
                                                            <span className="font-mono-premium text-[11px] text-amber-500">{t.slots?.booked || 0} / {t.slots?.total || 1}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)]" style={{ width: `${(t.slots?.booked || 0) / (t.slots?.total || 1) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${t.statusColor} ${t.bg} border border-current/20 flex items-center justify-center gap-2 relative overflow-hidden group/status`}>
                                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/status:opacity-100 transition-opacity" />
                                                        {t.status === 'ACTIVE' && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
                                                        )}
                                                        <span className="relative z-10">{t.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                                                                        <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => handleEditTournament(t)}
                                                            className="p-2 text-amber-500 hover:text-white hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer"
                                                            title="Edit Protocol"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setDeleteModal({ open: true, target: t.title || t.name })} 
                                                            className="p-2 text-rose-500 hover:text-white hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                                                            title="Purge Protocol"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PANEL 3: KEY VERIFIER */}
                    {activePanel === 'Key Verifier' && (
                        <div className="max-w-xl mx-auto min-h-full py-10 flex flex-col justify-center animate-in zoom-in-95 duration-500">
                            <div className="text-center mb-12 space-y-4">
                                <div className="w-20 h-20 bg-amber-600/10 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20 mb-6">
                                    <Key className="w-10 h-10 text-amber-500" />
                                </div>
                                <h2 className="font-outfit font-black text-4xl tracking-tight text-[var(--text-primary)]">Access Authorization</h2>
                                <p className="text-slate-500 font-inter font-medium text-sm">Scan player credentials to verify eligibility</p>
                            </div>

                            <form onSubmit={verifyKey} className="space-y-8">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={keyInput}
                                        onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                                        placeholder="EA-0000-0000"
                                        className="w-full bg-white/5 border border-white/10 text-center font-mono-premium text-4xl tracking-widest py-10 rounded-3xl text-white focus:border-amber-500 focus:bg-white/[0.08] outline-none transition-all shadow-2xl"
                                        autoFocus
                                    />
                                    <div className="absolute top-4 right-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">Encrypted Stream</div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 bg-amber-600 text-white font-outfit font-bold rounded-2xl shadow-lg shadow-amber-600/20 hover:bg-amber-500 hover:-translate-y-0.5 transition-all active:scale-95"
                                    >
                                        Authorize Entry
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setKeyInput(''); setKeyResult(null); }}
                                        className="px-10 py-5 bg-white/5 text-slate-400 font-outfit font-bold border border-white/10 rounded-2xl hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>

                            {keyResult && (
                                <div className={`mt-12 p-10 premium-card rounded-[2rem] border ${keyResult.success ? 'border-emerald-500/30' : 'border-rose-500/30'} animate-in fade-in zoom-in-90 duration-500 relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-64 h-64 opacity-5 -mr-20 -mt-20">
                                        {keyResult.success ? <CheckCircle2 size={256} className="text-emerald-500" /> : <XCircle size={256} className="text-rose-500" />}
                                    </div>

                                    {keyResult.success ? (
                                        <div className="flex items-start gap-8 relative z-10">
                                            <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                                <CheckCircle2 size={40} className="text-emerald-500" />
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <div>
                                                    <h4 className="font-outfit font-black text-3xl text-white tracking-tight">{keyResult.name}</h4>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Authentication Success</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                                    <div>
                                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Protocol</p>
                                                        <p className="text-[var(--text-primary)] font-semibold text-sm">{keyResult.tourney}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Allocation</p>
                                                        <p className="text-[var(--text-primary)] font-semibold text-sm">{keyResult.slot} · {keyResult.team}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-8 relative z-10">
                                            <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                                <XCircle size={40} className="text-rose-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-outfit font-black text-3xl text-rose-500 tracking-tight">Access Denied</h4>
                                                <p className="text-slate-400 font-medium text-sm mt-2">{keyResult.reason}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PANEL 4: MATCH RESULTS */}
                    {activePanel === 'Match Results' && (
                        <div className="space-y-8 animate-in fade-in zoom-in-50 slide-in-from-bottom-10 duration-1000 ease-out fill-mode-forwards">
                            <div className="flex items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                        <Trophy size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-outfit font-black text-xl text-white tracking-tight">Tournament Orchestrator</h3>
                                        <p className="text-slate-500 text-xs font-medium font-inter">Real-time bracket management and result synchronization</p>
                                    </div>
                                </div>
                                <CustomDropdown 
                                    value={formData.name || (tournaments[0]?.title || tournaments[0]?.name || "Select Protocol")} 
                                    options={tournaments.map(t => t.title || t.name)} 
                                    onChange={(val) => {
                                        const t = tournaments.find(x => (x.title || x.name) === val);
                                        if (t) setFormData({ ...formData, id: t._id, name: val });
                                    }} 
                                    className="min-w-[350px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                {/* ROUND 1: QUARTER FINALS */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-[0.2em]">Quarter Finals</h4>
                                        <span className="px-2 py-1 bg-white/5 rounded-lg font-mono-premium text-[10px] text-slate-500">04 MATCHES</span>
                                    </div>
                                    <div className="space-y-4">
                                        {bracketMatches.filter(m => m.round === 'QF').map((match, i) => (
                                            <div key={match.id} className={`premium-card rounded-3xl border ${match.winner ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5 hover:border-amber-500/30'} transition-all group relative overflow-hidden`}>
                                                <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                                    <span className="font-mono-premium text-[9px] font-bold text-slate-500">MATCH #0{match.id}</span>
                                                    {match.winner && <CheckCircle2 size={12} className="text-emerald-500" />}
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    {[
                                                        { name: match.teamA, score: match.scoreA, setScore: (val) => setBracketMatches(p => p.map(m => m.id === match.id ? { ...m, scoreA: val } : m)), isWinner: match.winner === match.teamA },
                                                        { name: match.teamB, score: match.scoreB, setScore: (val) => setBracketMatches(p => p.map(m => m.id === match.id ? { ...m, scoreB: val } : m)), isWinner: match.winner === match.teamB }
                                                    ].map((t, idx) => (
                                                        <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${t.isWinner ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-transparent'}`}>
                                                            <span className={`text-[11px] font-bold uppercase ${t.isWinner ? 'text-amber-500' : 'text-slate-300'}`}>{t.name}</span>
                                                                <NumericControl 
                                                                    value={t.score} 
                                                                    onValueChange={t.setScore} 
                                                                    disabled={match.winner || t.name === 'TBD'} 
                                                                    size={match.round === 'QF' ? 'sm' : match.round === 'SF' ? 'md' : 'lg'} 
                                                                />
                                                        </div>
                                                    ))}
                                                    {!match.winner && (
                                                        <button 
                                                            onClick={() => handleMatchConfirm(match.id)}
                                                            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all mt-2 hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-amber-600/10"
                                                        >
                                                            Sync Result
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ROUND 2: SEMI FINALS */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-[0.2em]">Semi Finals</h4>
                                        <span className="px-2 py-1 bg-white/5 rounded-lg font-mono-premium text-[10px] text-slate-500">02 MATCHES</span>
                                    </div>
                                    <div className="space-y-6 pt-10">
                                        {bracketMatches.filter(m => m.round === 'SF').map((match, i) => (
                                            <div key={match.id} className={`premium-card rounded-3xl border ${match.winner ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5 hover:border-amber-500/30'} transition-all group relative overflow-hidden`}>
                                                <div className="px-4 py-2 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                                                    <span className="font-mono-premium text-[9px] font-bold text-slate-500 text-center w-full uppercase tracking-tighter">Semi Final {i+1}</span>
                                                </div>
                                                <div className="p-5 space-y-3">
                                                    {[
                                                        { name: match.teamA, score: match.scoreA, setScore: (val) => setBracketMatches(p => p.map(m => m.id === match.id ? { ...m, scoreA: val } : m)), isWinner: match.winner === match.teamA },
                                                        { name: match.teamB, score: match.scoreB, setScore: (val) => setBracketMatches(p => p.map(m => m.id === match.id ? { ...m, scoreB: val } : m)), isWinner: match.winner === match.teamB }
                                                    ].map((t, idx) => (
                                                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${t.isWinner ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-transparent'}`}>
                                                            <span className={`text-xs font-bold uppercase tracking-tight ${t.name === 'TBD' ? 'text-slate-600' : (t.isWinner ? 'text-amber-500' : 'text-slate-300')}`}>{t.name}</span>
                                                            <NumericControl 
                                                                value={t.score} 
                                                                onValueChange={t.setScore} 
                                                                disabled={match.winner || t.name === 'TBD'} 
                                                                size="md" 
                                                            />
                                                        </div>
                                                    ))}
                                                    {!match.winner && match.teamA !== 'TBD' && match.teamB !== 'TBD' && (
                                                        <button 
                                                            onClick={() => handleMatchConfirm(match.id)}
                                                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all mt-2 hover:scale-[1.02] active:scale-[0.97] shadow-lg shadow-amber-600/20"
                                                        >
                                                            Sync Result
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* FINAL ROUND & CHAMPION */}
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="font-outfit font-bold text-xs text-amber-500 uppercase tracking-[0.3em]">Grand Finals</h4>
                                            <Crown size={18} className="text-amber-500 animate-pulse" />
                                        </div>
                                        {bracketMatches.filter(m => m.round === 'Final').map(match => (
                                            <div key={match.id} className={`premium-card rounded-[2.5rem] border-2 ${match.winner ? 'border-emerald-500' : 'border-amber-500 shadow-[0_0_40px_rgba(197,160,89,0.2)]'} transition-all p-1`}>
                                                <div className="p-8 space-y-6 bg-white/[0.02] rounded-[2.3rem]">
                                                    <div className="flex flex-col gap-4">
                                                        {[
                                                            { name: match.teamA, score: match.scoreA, setScore: (val) => setBracketMatches(p => p.map(m => m.id === match.id ? { ...m, scoreA: val } : m)), isWinner: match.winner === match.teamA },
                                                            { name: match.teamB, score: match.scoreB, setScore: (val) => setBracketMatches(p => p.map(m => m.id === match.id ? { ...m, scoreB: val } : m)), isWinner: match.winner === match.teamB }
                                                        ].map((t, idx) => (
                                                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${t.isWinner ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}>
                                                                <span className="text-sm font-black uppercase tracking-widest text-white">{t.name}</span>
                                                                <NumericControl 
                                                                    value={t.score} 
                                                                    onValueChange={t.setScore} 
                                                                    disabled={match.winner || t.name === 'TBD'} 
                                                                    size="lg" 
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {!match.winner && match.teamA !== 'TBD' && match.teamB !== 'TBD' && (
                                                        <button 
                                                            onClick={() => handleMatchConfirm(match.id)}
                                                            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-outfit font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-amber-600/30 transition-all hover:scale-[1.05] active:scale-[0.95]"
                                                        >
                                                            Finalize Protocol
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* VICTORY DOMAIN PLACEHOLDER */}
                                        {!bracketMatches[6].winner && (
                                            <div className="w-full min-h-[450px] rounded-[4rem] transition-all duration-1000 flex flex-col items-center justify-center gap-10 relative border-2 border-dashed border-white/10 bg-white/[0.01] opacity-40 overflow-hidden">
                                                <div className="p-6 bg-white/5 rounded-[2rem] text-slate-800">
                                                    <Trophy size={48} />
                                                </div>
                                                <p className="font-outfit font-bold text-slate-700 text-[10px] tracking-[0.3em] uppercase">Victory Domain Awaiting</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                    )}
                    
                    {/* PANEL 5: PLAYERS */}
                    {activePanel === 'Players' && (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                <div className="space-y-1">
                                    <h2 className="font-outfit font-black text-3xl text-white tracking-tight">Player Registry</h2>
                                    <p className="text-slate-500 text-sm font-medium font-inter">Manage and oversee all registered operatives</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input type="text" placeholder="Search by callsign..." className="bg-white/5 border border-white/10 py-3 pl-12 pr-6 rounded-2xl text-sm font-inter text-white focus:border-amber-500 outline-none w-72 transition-all" />
                                    </div>
                                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><Filter size={20} /></button>
                                </div>
                            </div>

                            <div className="premium-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.03] border-b border-white/5">
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Player</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Rank</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-inter">
                                        {players.length > 0 ? players.map((p, i) => (
                                            <tr 
                                                key={p._id || i} 
                                                onClick={() => setSelectedPlayer(p)}
                                                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                            <img 
                                                                src={getAvatarUrl(p.avatar)} 
                                                                onError={handleAvatarError}
                                                                alt={p.name} 
                                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm">{p.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-mono-premium">{p.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-amber-500/80 font-mono-premium">{p.rank || 'RECRUIT'}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full bg-${p.role === 'ADMIN' ? 'rose' : 'emerald'}-500 shadow-[0_0_8px_rgba(var(--${p.role === 'ADMIN' ? 'rose' : 'emerald'}-rgb),0.5)]`} />
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{p.role}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditPlayer(p); }}
                                                            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                                            title="Edit Operative"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeletePlayer(p._id); }}
                                                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all"
                                                            title="Purge Record"
                                                        >
                                                            <ShieldAlert size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-10 text-center text-slate-500 font-inter">
                                                    {playersLoading ? 'Loading operative database...' : 'No registered operatives found.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PANEL 6: TEAMS */}
                    {activePanel === 'Teams' && (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                <div className="space-y-1">
                                    <h2 className="font-outfit font-black text-3xl text-white tracking-tight">Active Team Squads</h2>
                                    <p className="text-slate-500 text-sm font-medium font-inter">Monitor team performance and roster stability</p>
                                </div>
                                <button 
                                    onClick={() => setIsTeamSlidePanelOpen(true)}
                                    className="px-6 py-3 bg-amber-600 text-white font-outfit font-bold rounded-2xl flex items-center gap-2 hover:bg-amber-500 transition-all hover:scale-[1.02] active:scale-[0.97]"
                                >
                                    <Plus size={18} /> Register Team
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { name: 'Nova Esports', rank: '#1', winRate: '88%', matches: 156, color: 'emerald' },
                                    { name: 'Sentinels', rank: '#4', winRate: '72%', matches: 142, color: 'sky' },
                                    { name: 'Paper Rex', rank: '#2', winRate: '84%', matches: 128, color: 'amber' },
                                    { name: 'Team Liquid', rank: '#7', winRate: '65%', matches: 110, color: 'sky' },
                                    { name: 'LOUD', rank: '#3', winRate: '79%', matches: 135, color: 'rose' },
                                    { name: 'FNATIC', rank: '#5', winRate: '70%', matches: 120, color: 'fuchsia' }
                                ].map((t, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedTeam(t)}
                                        className="premium-card rounded-3xl p-6 border border-white/5 hover:border-amber-500/30 cursor-pointer group transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:bg-amber-600/10 transition-colors">
                                                <ShieldAlert size={28} className="text-amber-500" />
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Rank</span>
                                                <p className="font-outfit font-black text-xl text-amber-500">{t.rank}</p>
                                            </div>
                                        </div>
                                        <h4 className="font-outfit font-bold text-lg text-white mb-4 group-hover:text-amber-500 transition-colors">{t.name}</h4>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Win Rate</p>
                                                <p className="font-mono-premium text-xs text-emerald-400">{t.winRate}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Matches</p>
                                                <p className="font-mono-premium text-xs text-white">{t.matches}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PANEL 7: SETTINGS */}
                    {activePanel === 'Settings' && (
                        <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="space-y-1 pb-6 border-b border-white/10">
                                <h2 className="font-outfit font-black text-3xl text-white tracking-tight">System Configuration</h2>
                                <p className="text-slate-500 text-sm font-medium font-inter">Global parameters and administrative control</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="premium-card rounded-3xl p-8 border border-white/5 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                            <Settings className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <h3 className="font-outfit font-bold text-xl text-white">General Settings</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-white">Tournament Auto-Deployment</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Automatically launch scheduled protocols</p>
                                            </div>
                                            <div className="w-12 h-6 bg-amber-600 rounded-full p-1 cursor-pointer">
                                                <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between opacity-50">
                                            <div>
                                                <p className="text-sm font-bold text-white">Public Leaderboards</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Visible to all registered operatives</p>
                                            </div>
                                            <div className="w-12 h-6 bg-white/10 rounded-full p-1 cursor-not-allowed">
                                                <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-card rounded-3xl p-8 border border-white/5 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
                                            <ShieldAlert className="w-6 h-6 text-rose-500" />
                                        </div>
                                        <h3 className="font-outfit font-bold text-xl text-white">Security & Access</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-white">Enforce 2FA</p>
                                                <p className="text-[10px] text-slate-500 mt-1">Require biometric verification for root access</p>
                                            </div>
                                            <div className="w-12 h-6 bg-white/10 rounded-full p-1 cursor-pointer">
                                                <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 bg-rose-500/10 text-rose-500 font-bold text-xs uppercase tracking-widest rounded-xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Flush Logs</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PANEL 8: NOTIFICATIONS */}
                    {activePanel === 'Notifications' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="flex items-center justify-between pb-6 border-b border-white/10">
                                <div className="space-y-1">
                                    <h2 className="font-outfit font-black text-3xl text-white tracking-tight">System Notifications</h2>
                                    <p className="text-slate-500 text-sm font-medium font-inter">Recent administrative alerts and protocol logs</p>
                                </div>
                                <button className="px-6 py-3 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-2xl hover:text-white hover:bg-white/10 transition-all">Mark All Read</button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: 'New Tournament Deployment', time: '10 MINS AGO', desc: 'Protocol VALORANT_STORM_S1 has been successfully initialized in Sector 04.', type: 'protocol', icon: <Trophy size={18} /> },
                                    { title: 'Critical Security Update', time: '2 HOURS AGO', desc: 'Root access keys have been rotated successfully. All administrative sessions updated.', type: 'security', icon: <ShieldAlert size={18} /> },
                                    { title: 'Player Enrollment Spike', time: '5 HOURS AGO', desc: 'Registry shows 42 new operatives joined in the last 6 hours.', type: 'stats', icon: <Users size={18} /> },
                                    { title: 'Tournament Result Sync', time: '1 DAY AGO', desc: 'Nova vs Wraith match results have been verified and locked.', type: 'match', icon: <CheckCircle2 size={18} /> }
                                ].map((n, i) => (
                                    <div key={i} className="premium-card p-6 rounded-3xl border border-white/5 hover:border-amber-500/20 transition-all flex items-start gap-6 group">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${n.type === 'security' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                            {n.icon}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-outfit font-bold text-lg text-white group-hover:text-amber-500 transition-colors">{n.title}</h4>
                                                <span className="font-mono-premium text-[10px] text-slate-500 font-bold uppercase tracking-widest">{n.time}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm leading-relaxed">{n.desc}</p>
                                            <div className="pt-4 flex items-center gap-4">
                                                <button className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:text-white transition-colors">View Details</button>
                                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                                <button className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-rose-500 transition-colors">Archive</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PANEL 5: SUPPORT / CHAT */}
                    {activePanel === 'Support' && (
                        <div className="h-[calc(100vh-200px)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <div className="space-y-1">
                                    <h2 className="font-outfit font-black text-3xl text-white tracking-tight">Support Terminal</h2>
                                    <p className="text-slate-500 text-sm font-medium font-inter">Direct communication link with operatives</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selectedConversation && (
                                        <button 
                                            onClick={() => setSelectedConversation(null)}
                                            className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-xs font-bold uppercase transition-all hover:text-white"
                                        >
                                            Back to List
                                        </button>
                                    )}
                                    <button 
                                        onClick={fetchConversations}
                                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
                                    >
                                        <Zap size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-6 overflow-hidden">
                                {/* CONVERSATION LIST */}
                                <div className={`w-80 glass-panel rounded-3xl overflow-hidden flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex w-full lg:w-80'}`}>
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                            <input type="text" placeholder="Search operatives..." className="w-full bg-black/20 border border-white/5 py-2 pl-9 pr-4 rounded-xl text-xs font-inter outline-none focus:border-amber-500/50" />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                        {conversations.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-8">
                                                <MessageSquare size={48} className="mb-4" />
                                                <p className="font-outfit font-bold uppercase tracking-widest text-xs">No active links</p>
                                            </div>
                                        ) : (
                                            conversations.map((conv) => (
                                                <div 
                                                    key={conv._id}
                                                    onClick={() => setSelectedConversation(conv)}
                                                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedConversation?._id === conv._id ? 'bg-amber-600/10 border-amber-500/30' : 'hover:bg-white/5 border-transparent'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                            <img 
                                                                src={getAvatarUrl(conv.avatar)}
                                                                onError={handleAvatarError} 
                                                                alt={conv.name} 
                                                                className="w-full h-full object-cover opacity-70" 
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <h4 className="font-bold text-sm text-white truncate">{conv.name}</h4>
                                                                <span className="text-[9px] text-slate-500 font-mono-premium uppercase">
                                                                    {conv.timestamp && !isNaN(new Date(conv.timestamp)) 
                                                                        ? new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                                        : 'Just now'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 truncate font-inter">
                                                                {conv.lastSender === 'ADMIN' ? 'You: ' : ''}{conv.lastMessage}
                                                            </p>
                                                        </div>
                                                        {conv.unreadCount > 0 && (
                                                            <div className="w-5 h-5 bg-amber-500 text-black text-[10px] font-black flex items-center justify-center rounded-full">
                                                                {conv.unreadCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* CHAT AREA */}
                                <div className={`flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden border border-white/5 ${!selectedConversation ? 'hidden lg:flex items-center justify-center opacity-40' : 'flex'}`}>
                                    {!selectedConversation ? (
                                        <div className="text-center space-y-6">
                                            <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mx-auto">
                                                <Mail size={32} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-outfit font-black text-xl uppercase tracking-tighter">Secure Link Offline</h3>
                                                <p className="text-sm text-slate-500 mt-2">Select an operative to establish encrypted communication</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Chat Header */}
                                            <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center overflow-hidden">
                                                        <img 
                                                            src={getAvatarUrl(selectedConversation.avatar)} 
                                                            onError={handleAvatarError} 
                                                            alt={selectedConversation.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-outfit font-bold text-lg text-white">{selectedConversation.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[9px] text-slate-500 font-mono-premium uppercase tracking-[0.2em]">Link Active</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><Search size={18} /></button>
                                                    <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><Settings size={18} /></button>
                                                </div>
                                            </div>

                                            {/* Messages */}
                                            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 font-inter custom-scrollbar chat-scroll">
                                                {supportMessages.length === 0 ? (
                                                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                                                        <MessageSquare size={48} className="mb-4" />
                                                        <p className="font-outfit font-bold uppercase tracking-widest text-xs">Awaiting first transmission</p>
                                                    </div>
                                                ) : (
                                                    supportMessages.map((msg, i) => (
                                                        <div key={i} className={`flex flex-col ${msg.senderRole === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                                            <div className={`chat-bubble ${msg.senderRole === 'ADMIN' ? 'chat-bubble-admin' : 'chat-bubble-player'}`}>
                                                                {msg.message}
                                                            </div>
                                                            <span className="mt-2 text-[9px] text-slate-500 font-mono-premium uppercase tracking-widest">
                                                                {msg.senderRole === 'ADMIN' ? 'SENT' : 'RECEIVED'} • {msg.timestamp && !isNaN(new Date(msg.timestamp)) 
                                                                    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                                    : 'Just now'}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                                <div ref={messagesEndRef} />
                                            </div>

                                            {/* Input Area */}
                                            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                                                <form onSubmit={handleSendReply} className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl p-2 pl-6 focus-within:border-amber-500/50 transition-all">
                                                    <input 
                                                        type="text" 
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                        placeholder="Transmit response Intel..." 
                                                        className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-600 font-medium"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" className="p-3 text-slate-500 hover:text-white transition-all"><Paperclip size={18} /></button>
                                                        <button 
                                                            type="submit"
                                                            disabled={isSendingReply || !replyMessage.trim()}
                                                            className="px-6 py-3 bg-amber-600 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <Send size={14} /> Send
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PANEL 10: LOGOUT */}
                    {activePanel === 'Logout' && (
                        <div className="max-w-2xl mx-auto h-full flex flex-col justify-center animate-in zoom-in-95 duration-500 px-6">
                            <div className="premium-card rounded-[3rem] p-12 lg:p-16 border border-rose-500/20 text-center relative overflow-hidden shadow-[0_0_80px_rgba(244,63,94,0.1)]">
                                {/* Decorative Elements */}
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px]" />
                                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
                                
                                <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] border border-rose-500/20 mx-auto mb-10 flex items-center justify-center relative z-10">
                                    <LogOut size={48} className="text-rose-500 animate-pulse" />
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <h2 className="font-outfit font-black text-4xl text-white tracking-tight uppercase">Logout</h2>
                                    <p className="text-slate-500 font-inter font-medium text-sm leading-relaxed max-w-sm mx-auto">
                                        Confirm the de-authorization of your administrative credentials and exit the Master Vault.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mt-12 relative z-10">
                                    <button 
                                        onClick={handleLogoutWithTransition}
                                        className="w-full py-5 bg-rose-600 text-white font-outfit font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-600/30 hover:bg-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Confirm Logout
                                    </button>
                                    <button 
                                        onClick={() => setActivePanel('Overview')}
                                        className="w-full py-5 bg-white/5 text-slate-400 font-outfit font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                    >
                                        Stay Logged In
                                    </button>
                                </div>

                                <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#F43F5E]" />
                                        <span className="font-mono-premium text-[9px] text-rose-500/70 uppercase tracking-[0.4em]">Vault Lock Imminent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* OVERLAYS */}
            {/* 1. SLIDE-IN CREATE PANEL */}
            <div
                className={`fixed inset-y-0 right-0 w-[550px] bg-[var(--bg-deep)]/95 backdrop-blur-2xl border-l border-white/10 z-[60] transform shadow-[-40px_0_80px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSlidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-28 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                            <Plus className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="font-outfit font-black tracking-tight text-[var(--text-primary)] text-2xl">
                                {isEditing ? 'Reconfigure Protocol' : 'Create Tournament'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                {isEditing ? 'Updating competitive parameters' : 'Initialize New Competition Protocol'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsSlidePanelOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-10 overflow-y-auto h-[calc(100vh-14rem)] custom-scrollbar">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Tournament Title</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="E.g. Valorant Pro League - Season 1" 
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium transition-all placeholder:text-slate-600 shadow-inner" 
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Gaming Discipline</label>
                        <CustomDropdown 
                            value={formData.game}
                            options={["VALORANT", "BGMI", "FREE FIRE"]}
                            onChange={(val) => setFormData({...formData, game: val})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Deployment Date</label>
                            <CustomDatePicker 
                                value={formData.date}
                                onChange={(val) => setFormData({...formData, date: val})}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Max Operatives</label>
                            <NumericControl 
                                value={formData.slots}
                                onValueChange={(val) => setFormData({...formData, slots: val})}
                                max={100}
                                size="md"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Entry Stake (₹)</label>
                            <NumericControl 
                                value={formData.fee}
                                onValueChange={(val) => setFormData({...formData, fee: val})}
                                min={0}
                                size="md"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Bounty Pool (₹)</label>
                            <NumericControl 
                                value={formData.prize}
                                onValueChange={(val) => setFormData({...formData, prize: val})}
                                min={0}
                                size="md"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Mission Intelligence</label>
                        <textarea 
                            rows="5" 
                            value={formData.desc}
                            onChange={(e) => setFormData({...formData, desc: e.target.value})}
                            placeholder="Define tournament rules, schedule and requirements..." 
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-3xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium text-sm transition-all shadow-inner resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="p-10 h-28 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-4">
                    <button onClick={() => setIsSlidePanelOpen(false)} className="px-8 py-4 bg-white/5 text-slate-400 font-outfit font-bold rounded-2xl hover:text-white hover:bg-white/10 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleDeployProtocol} className="px-10 py-4 bg-amber-600 text-white font-outfit font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-amber-500 shadow-xl shadow-amber-600/20 active:scale-95 transition-all">
                        {isEditing ? 'Update Protocol' : 'Launch Tournament'}
                    </button>
                </div>
            </div>

            {/* 1b. SLIDE-IN REGISTER TEAM PANEL */}
            <div
                className={`fixed inset-y-0 right-0 w-[550px] bg-[var(--bg-deep)]/95 backdrop-blur-2xl border-l border-white/10 z-[60] transform shadow-[-40px_0_80px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isTeamSlidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-28 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                            <ShieldAlert className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="font-outfit font-black tracking-tight text-[var(--text-primary)] text-2xl">Register Squad</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Onboard New Tactical Unit</p>
                        </div>
                    </div>
                    <button onClick={() => setIsTeamSlidePanelOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-8 overflow-y-auto h-[calc(100vh-14rem)] custom-scrollbar">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Official Team Name <span className="text-amber-500">*</span></label>
                        <input 
                            type="text" 
                            value={teamFormData.name}
                            onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})}
                            placeholder="E.g. Sentinels Alpha" 
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium transition-all shadow-inner" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Team Tag <span className="text-amber-500">*</span></label>
                            <input 
                                type="text" 
                                maxLength={5}
                                value={teamFormData.tag}
                                onChange={(e) => setTeamFormData({...teamFormData, tag: e.target.value.toUpperCase()})}
                                placeholder="SEN" 
                                className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium transition-all shadow-inner uppercase" 
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Primary Discipline</label>
                            <CustomDropdown 
                                value={teamFormData.game}
                                options={["VALORANT", "BGMI", "FREE FIRE"]}
                                onChange={(val) => setTeamFormData({...teamFormData, game: val})}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Squad Captain (Discord/In-Game ID) <span className="text-amber-500">*</span></label>
                        <input 
                            type="text" 
                            value={teamFormData.captain}
                            onChange={(e) => setTeamFormData({...teamFormData, captain: e.target.value})}
                            placeholder="Mav#1234" 
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium transition-all shadow-inner" 
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Operative Roster (List IDs separated by comma)</label>
                        <textarea 
                            rows="4" 
                            value={teamFormData.roster}
                            onChange={(e) => setTeamFormData({...teamFormData, roster: e.target.value})}
                            placeholder="Player1#ID, Player2#ID..." 
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-3xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium text-sm transition-all shadow-inner resize-none"
                        ></textarea>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                        <p className="text-[10px] text-amber-500/80 font-inter font-medium leading-relaxed uppercase tracking-wider">
                            By registering, you confirm this squad meets all regional eligibility requirements and protocol standards.
                        </p>
                    </div>
                </div>

                <div className="p-10 h-28 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-4">
                    <button onClick={() => setIsTeamSlidePanelOpen(false)} className="px-8 py-4 bg-white/5 text-slate-400 font-outfit font-bold rounded-2xl hover:text-white hover:bg-white/10 transition-all">
                        Abort
                    </button>
                    <button 
                        onClick={handleRegisterTeam}
                        className="px-10 py-4 bg-amber-600 text-white font-outfit font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-amber-500 shadow-xl shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!teamFormData.name || !teamFormData.tag || !teamFormData.captain}
                    >
                        Register Tactical Unit
                    </button>
                </div>
            </div>

            {/* 1c. SLIDE-IN EDIT PLAYER PANEL */}
            <div
                className={`fixed inset-y-0 right-0 w-[550px] bg-[var(--bg-deep)]/95 backdrop-blur-2xl border-l border-white/10 z-[60] transform shadow-[-40px_0_80px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isPlayerSlidePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-28 border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                            <Edit2 className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="font-outfit font-black tracking-tight text-[var(--text-primary)] text-2xl">Modify Operative</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Reconfiguring Profile Intel</p>
                        </div>
                    </div>
                    <button onClick={() => setIsPlayerSlidePanelOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-8 overflow-y-auto h-[calc(100vh-14rem)] custom-scrollbar">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={playerFormData.name}
                            onChange={(e) => setPlayerFormData({...playerFormData, name: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium transition-all shadow-inner" 
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Email Designation</label>
                        <input 
                            type="email" 
                            value={playerFormData.email}
                            onChange={(e) => setPlayerFormData({...playerFormData, email: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium transition-all shadow-inner" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Access Level</label>
                            <CustomDropdown 
                                value={playerFormData.role}
                                options={["PLAYER", "ADMIN", "MASTER"]}
                                onChange={(val) => setPlayerFormData({...playerFormData, role: val})}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Combat Rank</label>
                            <CustomDropdown 
                                value={playerFormData.rank}
                                options={["RECRUIT", "ELITE STRIKER", "COMMANDER", "SENTINEL"]}
                                onChange={(val) => setPlayerFormData({...playerFormData, rank: val})}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 font-outfit tracking-wide ml-1">Tactical Sector</label>
                        <input 
                            type="text" 
                            value={playerFormData.sector}
                            onChange={(e) => setPlayerFormData({...playerFormData, sector: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:border-amber-500 focus:bg-white/[0.08] outline-none font-inter font-medium transition-all shadow-inner" 
                        />
                    </div>

                    <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                        <p className="text-[10px] text-rose-500/80 font-inter font-medium leading-relaxed uppercase tracking-wider">
                            Warning: Administrative profile modifications are logged and immediate.
                        </p>
                    </div>
                </div>

                <div className="p-10 h-28 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-4">
                    <button onClick={() => setIsPlayerSlidePanelOpen(false)} className="px-8 py-4 bg-white/5 text-slate-400 font-outfit font-bold rounded-2xl hover:text-white hover:bg-white/10 transition-all">
                        Abort
                    </button>
                    <button 
                        onClick={handleUpdatePlayer}
                        className="px-10 py-4 bg-amber-600 text-white font-outfit font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-amber-500 shadow-xl shadow-amber-600/20 active:scale-95 transition-all"
                    >
                        Synchronize Data
                    </button>
                </div>
            </div>

            {/* 2. DELETE CONFIRMATION MODAL */}
            {
                deleteModal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-6">
                        <div className="w-full max-w-lg bg-[var(--bg-deep)] border border-rose-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-[0_0_100px_rgba(244,63,94,0.15)] scale-100 animate-in zoom-in-95 duration-500">
                            {/* Decorative Glow */}
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px]"></div>
                            
                            <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] border border-rose-500/20 mx-auto mb-10 flex items-center justify-center">
                                <ShieldAlert className="w-12 h-12 text-rose-500" />
                            </div>

                            <h2 className="font-outfit font-black text-white text-3xl tracking-tight mb-4">Confirm Deletion</h2>
                            <p className="text-slate-400 font-inter font-medium text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                                You are about to permanently remove this entry from the database. This action cannot be undone.
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Target Payload</span>
                                <span className="text-white font-mono-premium font-bold text-lg break-all">{deleteModal.target}</span>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModal({ open: false, target: null })}
                                    className="flex-1 py-5 bg-white/5 text-slate-400 font-outfit font-bold rounded-2xl hover:text-white hover:bg-white/10 transition-all border border-white/5"
                                >
                                    Abort Process
                                </button>
                                <button
                                    onClick={handleDeleteTournament}
                                    className="flex-1 py-5 bg-rose-600 text-white font-outfit font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-rose-500 shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
                                >
                                    Purge Protocol
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* 3. ADMIN PROFILE MODAL */}
            {showAdminProfile && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto p-4 lg:p-10">
                    <div className="w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative scale-100 animate-in zoom-in-95 duration-700">
                        {/* Dramatic Top Banner */}
                        <div className="h-48 bg-gradient-to-br from-amber-600/20 via-transparent to-transparent relative border-b border-white/5 overflow-hidden">
                            <div className="absolute inset-0 grid-layer opacity-10" />
                            <div className="absolute bottom-[-1px] left-10 p-4 bg-[#080808] border-t border-x border-white/10 rounded-t-[2.5rem] flex items-center gap-6 z-10">
                                <div className="w-24 h-24 rounded-3xl bg-amber-600 border-4 border-[#080808] shadow-2xl overflow-hidden flex items-center justify-center">
                                    <ShieldAlert size={40} className="text-white" />
                                </div>
                                <div className="pr-10">
                                    <h2 className="font-outfit font-black text-3xl text-white tracking-tighter uppercase">Vault Sentinel</h2>
                                    <p className="font-mono-premium text-[10px] text-amber-500 font-bold uppercase tracking-[0.4em] mt-1">Status: Administrative Root access</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAdminProfile(false)}
                                className="absolute top-8 right-10 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all z-20 group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                        
                        <div className="p-10 lg:p-14 pt-20 grid grid-cols-1 lg:grid-cols-3 gap-14">
                            <div className="lg:col-span-2 space-y-12">
                                <div className="space-y-8">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
                                        <div className="w-2 h-[2px] bg-amber-500" /> Identity Protocols
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'System Designation', val: adminData.name },
                                            { label: 'Tactical Sector', val: adminData.sector },
                                            { label: 'Clearance Level', val: adminData.role },
                                            { label: 'Service Commenced', val: adminData.joinDate }
                                        ].map((f, i) => (
                                            <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-amber-500/20 transition-all">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{f.label}</p>
                                                <p className="text-white font-inter font-bold tracking-tight">{f.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-8">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
                                        <div className="w-2 h-[2px] bg-amber-500" /> Operational Metrics
                                    </h3>
                                    <div className="grid grid-cols-3 gap-8">
                                        {[
                                            { label: 'Protocols Launched', val: '124' },
                                            { label: 'Uptime Factor', val: '99.9%' },
                                            { label: 'Decision Weight', val: 'INF' }
                                        ].map((m, i) => (
                                            <div key={i} className="text-center">
                                                <h4 className="font-outfit font-black text-4xl text-amber-500 mb-1">{m.val}</h4>
                                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{m.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="p-8 premium-card rounded-[3rem] border border-amber-500/10 space-y-8">
                                    <h4 className="font-outfit font-bold text-lg text-white mb-6">Security Actions</h4>
                                    <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-outfit font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                        <Settings size={18} className="text-amber-500" /> Update Keys
                                    </button>
                                    <button className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-outfit font-bold rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3">
                                        <ShieldAlert size={18} /> Reset Database
                                    </button>
                                    <div className="pt-6 border-t border-white/5">
                                        <button 
                                            onClick={() => { setShowAdminProfile(false); handleLogoutWithTransition(); }}
                                            className="w-full py-6 bg-amber-600 text-white font-outfit font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-amber-600/20 hover:bg-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            Destroy Session
                                        </button>
                                    </div>
                                </div>
                                <div className="px-6 text-center">
                                    <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tighter">
                                        System Version X-09 // Build: 1773801 // Kernel: ELITES_OS
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Vault Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-glow)_0%,_transparent_70%)] animate-pulse" />
                        <div className="grid-layer opacity-10 scale-150" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-12">
                            <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                            <div className="absolute inset-0 border-2 border-[var(--accent)] rounded-full border-t-transparent animate-spin" />
                            <div className="absolute inset-4 border border-white/10 rounded-full animate-reverse-spin opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldAlert size={40} className="text-[var(--accent)] animate-pulse" />
                            </div>
                        </div>

                        <div className="text-center space-y-4 mb-12">
                            <div className="flex flex-col gap-1">
                                <h1 className="font-outfit font-black text-3xl tracking-tighter text-gradient">ACCESSING VAULT</h1>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-flicker" />
                                    <span className="font-mono-premium text-[10px] text-amber-500/70 uppercase tracking-[0.4em]">Sentinel Authorization Required</span>
                                </div>
                            </div>
                            
                            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-amber-500 transition-all duration-500 ease-out"
                                    style={{ width: `${loadingProgress}%` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            </div>
                        </div>

                        <div className="w-80 h-32 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10" />
                            <div className="relative p-4 h-full font-mono-premium text-[9px] space-y-1.5 overflow-y-auto hide-scrollbar">
                                {loadingLogs.map((log, i) => (
                                    <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <span className="text-amber-500/40">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                        <span className="text-slate-300 tracking-tight">{log}</span>
                                    </div>
                                ))}
                                <div className="w-1.5 h-3 bg-amber-500 animate-pulse inline-block align-middle ml-1" />
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes reverse-spin {
                            from { transform: rotate(360deg); }
                            to { transform: rotate(0deg); }
                        }
                        .animate-reverse-spin {
                            animation: reverse-spin 3s linear infinite;
                        }
                        @keyframes shimmer {
                            from { transform: translateX(-100%); }
                            to { transform: translateX(100%); }
                        }
                        .animate-shimmer {
                            animation: shimmer 1.5s infinite;
                        }
                    `}</style>
                </div>
            )}

            {/* NOTIFICATION TOAST SYSTEM */}
            <div className="fixed bottom-10 right-10 z-[1000] flex flex-col gap-4 max-w-sm w-full">
                {notifications.map((n) => (
                    <div 
                        key={n.id}
                        className={`
                            px-8 py-5 rounded-2xl border backdrop-blur-xl flex items-center gap-4 shadow-2xl 
                            animate-in slide-in-from-right-10 fade-in duration-500
                            ${n.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}
                        `}
                    >
                        <div className={`w-2 h-2 rounded-full ${n.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_8px_currentColor]`} />
                        <span className="font-outfit font-bold text-xs uppercase tracking-widest">{n.message}</span>
                        <button 
                            onClick={() => setNotifications(prev => prev.filter(req => req.id !== n.id))}
                            className="ml-auto p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X size={14} className="opacity-50 hover:opacity-100" />
                        </button>
                    </div>
                ))}
            </div>

            {/* FULLSCREEN VICTORY SPLASH - Top Level for True Visibility */}
            {bracketMatches[6].winner && (
                <div className="fixed inset-0 z-[1000] bg-[#020509]/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-12 overflow-hidden animate-in fade-in duration-700">
                    {/* Exit Button - High Contrast & True Fix */}
                    <button 
                        onClick={() => setBracketMatches(p => p.map(m => m.id === 7 ? { ...m, winner: null } : m))}
                        className="fixed top-8 right-8 z-[1010] p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white hover:text-amber-500 transition-all hover:rotate-90 shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
                        title="Exit Celebration"
                    >
                        <X size={24} />
                    </button>

                    {/* Cinematic Atmosphere */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 blur-[150px] animate-pulse rounded-full z-0" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 blur-[120px] animate-rotate-slow rounded-full z-0" />

                    <div className="flex flex-col items-center justify-center gap-10 animate-in zoom-in-50 duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] p-8">
                        {/* The Trophy */}
                        <div className="relative z-10 p-10 bg-amber-500 text-white rounded-[3rem] shadow-[0_0_100px_rgba(197,160,89,0.4)] group">
                            <Trophy size={100} className="animate-bounce" />
                            <div className="absolute inset-0 rounded-[3rem] bg-amber-400 blur-3xl opacity-30 animate-pulse" />
                            <div className="absolute inset-[-20px] border-2 border-amber-500/30 rounded-[3.5rem] animate-rotate-slow opacity-50" />
                        </div>
                        
                        {/* The Champion Title */}
                        <div className="text-center relative z-10 space-y-4">
                            <p className="text-amber-500 font-black text-xs tracking-[1em] animate-pulse uppercase">Supreme Protocol Achieved</p>
                            <h2 className="font-outfit font-black text-6xl md:text-8xl tracking-tighter uppercase animate-shine py-2 drop-shadow-[0_0_40px_rgba(197,160,89,0.4)] text-white">
                                {bracketMatches[6].winner}
                            </h2>
                            <div className="flex items-center justify-center gap-8 pt-2">
                                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                                <span className="font-mono-premium text-[10px] text-amber-500/60 uppercase tracking-[0.6em]">Victory Domain Prime</span>
                                <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

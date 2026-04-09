import React, { useState, useEffect } from 'react';
import { Radio, Trophy, Users, Zap, ChevronRight, Loader2, Eye, Gamepad2, Target, Shield, Activity, Calendar, Play, ArrowLeft, X } from 'lucide-react';
import api from '../services/api';

// Game genre definitions — each maps to a "game" field filter in the backend
const GAME_GENRES = [
    {
        id: 'VALORANT',
        name: 'Valorant',
        genre: 'Tactical 5v5 FPS',
        accent: '#ff4655',
        glow: 'rgba(255, 70, 85, 0.3)',
        bg: 'rgba(255, 70, 85, 0.05)',
        border: 'rgba(255, 70, 85, 0.35)',
        icon: Target,
        img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    },
    {
        id: 'BGMI',
        name: 'BGMI',
        genre: 'Battle Royale',
        accent: '#f8b400',
        glow: 'rgba(248, 180, 0, 0.3)',
        bg: 'rgba(248, 180, 0, 0.05)',
        border: 'rgba(248, 180, 0, 0.35)',
        icon: Shield,
        img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    },
    {
        id: 'FREE FIRE',
        name: 'Free Fire',
        genre: 'Survival Shooter',
        accent: '#ff6b00',
        glow: 'rgba(255, 107, 0, 0.3)',
        bg: 'rgba(255, 107, 0, 0.05)',
        border: 'rgba(255, 107, 0, 0.35)',
        icon: Zap,
        img: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
    },
    {
        id: 'APEX',
        name: 'Apex Legends',
        genre: 'Hero Battle Royale',
        accent: '#cd3333',
        glow: 'rgba(205, 51, 51, 0.3)',
        bg: 'rgba(205, 51, 51, 0.05)',
        border: 'rgba(205, 51, 51, 0.35)',
        icon: Activity,
        img: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=600&auto=format&fit=crop',
    },
    {
        id: 'CS2',
        name: 'CS2',
        genre: 'Classic FPS',
        accent: '#f5a623',
        glow: 'rgba(245, 166, 35, 0.3)',
        bg: 'rgba(245, 166, 35, 0.05)',
        border: 'rgba(245, 166, 35, 0.35)',
        icon: Gamepad2,
        img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=600&auto=format&fit=crop',
    },
    {
        id: 'ALL',
        name: 'All Games',
        genre: 'View Everything Live',
        accent: '#00F3FF',
        glow: 'rgba(0, 243, 255, 0.3)',
        bg: 'rgba(0, 243, 255, 0.05)',
        border: 'rgba(0, 243, 255, 0.35)',
        icon: Eye,
        img: null,
    },
];

export default function ObserverLobby() {
    const [liveCounts, setLiveCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [hoveredGenre, setHoveredGenre] = useState(null);
    const [selecting, setSelecting] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [fetchingTournaments, setFetchingTournaments] = useState(false);

    // Fetch tournaments to count live matches per game genre
    useEffect(() => {
        const fetchLiveCounts = async () => {
            try {
                const res = await api.get('/tournaments');
                const tournaments = res.data || [];
                const counts = {};
                tournaments.forEach(t => {
                    const game = (t.game || '').toUpperCase();
                    if (!counts[game]) counts[game] = { total: 0, live: 0 };
                    counts[game].total++;
                    if (t.status === 'LIVE') counts[game].live++;
                });
                setLiveCounts(counts);
            } catch (e) {
                // graceful fallback — show counts as 0
            } finally {
                setLoading(false);
            }
        };
        fetchLiveCounts();
    }, []);

    const handleSelect = async (genre) => {
        if (genre.id === 'ALL') {
            setSelecting('ALL');
            setTimeout(() => {
                window.location.href = '/observer';
            }, 400);
            return;
        }

        setSelectedGenre(genre);
        setFetchingTournaments(true);
        try {
            const res = await api.get(`/tournaments?game=${encodeURIComponent(genre.id)}`);
            // Filter only LIVE and UPCOMING for the observer view
            const filtered = (res.data || []).filter(t => t.status === 'LIVE' || t.status === 'UPCOMING');
            setTournaments(filtered);
        } catch (e) {
            setTournaments([]);
        } finally {
            setFetchingTournaments(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white overflow-hidden relative">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }

        body { background: #000; margin: 0; }

        .bg-grid {
            background-image:
                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
            background-size: 60px 60px;
        }

        @keyframes scanline {
            0% { background-position: 0 0; }
            100% { background-position: 0 100px; }
        }

        .scanline-overlay {
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,243,255,0.015) 2px,
                rgba(0,243,255,0.015) 4px
            );
            animation: scanline 4s linear infinite;
        }

        .genre-card {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
        }

        .genre-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%);
            background-size: 200% 200%;
            transition: 0.5s;
            pointer-events: none;
        }

        .genre-card:hover::before {
            animation: holoShift 1.2s infinite linear;
        }

        @keyframes holoShift {
            0% { background-position: -200% -200%; }
            100% { background-position: 200% 200%; }
        }

        .genre-card .card-img {
            transition: all 0.7s ease;
        }
        .genre-card:hover .card-img {
            transform: scale(1.08);
            filter: grayscale(0%) brightness(1);
        }
        .card-img {
            filter: grayscale(60%) brightness(0.7);
        }

        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.6); opacity: 0; }
        }
        .live-ring::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: currentColor;
            animation: pulse-ring 1.5s ease-out infinite;
        }
      `}</style>

            {/* BG Grid + Scanlines */}
            <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none z-0" />
            <div className="fixed inset-0 scanline-overlay pointer-events-none z-0" />
            {/* Center glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,243,255,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="border-b border-white/5 px-6 py-5 flex items-center justify-between bg-black/40 backdrop-blur-md">
                    <a href="/" className="font-orbitron font-black text-xl tracking-widest text-white">
                        ELITE<span className="text-[#00F3FF]">ARENA</span>
                    </a>
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl animate-pulse">
                        <Radio size={14} className="text-red-400" />
                        <span className="font-orbitron font-black text-red-400 text-[10px] tracking-[0.4em] uppercase">LIVE NOW</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center px-6 py-16 md:py-20">
                    {/* Title */}
                    <div className="text-center mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/20 mb-6">
                            <Eye size={13} className="text-[#00F3FF]" />
                            <span className="font-orbitron text-[9px] font-black tracking-[0.4em] text-[#00F3FF] uppercase">Observer Mode</span>
                        </div>
                        <h1 className="font-orbitron font-black text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-white leading-none mb-4">
                            Choose Your
                        </h1>
                        <h1 className="font-orbitron font-black text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-[#00F3FF] drop-shadow-[0_0_30px_rgba(0,243,255,0.5)] leading-none mb-8">
                            Battleground
                        </h1>
                        <p className="text-slate-400 font-inter text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                            Select a game genre to enter the live arena. Watch real-time brackets and track scores as they update.
                        </p>
                    </div>

                    {/* Genre Grid */}
                    {loading ? (
                        <div className="mt-20 flex flex-col items-center gap-4">
                            <Loader2 size={48} className="animate-spin text-[#00F3FF]" />
                            <p className="font-orbitron text-[10px] tracking-[0.4em] text-slate-500 uppercase">Loading live data...</p>
                        </div>
                    ) : (
                        <div className="mt-12 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            {GAME_GENRES.map((genre) => {
                                const gameKey = genre.id.toUpperCase();
                                const count = liveCounts[gameKey] || { total: 0, live: 0 };
                                const isHovered = hoveredGenre === genre.id;
                                const isSelecting = selecting === genre.id;
                                const Icon = genre.icon;

                                return (
                                    <button
                                        key={genre.id}
                                        onClick={() => handleSelect(genre)}
                                        onMouseEnter={() => setHoveredGenre(genre.id)}
                                        onMouseLeave={() => setHoveredGenre(null)}
                                        className={`genre-card text-left rounded-2xl border bg-black/60 p-0 group
                                            ${isSelecting ? 'scale-95 opacity-50' : isHovered ? 'scale-[1.02] -translate-y-1' : ''}
                                        `}
                                        style={{
                                            borderColor: isHovered ? genre.border : 'rgba(255,255,255,0.07)',
                                            boxShadow: isHovered ? `0 0 40px ${genre.glow}, inset 0 0 40px ${genre.bg}` : 'none',
                                        }}
                                    >
                                        {/* Image section */}
                                        {genre.img ? (
                                            <div className="h-40 overflow-hidden rounded-t-2xl relative">
                                                <img
                                                    src={genre.img}
                                                    alt={genre.name}
                                                    className="card-img w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                                {count.live > 0 && (
                                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 px-2.5 py-1 rounded-full">
                                                        <span className="relative w-1.5 h-1.5 rounded-full bg-red-400 live-ring" style={{ color: '#f87171' }} />
                                                        <span className="text-[9px] font-bold text-red-300 uppercase tracking-widest font-orbitron">{count.live} LIVE</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-40 overflow-hidden rounded-t-2xl relative flex items-center justify-center"
                                                style={{ background: `radial-gradient(circle, ${genre.bg} 0%, transparent 70%)` }}>
                                                <Icon size={64} style={{ color: genre.accent, opacity: 0.3 }} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon size={13} style={{ color: genre.accent }} />
                                                        <span className="font-orbitron font-black text-[9px] tracking-[0.3em] uppercase" style={{ color: genre.accent }}>
                                                            {genre.genre}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-orbitron font-black text-xl text-white tracking-tight">{genre.name}</h3>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <div className="text-[11px] font-bold text-slate-400 font-mono">{count.total}</div>
                                                    <div className="text-[8px] uppercase tracking-widest text-slate-600">Tournaments</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-1">
                                                    <Users size={11} className="text-slate-500" />
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                                        {count.live > 0 ? `${count.live} live` : count.total > 0 ? 'upcoming' : 'no matches'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] font-orbitron font-black uppercase tracking-widest"
                                                    style={{ color: genre.accent }}>
                                                    {isSelecting ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <>Watch <ChevronRight size={12} /></>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Tournament Selection Overlay */}
                    {selectedGenre && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-12 animate-in fade-in duration-300">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedGenre(null)} />
                            
                            <div className="relative w-full max-w-4xl bg-[#0a0f18] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,243,255,0.15)] flex flex-col md:flex-row max-h-[90vh]">
                                {/* Sidebar Info */}
                                <div className="md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col items-center text-center justify-center bg-black/40">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                                         style={{ backgroundColor: `${selectedGenre.accent}15`, border: `1px solid ${selectedGenre.accent}30` }}>
                                        <selectedGenre.icon size={40} style={{ color: selectedGenre.accent }} />
                                    </div>
                                    <h2 className="font-orbitron font-black text-2xl text-white mb-2 uppercase tracking-tighter">
                                        {selectedGenre.name}
                                    </h2>
                                    <p className="text-[10px] font-orbitron font-bold tracking-[0.3em] uppercase opacity-50 mb-8" style={{ color: selectedGenre.accent }}>
                                        {selectedGenre.genre}
                                    </p>
                                    
                                    <button 
                                        onClick={() => setSelectedGenre(null)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <ArrowLeft size={14} /> Back to Genres
                                    </button>
                                </div>

                                {/* List Section */}
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
                                        <h3 className="font-orbitron font-black text-xs tracking-[0.4em] text-[#00F3FF] uppercase flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00F3FF] shadow-[0_0_8px_#00F3FF]" />
                                            Active Arenas
                                        </h3>
                                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                            {tournaments.length} Matches Found
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 hide-scrollbar">
                                        {fetchingTournaments ? (
                                            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                                                <Loader2 size={32} className="animate-spin text-[#00F3FF]" />
                                                <p className="font-orbitron text-[10px] tracking-[0.4em] text-slate-500 uppercase">Scanning Frequencies...</p>
                                            </div>
                                        ) : tournaments.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/10 mb-2">
                                                    <Activity size={24} className="text-slate-600" />
                                                </div>
                                                <h4 className="font-orbitron text-sm font-bold text-white uppercase tracking-widest">No Live Matches</h4>
                                                <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">There are currently no active or upcoming {selectedGenre.name} tournaments to monitor.</p>
                                            </div>
                                        ) : (
                                            tournaments.map((t) => (
                                                <a
                                                    key={t._id}
                                                    href={`/observer?tournamentId=${t._id}`}
                                                    className="group flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00F3FF]/40 hover:bg-[#00F3FF]/5 transition-all duration-300"
                                                >
                                                    <div className="flex-1 w-full">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {t.status === 'LIVE' ? (
                                                                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md">
                                                                    <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest font-orbitron">LIVE</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-md">
                                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-orbitron">UPCOMING</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase">
                                                                <Calendar size={10} />
                                                                {new Date(t.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                        </div>
                                                        <h4 className="font-orbitron font-black text-lg text-white group-hover:text-[#00F3FF] transition-colors uppercase tracking-tight">
                                                            {t.title}
                                                        </h4>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <Users size={12} className="text-slate-600" />
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.slots?.booked || 0}/{t.slots?.total || 0} SEATS</span>
                                                            </div>
                                                            {t.prizePool > 0 && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Trophy size={11} className="text-[#FFB800]" />
                                                                    <span className="text-[10px] font-bold text-[#FFB800] uppercase tracking-widest">₹{t.prizePool.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 w-full md:w-auto h-12 md:h-20 md:aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-[#00F3FF] group-hover:text-black transition-all">
                                                        <Play size={24} className="ml-1 fill-current" />
                                                    </div>
                                                </a>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer hint */}
                <footer className="border-t border-white/5 px-6 py-4 flex items-center justify-center gap-2 bg-black/40">
                    <Trophy size={12} className="text-slate-600" />
                    <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Select any game to enter the live observer bracket</span>
                </footer>
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Radio, Shield, Zap, Users, Clock, Loader2, Activity, Menu, X, Eye, Target, ChevronRight, Crosshair, ChevronLeft, Home } from 'lucide-react';
import api from '../services/api';

const SYNC_INTERVAL = 3000; // 3 second polling for live score sync

// Read ?game= from URL
const getSelectedParams = () => {
    try {
        const params = new URLSearchParams(window.location.search);
        return {
            game: params.get('game') || null,
            tournamentId: params.get('tournamentId') || null
        };
    } catch { return { game: null, tournamentId: null }; }
};

export default function TournamentBracket() {
    const { game: selectedGame, tournamentId: selectedTournamentId } = getSelectedParams();
    const [flashColor, setFlashColor] = useState(null);
    const [viewerCount, setViewerCount] = useState(1240);
    const [eventLog, setEventLog] = useState([]);
    const [matches, setMatches] = useState({});
    const [teamStatus, setTeamStatus] = useState({});
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [tournamentDetails, setTournamentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── NEW: Match selection & perfect sync ──
    const [selectedMatchId, setSelectedMatchId] = useState(null); // dbId of selected match
    const [selectedMatchData, setSelectedMatchData] = useState(null); // live score data
    const [isSyncing, setIsSyncing] = useState(false);
    const syncIntervalRef = useRef(null);

    // ── Score sync: poll for selected match every 3 seconds ──
    const syncSelectedMatch = useCallback(async (dbId) => {
        if (!dbId || dbId.length < 10) return; // skip scaffold/fallback IDs
        try {
            setIsSyncing(true);
            const res = await api.get(`/tournaments/match/${dbId}`);
            setSelectedMatchData(res.data);

            // Also update the bracket state so scores stay fresh on the bracket itself
            setMatches(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(slot => {
                    if (updated[slot]?.dbId?.toString() === dbId.toString()) {
                        updated[slot] = {
                            ...updated[slot],
                            s1: res.data.s1,
                            s2: res.data.s2,
                            winner: res.data.winner,
                            status: res.data.status,
                        };
                        // Flash on score change
                        if (prev[slot]?.s1 !== res.data.s1 || prev[slot]?.s2 !== res.data.s2) {
                            setFlashColor('rgba(0, 243, 255, 0.15)');
                            setTimeout(() => setFlashColor(null), 400);
                        }
                    }
                });
                return updated;
            });
        } catch (err) {
            // Silently fail on individual poll errors
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const startSync = useCallback((dbId) => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        if (!dbId || dbId.length < 10) return;
        syncSelectedMatch(dbId); // Immediate first call
        syncIntervalRef.current = setInterval(() => syncSelectedMatch(dbId), SYNC_INTERVAL);
    }, [syncSelectedMatch]);

    const stopSync = useCallback(() => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
        }
        setSelectedMatchData(null);
        setSelectedMatchId(null);
    }, []);

    const handleMatchClick = (match) => {
        if (!match || match.t1 === 'TBD' || !match.dbId) return;
        if (selectedMatchId === match.dbId?.toString()) {
            stopSync(); // Deselect if clicking on same match
            return;
        }
        const matchId = match.dbId?.toString() || match.id?.toString();
        setSelectedMatchId(matchId);
        // Find the match data from state immediately
        const matchData = {
            t1: match.t1, s1: match.s1 ?? 0,
            t2: match.t2, s2: match.s2 ?? 0,
            winner: match.winner, status: match.status
        };
        setSelectedMatchData(matchData);
        startSync(matchId);
    };

    // ── Initial data load ──
    useEffect(() => {
        const initializeObserverData = async () => {
            const queryParams = new URLSearchParams();
            if (selectedGame) queryParams.append('game', selectedGame);
            if (selectedTournamentId) queryParams.append('tournamentId', selectedTournamentId);
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

            try {
                const [tourneyRes, bracketRes, eventRes, teamRes] = await Promise.all([
                    api.get(`/tournaments/live-info${queryString}`),
                    api.get(`/tournaments/bracket${queryString}`),
                    api.get(`/tournaments/events${queryString}`),
                    api.get(`/tournaments/teams-status${queryString}`)
                ]);

                setTournamentDetails(tourneyRes.data);
                setMatches(bracketRes.data);
                setEventLog(eventRes.data);
                setTeamStatus(teamRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load live server stats:', err);
                // Fallback mock data
                setTournamentDetails({
                    name: 'Valorant Challenger Cup', game: 'VALORANT', date: 'OCT 24, 2026',
                    prize: '₹25,000', format: 'Single Elim', slots: '8 Teams', server: 'AP-MUMBAI'
                });
                setEventLog([
                    { id: 1, text: 'Broadcast started', time: '10 mins ago' },
                    { id: 2, text: 'Group stages concluded', time: '5 mins ago' }
                ]);
                setMatches({
                    qf1: { id: 'qf1', t1: 'Nova Esports', s1: 0, t2: 'Wraith', s2: 0, winner: null, status: 'PENDING' },
                    qf2: { id: 'qf2', t1: 'Sentinels', s1: 0, t2: 'LOUD', s2: 0, winner: null, status: 'PENDING' },
                    qf3: { id: 'qf3', t1: 'Team Liquid', s1: 0, t2: 'FNATIC', s2: 0, winner: null, status: 'PENDING' },
                    qf4: { id: 'qf4', t1: 'Paper Rex', s1: 0, t2: 'DRX', s2: 0, winner: null, status: 'PENDING' },
                    sf1: { id: 'sf1', t1: 'TBD', s1: null, t2: 'TBD', s2: null, winner: null, status: 'PENDING' },
                    sf2: { id: 'sf2', t1: 'TBD', s1: null, t2: 'TBD', s2: null, winner: null, status: 'PENDING' },
                    final: { id: 'final', t1: 'TBD', s1: null, t2: 'TBD', s2: null, winner: null, status: 'PENDING' },
                    champion: null
                });
                setTeamStatus({
                    'Nova Esports': 'Active', 'Wraith': 'Active',
                    'Sentinels': 'Active', 'LOUD': 'Active',
                    'Team Liquid': 'Active', 'FNATIC': 'Active',
                    'Paper Rex': 'Active', 'DRX': 'Active'
                });
                setTimeout(() => setLoading(false), 800);
            }
        };

        initializeObserverData();
        
        // Global polling for entire bracket sync (advancements, etc)
        // Set to 5 seconds for high responsiveness per user feedback
        const globalSyncTimer = setInterval(initializeObserverData, 5000);

        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);

        // Increment viewer count slightly over time  
        const viewerTimer = setInterval(() => {
            setViewerCount(c => c + Math.floor(Math.random() * 3 - 1));
        }, 5000);

        return () => {
            clearInterval(viewerTimer);
            window.removeEventListener('mousemove', handleMouseMove);
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        };
    }, []);

    // ── Render a match card (now clickable) ──
    const renderMatch = (match, roundLabel) => {
        if (!match) return null;
        const isFinished = match.winner !== null;
        const isTBD = match.t1 === 'TBD' && match.t2 === 'TBD';
        const isSelected = selectedMatchId === (match.dbId?.toString() || match.id?.toString());
        const isLive = match.status === 'LIVE';
        const isClickable = !isTBD;

        return (
            <div className="relative w-48 xl:w-56 mb-1 last:mb-0 z-10 group glitch-hover">
                <div className="text-[10px] font-orbitron font-bold uppercase tracking-[0.4em] text-[var(--accent)] mb-1 opacity-60 group-hover:opacity-100 transition-opacity pl-1 flex items-center gap-2">
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-ping inline-block" />}
                    {roundLabel}
                </div>

                <div
                    onClick={() => isClickable && handleMatchClick(match)}
                    className={`holo-card flex flex-col rounded-2xl overflow-hidden border transition-all duration-300
                        ${isSelected
                            ? 'border-[var(--accent)] shadow-[0_0_30px_rgba(0,243,255,0.3)] scale-105'
                            : isLive
                                ? 'border-[var(--danger)]/60 shadow-[0_0_20px_rgba(255,60,90,0.12)]'
                                : isFinished
                                    ? 'border-white/10'
                                    : isTBD
                                        ? 'border-white/5 opacity-40'
                                        : 'border-[var(--success)]/30 shadow-[0_0_20px_rgba(0,255,153,0.07)]'}
                        ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                    `}
                >
                    {/* Watch indicator */}
                    {isClickable && (
                        <div className={`absolute top-1 right-1 z-20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${isSelected ? 'bg-[var(--accent)] text-black' : 'bg-white/10 text-white'}`}>
                                <Eye size={8} />
                                {isSelected ? 'WATCHING' : 'WATCH'}
                            </div>
                        </div>
                    )}

                    {/* Team 1 */}
                    <div className={`flex justify-between items-center px-5 py-2 border-b border-white/5 transition-all duration-500 ${match.winner === 't1' ? 'bg-[var(--success)]/20' : 'hover:bg-white/5'}`}>
                        <span className={`text-xs font-inter font-black tracking-widest truncate mr-2 ${match.winner === 't1' ? 'text-[var(--success)]' : match.winner === 't2' ? 'text-slate-600' : 'text-slate-200'}`}>
                            {match.t1}
                        </span>
                        <div className={`px-2.5 py-1 rounded-xl font-mono text-sm font-black transition-all ${match.winner === 't1' ? 'bg-[var(--success)] text-black shadow-[0_0_15px_var(--success)]' : 'bg-white/5 text-slate-500'}`}>
                            {match.s1 !== null ? match.s1 : '-'}
                        </div>
                    </div>

                    {/* Team 2 */}
                    <div className={`flex justify-between items-center px-5 py-2 transition-all duration-500 ${match.winner === 't2' ? 'bg-[var(--success)]/20' : 'hover:bg-white/5'}`}>
                        <span className={`text-xs font-inter font-black tracking-widest truncate mr-2 ${match.winner === 't2' ? 'text-[var(--success)]' : match.winner === 't1' ? 'text-slate-600' : 'text-slate-200'}`}>
                            {match.t2}
                        </span>
                        <div className={`px-2.5 py-1 rounded-xl font-mono text-sm font-black transition-all ${match.winner === 't2' ? 'bg-[var(--success)] text-black shadow-[0_0_15px_var(--success)]' : 'bg-white/5 text-slate-500'}`}>
                            {match.s2 !== null ? match.s2 : '-'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── Live Scoreboard Overlay rendered when a match is selected ──
    const renderLiveScoreboard = () => {
        if (!selectedMatchData) return null;
        const data = selectedMatchData;
        const isLive = data.status === 'LIVE';
        const isCompleted = data.status === 'COMPLETED';

        return (
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[200] w-[520px] max-w-[94vw] animate-in slide-in-from-bottom-4 duration-500">
                <div className="relative bg-black/90 border border-[var(--accent)]/40 rounded-2xl overflow-hidden backdrop-blur-2xl shadow-[0_0_60px_rgba(0,243,255,0.2)]">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,243,255,0.02)_2px,rgba(0,243,255,0.02)_4px)] pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[var(--danger)] animate-ping' : isCompleted ? 'bg-slate-500' : 'bg-amber-500'}`} />
                            <span className="text-[9px] font-orbitron font-black tracking-[0.4em] text-[var(--accent)] uppercase">
                                {isLive ? 'LIVE MATCH' : isCompleted ? 'MATCH CONCLUDED' : 'MATCH SELECTED'}
                            </span>
                            {isSyncing && (
                                <div className="w-3 h-3 border border-[var(--accent)]/50 border-t-[var(--accent)] rounded-full animate-spin" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] text-slate-500 font-mono">AUTO SYNC • {SYNC_INTERVAL / 1000}s</span>
                            <button
                                onClick={stopSync}
                                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Score display */}
                    <div className="px-8 py-6 flex items-center justify-between gap-4">
                        {/* Team 1 */}
                        <div className={`flex-1 flex flex-col items-center gap-2 transition-opacity ${data.winner === 't2' ? 'opacity-30' : ''}`}>
                            <span className={`text-xs font-inter font-black tracking-widest text-center ${data.winner === 't1' ? 'text-[var(--success)]' : 'text-white'}`}>
                                {data.t1}
                            </span>
                            <div className={`text-6xl font-orbitron font-black tabular-nums transition-all duration-500
                                ${data.winner === 't1' ? 'text-[var(--success)] drop-shadow-[0_0_20px_var(--success)]' : 'text-white'}`}>
                                {data.s1 ?? 0}
                            </div>
                            {data.winner === 't1' && (
                                <div className="flex items-center gap-1 text-[var(--success)] text-[9px] font-bold uppercase tracking-widest animate-in zoom-in duration-300">
                                    <Shield size={10} /> VICTOR
                                </div>
                            )}
                        </div>

                        {/* VS / Status */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <div className="text-slate-600 font-orbitron font-black text-lg tracking-widest">VS</div>
                            <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider
                                ${isLive ? 'bg-[var(--danger)]/20 text-[var(--danger)] border border-[var(--danger)]/40' :
                                  isCompleted ? 'bg-white/5 text-slate-500 border border-white/10' :
                                  'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                                {data.status || 'PENDING'}
                            </div>
                        </div>

                        {/* Team 2 */}
                        <div className={`flex-1 flex flex-col items-center gap-2 transition-opacity ${data.winner === 't1' ? 'opacity-30' : ''}`}>
                            <span className={`text-xs font-inter font-black tracking-widest text-center ${data.winner === 't2' ? 'text-[var(--success)]' : 'text-white'}`}>
                                {data.t2}
                            </span>
                            <div className={`text-6xl font-orbitron font-black tabular-nums transition-all duration-500
                                ${data.winner === 't2' ? 'text-[var(--success)] drop-shadow-[0_0_20px_var(--success)]' : 'text-white'}`}>
                                {data.s2 ?? 0}
                            </div>
                            {data.winner === 't2' && (
                                <div className="flex items-center gap-1 text-[var(--success)] text-[9px] font-bold uppercase tracking-widest animate-in zoom-in duration-300">
                                    VICTOR <Shield size={10} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer hint */}
                    <div className="px-5 py-2 border-t border-white/5 flex items-center justify-center gap-2">
                        <Crosshair size={10} className="text-slate-600" />
                        <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">
                            Click another match to switch — Click current match to deselect
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#000000] min-h-screen text-white overflow-hidden relative font-sans flex flex-col">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        :root {
            --glass-bg: rgba(10, 15, 25, 0.6);
            --glass-border: rgba(255, 255, 255, 0.1);
            --accent: #00F3FF;
            --accent-glow: transparent;
            --success: #00FF9D;
            --danger: #FF3C5A;
            --surface: #0a0c10;
            --holo-sheen: linear-gradient(135deg, transparent 45%, rgba(255, 255, 255, 0.05) 50%, transparent 55%);
        }

        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        body { background: #000000; margin: 0; overflow: hidden; }

        .parallax-container {
            position: fixed;
            inset: 0;
            z-index: 0;
        }

        .grid-layer {
            position: absolute;
            inset: -100px;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 80px 80px;
            opacity: 0.5;
        }

        .circuit-traces {
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L40 10 L40 40 L60 40 L60 10 L90 10' stroke='%2300f3ff' stroke-width='0.5' fill='none' opacity='0.2'/%3E%3C/svg%3E");
            opacity: 0.05;
            z-index: 1;
        }

        .singularity-container {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            z-index: 1;
            pointer-events: none;
        }

        .singularity-core {
            position: absolute;
            inset: 20%;
            background: radial-gradient(circle, #000 30%, rgba(0, 243, 255, 0.4) 70%, transparent 100%);
            border-radius: 50%;
            box-shadow: 0 0 100px rgba(0, 243, 255, 0.2);
            filter: blur(20px);
            animation: singularity-pulse 8s ease-in-out infinite;
        }

        .accretion-disk {
            position: absolute;
            inset: 0;
            border: 1px solid rgba(0, 243, 255, 0.1);
            border-radius: 50%;
            background: conic-gradient(from 0deg, transparent, rgba(0, 243, 255, 0.1), transparent 40%);
            animation: spin 30s linear infinite;
        }

        .accretion-disk-outer {
            position: absolute;
            inset: -50px;
            border: 1px solid rgba(255, 184, 0, 0.05);
            border-radius: 50%;
            background: conic-gradient(from 180deg, transparent, rgba(255, 184, 0, 0.05), transparent 60%);
            animation: spin-reverse 45s linear infinite;
        }

        .grid-warp {
            position: absolute;
            inset: -20%;
            background-image: 
                linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
            background-size: 80px 80px;
            mask-image: radial-gradient(circle at center, black 20%, transparent 80%);
            transform: perspective(1000px) scale(1.1);
        }

        .vignette-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, transparent 40%, #000 95%);
            z-index: 5;
            pointer-events: none;
        }

        @keyframes singularity-pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 0.4; }
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

        .particle-spiral {
            position: absolute;
            background: #fff;
            border-radius: 50%;
            pointer-events: none;
            opacity: 1;
            box-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent);
            animation: spiral-in var(--duration) linear infinite;
        }

        @keyframes spiral-in {
            0% { transform: rotate(0deg) translateX(450px) rotate(0deg) scale(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: rotate(720deg) translateX(0) rotate(-720deg) scale(1.5); opacity: 0; }
        }

        .holo-card {
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(15px);
            position: relative;
            overflow: hidden;
        }

        .holo-card:hover { background: rgba(15, 23, 42, 0.6); }

        .connector-line {
            fill: none;
            stroke: rgba(255, 255, 255, 0.1);
            stroke-width: 2;
            transition: all 1s ease;
        }

        .connector-line.active {
            stroke: var(--accent);
            stroke-width: 2.5;
            filter: drop-shadow(0 0 12px var(--accent-glow));
            opacity: 1;
        }

        .glitch-text { position: relative; display: inline-block; }
        .glitch-text::before, .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            opacity: 0.8;
        }
        .glitch-hover:hover .glitch-text::before { animation: glitch-anim 0.3s both infinite; color: var(--accent); z-index: -1; }
        .glitch-hover:hover .glitch-text::after { animation: glitch-anim 0.3s reverse both infinite; color: var(--danger); z-index: -2; }
        @keyframes glitch-anim {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .tactical-scrollbar::-webkit-scrollbar { height: 4px; background: rgba(255, 255, 255, 0.05); }
        .tactical-scrollbar::-webkit-scrollbar-thumb { background: var(--accent); box-shadow: 0 0 10px var(--accent); border-radius: 10px; }
      `}</style>

            {/* Flash Overlay */}
            {flashColor && (
                <div
                    className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ease-out"
                    style={{ backgroundColor: flashColor }}
                />
            )}

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-screen relative z-50 bg-[#000000]">
                    <Loader2 size={64} className="animate-spin text-[#00cfff] mb-6 drop-shadow-[0_0_15px_rgba(0,207,255,0.4)]" />
                    <p className="font-orbitron font-bold uppercase tracking-widest text-[#00cfff] text-xl drop-shadow-[0_0_10px_rgba(0,207,255,0.4)]">
                        Establishing Link to Live Arena...
                    </p>
                </div>
            ) : (
                <>
                    {/* BG Parallax */}
                    <div className="parallax-container" style={{ perspective: '2000px' }}>
                        {(() => {
                            const tiltX = (mousePos.y - window.innerHeight / 2) * 0.001;
                            const tiltY = (mousePos.x - window.innerWidth / 2) * -0.001;
                            return (
                                <div className="absolute inset-0 transition-transform duration-[5000ms]"
                                    style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, transformStyle: 'preserve-3d' }}>
                                    <div className="grid-layer grid-warp transition-transform duration-[5000ms] ease-out"
                                        style={{ transform: `translate3d(${(mousePos.x - window.innerWidth / 2) * 0.0005}px, ${(mousePos.y - window.innerHeight / 2) * 0.0005}px, -150px) scale(1.15)` }} />
                                    <div className="singularity-container transition-transform duration-[5000ms] ease-out"
                                        style={{ transform: `translate(-50%, -50%) translate3d(${(mousePos.x - window.innerWidth / 2) * 0.0012}px, ${(mousePos.y - window.innerHeight / 2) * 0.0012}px, 50px)` }}>
                                        <div className="accretion-disk-outer" />
                                        <div className="accretion-disk" />
                                        <div className="singularity-core" />
                                    </div>
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-[6000ms] ease-out"
                                        style={{ transform: `translate3d(${(mousePos.x - window.innerWidth / 2) * 0.002}px, ${(mousePos.y - window.innerHeight / 2) * 0.002}px, 20px)` }}>
                                        {[...Array(40)].map((_, i) => (
                                            <div key={i} className="particle-spiral"
                                                style={{ left: '50%', top: '50%', width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`, '--duration': `${Math.random() * 15 + 15}s`, animationDelay: `${-Math.random() * 30}s`, transformOrigin: 'center center' }} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="vignette-overlay" />
                        <div className="circuit-traces" />
                    </div>

                    {/* HEADER */}
                    <header className="h-20 lg:h-16 glass-panel border-b border-white/5 z-30 flex items-center justify-between px-6 lg:px-12 relative overflow-hidden">
                        <div className="flex items-center gap-4 lg:gap-8 relative z-10">
                            {/* Back to Lobby button */}
                            <a href="/watch" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-widest">
                                <ChevronLeft size={14} />
                                Lobby
                            </a>
                            {/* Home button */}
                            <a href="/" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-widest">
                                <Home size={14} />
                                Home
                            </a>
                            <button onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                                <Menu size={20} />
                            </button>
                            <div className="flex items-center gap-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(255,60,90,0.15)] animate-pulse group glitch-hover">
                                <Radio size={16} className="text-[var(--danger)]" />
                                <span className="font-orbitron font-black text-[var(--danger)] text-[10px] tracking-[0.4em] uppercase glitch-text" data-text="LIVE STREAM">LIVE STREAM</span>
                            </div>
                            <div className="glitch-hover">
                                <h1 className="font-orbitron text-base md:text-2xl lg:text-4xl font-black tracking-tighter uppercase text-white leading-none glitch-text" data-text={tournamentDetails?.name || 'Tournament Arena'}>
                                    {tournamentDetails?.name || 'Tournament Arena'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase mt-1 md:mt-2 text-slate-500">
                                    <span className="text-[var(--danger)] drop-shadow-[0_0_8px_var(--danger)]">{tournamentDetails?.game || 'GAME'}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-700 hidden md:block" />
                                    <span>{tournamentDetails?.date || 'SCHEDULED'}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-700 hidden md:block" />
                                    <span className="text-[#FFB800] flex items-center gap-1.5"><Zap size={12} className="fill-[#FFB800]" /> {tournamentDetails?.prize || '₹0'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end relative z-10">
                            {/* Hint to click matches */}
                            <div className="mb-2 hidden lg:flex items-center gap-2 text-[8px] text-slate-600 font-mono uppercase tracking-widest">
                                <Eye size={10} />
                                Click a match to watch live scores
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl">
                                <Users size={20} className="text-[var(--success)]" />
                                <span className="font-mono text-2xl font-black text-white tracking-wider leading-none">{viewerCount.toLocaleString()}</span>
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest leading-none">Active</span>
                                    <span className="text-[8px] uppercase font-bold text-[var(--success)] tracking-widest leading-none mt-0.5">Viewers</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* MAIN */}
                    <main className="flex-1 flex overflow-hidden z-20 relative">
                        {isMobileSidebarOpen && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
                                onClick={() => setIsMobileSidebarOpen(false)} />
                        )}

                        {/* LEFT SIDEBAR */}
                        <aside className={`fixed lg:relative inset-y-0 left-0 w-72 glass-panel border-r border-white/5 flex flex-col p-8 z-[100] lg:z-30 transition-all duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                            <div className="lg:hidden flex justify-end mb-4">
                                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-lg bg-white/5 text-slate-400"><X size={20} /></button>
                            </div>
                            <div className="mb-10">
                                <h3 className="font-orbitron font-black text-[10px] tracking-[0.4em] text-[var(--accent)] mb-6 uppercase flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                                    Protocol Intel
                                </h3>
                                <div className="space-y-5">
                                    {[
                                        { label: 'FORMAT', value: tournamentDetails?.format || 'N/A' },
                                        { label: 'TEAMS', value: tournamentDetails?.slots || 'N/A' },
                                        { label: 'SERVER', value: tournamentDetails?.server || 'LOCAL', color: 'text-[var(--success)]' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-500 tracking-widest">{item.label}</span>
                                            <span className={`text-xs font-black tracking-widest ${item.color || 'text-white'}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Currently watching indicator */}
                            {selectedMatchData && (
                                <div className="mb-8 p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                                    <div className="text-[9px] font-orbitron font-black tracking-widest text-[var(--accent)] mb-3 uppercase flex items-center gap-2">
                                        <Eye size={10} /> Now Watching
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-white truncate">{selectedMatchData.t1}</span>
                                        <span className="font-mono text-sm font-black text-[var(--accent)] mx-2">{selectedMatchData.s1} : {selectedMatchData.s2}</span>
                                        <span className="text-[10px] font-bold text-white truncate text-right">{selectedMatchData.t2}</span>
                                    </div>
                                    {isSyncing && <div className="mt-2 text-[8px] text-slate-500 flex items-center gap-1"><div className="w-2 h-2 border border-[var(--accent)]/40 border-t-[var(--accent)] rounded-full animate-spin" /> Syncing...</div>}
                                </div>
                            )}

                            <div className="flex-1 flex flex-col overflow-hidden">
                                <h3 className="font-orbitron font-black text-[10px] tracking-[0.4em] text-[#FFB800] mb-6 uppercase flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFB800] shadow-[0_0_8px_#FFB800]" />
                                    Live Data Feed
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-3 space-y-4 hide-scrollbar">
                                    {eventLog.map(log => (
                                        <div key={log.id} className="group cursor-default">
                                            <div className="bg-white/5 border border-white/5 p-4 rounded-xl group-hover:bg-white/10 transition-colors border-l-2 border-l-[var(--accent)]">
                                                <p className="text-[11px] font-inter font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors">{log.text}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Clock size={10} className="text-slate-500" />
                                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono">{log.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* BRACKET AREA */}
                        <div className="flex-1 relative overflow-x-auto tactical-scrollbar py-0 px-4 md:px-8 lg:px-16 flex items-center bg-black/20">
                            <div className="relative z-10 w-full max-w-[1200px] h-[450px] flex justify-between mx-auto items-stretch">
                                {/* SVG Connector Lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 450" preserveAspectRatio="none">
                                    <path d="M 224 35 L 264 35 L 264 98 L 304 98" className={`connector-line ${matches?.sf1?.t1 && matches.sf1.t1 !== 'TBD' ? 'active' : ''}`} />
                                    <path d="M 224 161 L 264 161 L 264 98 L 304 98" className={`connector-line ${matches?.sf1?.t2 && matches.sf1.t2 !== 'TBD' ? 'active' : ''}`} />
                                    <path d="M 224 288 L 264 288 L 264 352 L 304 352" className={`connector-line ${matches?.sf2?.t1 && matches.sf2.t1 !== 'TBD' ? 'active' : ''}`} />
                                    <path d="M 224 415 L 264 415 L 264 352 L 304 352" className={`connector-line ${matches?.sf2?.t2 && matches.sf2.t2 !== 'TBD' ? 'active' : ''}`} />
                                    <path d="M 528 98 L 568 98 L 568 225 L 608 225" className={`connector-line ${matches?.final?.t1 && matches.final.t1 !== 'TBD' ? 'active' : ''}`} />
                                    <path d="M 528 352 L 568 352 L 568 225 L 608 225" className={`connector-line ${matches?.final?.t2 && matches.final.t2 !== 'TBD' ? 'active' : ''}`} />
                                    <path d="M 832 225 L 940 225" className={`connector-line ${matches?.champion ? 'active' : ''}`} />
                                </svg>

                                {/* QF */}
                                <div className="flex flex-col justify-between w-48 xl:w-56" style={{ height: '450px' }}>
                                    {renderMatch(matches.qf1, 'Quarter Final 1')}
                                    {renderMatch(matches.qf2, 'Quarter Final 2')}
                                    {renderMatch(matches.qf3, 'Quarter Final 3')}
                                    {renderMatch(matches.qf4, 'Quarter Final 4')}
                                </div>

                                {/* SF */}
                                <div className="flex flex-col justify-between w-48 xl:w-56" style={{ height: '450px', paddingTop: '63px', paddingBottom: '63px' }}>
                                    {renderMatch(matches.sf1, 'Semi Final 1')}
                                    {renderMatch(matches.sf2, 'Semi Final 2')}
                                </div>

                                {/* Final */}
                                <div className="flex flex-col justify-center w-48 xl:w-56" style={{ height: '450px' }}>
                                    <div className="relative">
                                        {renderMatch(matches.final, 'Grand Final')}
                                    </div>
                                </div>

                                {/* Champion */}
                                <div className="flex flex-col justify-center w-64 xl:w-72 pl-12" style={{ height: '450px' }}>
                                    <div className="text-[10px] font-orbitron font-black uppercase tracking-[0.4em] text-[#FFB800] mb-6 text-center drop-shadow-[0_0_15px_rgba(255,184,0,0.6)] flex items-center justify-center gap-3">
                                        <Trophy size={16} className="fill-[#FFB800]" /> APEX VICTOR
                                    </div>
                                    {/* Champion PLACEHOLDER */}
                                    <div className="cyber-card flex flex-col rounded-3xl border-2 overflow-hidden border-white/5 bg-white/2 opacity-30 border-dashed">
                                        <div className="p-10 text-center flex flex-col items-center justify-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <Trophy className="text-slate-500 w-16 h-16" strokeWidth={1} />
                                                <span className="text-[10px] font-orbitron font-bold tracking-widest text-slate-600 uppercase">Awaiting Victory</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* BOTTOM: Team Status */}
                    <footer className="h-12 bg-[#020509] z-30 flex items-center px-4 overflow-hidden relative">
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 mr-8 whitespace-nowrap">
                            <Activity size={12} className="text-[#00cfff]" /> TEAM ROSTER STATUS:
                        </div>
                        <div className="flex items-center gap-4 animate-in slide-in-from-right overflow-x-auto hide-scrollbar whitespace-nowrap">
                            {Object.entries(teamStatus).map(([team, status]) => (
                                <div key={team} className="flex items-center gap-2 bg-[#07101e] border border-[#112236] px-3 py-1 rounded-sm shrink-0">
                                    {status === 'Active' ? (
                                        <><div className="w-1.5 h-1.5 rounded-full bg-[#00ff99] shadow-[0_0_5px_#00ff99] animate-pulse" /><span className="text-white text-[10px] font-bold tracking-wider">{team}</span></>
                                    ) : (
                                        <><div className="w-1.5 h-1.5 rounded-full bg-[#ff3c5a]" /><span className="text-gray-500 text-[10px] font-bold tracking-wider line-through decoration-[#ff3c5a]/50">{team}</span></>
                                    )}
                                </div>
                            ))}
                        </div>
                    </footer>

                    {/* LIVE SCOREBOARD OVERLAY */}
                    {renderLiveScoreboard()}

                    {/* FULLSCREEN CHAMPION SPLASH - Top Level for True Visibility */}
                    {matches.champion && (
                        <div className="fixed inset-0 z-[1000] bg-[#020509]/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-12 overflow-hidden animate-in fade-in duration-1000">
                            <div className="animate-in zoom-in-50 duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col items-center gap-6 p-6 text-center">
                                <div className="relative mb-6 p-16 bg-[#FFB800] rounded-[4rem] shadow-[0_0_100px_rgba(255,184,0,0.5)]">
                                    <Trophy size={80} className="text-white mx-auto drop-shadow-[0_0_20px_rgba(255,184,0,0.8)] animate-bounce" />
                                    <div className="absolute inset-[-20px] border-2 border-[#FFB800]/30 rounded-[4.5rem] animate-rotate-slow" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[#FFB800] text-xs font-black tracking-[1.2em] uppercase animate-pulse">CHAMPIONSHIP ACHIEVED</p>
                                    <h2 className="font-orbitron text-7xl md:text-9xl font-black tracking-tighter text-white uppercase drop-shadow-[0_0_60px_rgba(255,255,255,0.3)]">{matches.champion}</h2>
                                    <div className="flex items-center justify-center gap-12 pt-8">
                                        <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[#FFB800]/50 to-transparent" />
                                        <p className="text-[#FFB800]/60 text-xs font-black tracking-[0.6em] uppercase">Victory Domain Prime</p>
                                        <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-[#FFB800]/50 to-transparent" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

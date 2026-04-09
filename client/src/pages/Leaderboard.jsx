import React, { useState, useEffect } from 'react';
import { Menu, X, Trophy, Crosshair, TrendingUp, Medal, Sword, Target, Users, Crown, Scan, Aperture } from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '../utils/avatarUtils';
import Footer from '../components/Footer.jsx';

export default function Leaderboard() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Filter states
    const [activeGame, setActiveGame] = useState('Valorant');
    const [activeCategory, setActiveCategory] = useState('Players'); // Players vs Teams

    // Scroll handler for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Enforce Theme Colors
        document.documentElement.style.setProperty('--accent', '#00F3FF');
        document.documentElement.style.setProperty('--accent-glow', 'rgba(0, 243, 255, 0.25)');

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = ['Home', 'Tournaments', 'Leaderboard', 'About'];
    const games = ['Valorant', 'BGMI', 'Free Fire'];
    const categories = ['Players', 'Teams'];

    // Mock Leaderboard Data
    const leaderboards = {
        Valorant: {
            Players: [
                { rank: 1, name: 'TenZ', team: 'Sentinels', score: 9850, winRate: '68%', kd: '1.45', mainRole: 'Duelist', avatar: '/avatars/jonathan.png' },
                { rank: 2, name: 'Demon1', team: 'NRG', score: 9620, winRate: '64%', kd: '1.38', mainRole: 'Duelist', avatar: '/avatars/goblin.png' },
                { rank: 3, name: 'Alfajer', team: 'Fnatic', score: 9400, winRate: '71%', kd: '1.40', mainRole: 'Sentinel', avatar: '/avatars/scout.png' },
                { rank: 4, name: 'Leo', team: 'Fnatic', score: 9150, winRate: '70%', kd: '1.35', mainRole: 'Initiator', avatar: '' },
                { rank: 5, name: 'something', team: 'PRX', score: 8900, winRate: '65%', kd: '1.42', mainRole: 'Duelist', avatar: '' },
                { rank: 6, name: 'Derke', team: 'Fnatic', score: 8850, winRate: '69%', kd: '1.30', mainRole: 'Duelist', avatar: '' },
                { rank: 7, name: 'Aspas', team: 'Leviatán', score: 8800, winRate: '62%', kd: '1.44', mainRole: 'Duelist', avatar: '' },
                { rank: 8, name: 'Chronicle', team: 'Fnatic', score: 8750, winRate: '71%', kd: '1.28', mainRole: 'Flex', avatar: '' },
            ],
            Teams: [
                { rank: 1, name: 'Fnatic', points: 15400, wins: 42, region: 'EMEA', logo: 'FN' },
                { rank: 2, name: 'Paper Rex', points: 14200, wins: 38, region: 'Pacific', logo: 'PRX' },
                { rank: 3, name: 'Evil Geniuses', points: 13800, wins: 35, region: 'Americas', logo: 'EG' },
                { rank: 4, name: 'Sentinels', points: 12500, wins: 30, region: 'Americas', logo: 'SEN' },
                { rank: 5, name: 'LOUD', points: 12100, wins: 31, region: 'Americas', logo: 'LOD' },
            ]
        },
        BGMI: {
            Players: [
                { rank: 1, name: 'Jonathan', team: 'GodLike', score: 12500, winRate: '45%', kd: '6.2', mainRole: 'Assaulter', avatar: '/avatars/jonathan.png' },
                { rank: 2, name: 'Goblin', team: 'Team Soul', score: 11800, winRate: '42%', kd: '5.8', mainRole: 'Entry Fragger', avatar: '/avatars/goblin.png' },
                { rank: 3, name: 'Scout', team: 'TeamXSpark', score: 11200, winRate: '38%', kd: '5.1', mainRole: 'Flanker', avatar: '/avatars/scout.png' },
                { rank: 4, name: 'Mortal', team: 'Team Soul', score: 10500, winRate: '40%', kd: '4.5', mainRole: 'IGL', avatar: '' },
                { rank: 5, name: 'Snax', team: 'Velocity', score: 10100, winRate: '35%', kd: '5.3', mainRole: 'Sniper', avatar: '' },
            ],
            Teams: [
                { rank: 1, name: 'Team Soul', points: 25000, wins: 15, region: 'India', logo: 'TS' },
                { rank: 2, name: 'GodLike Esports', points: 24200, wins: 12, region: 'India', logo: 'GL' },
                { rank: 3, name: 'Blind Esports', points: 22800, wins: 14, region: 'India', logo: 'BLD' },
            ]
        },
        'Free Fire': {
            Players: [
                { rank: 1, name: 'Nobru', team: 'Fluxo', score: 15500, winRate: '52%', kd: '7.1', mainRole: 'Rusher', avatar: '/avatars/jonathan.png' },
                { rank: 2, name: 'Pahash', team: 'LOUD', score: 14800, winRate: '48%', kd: '6.5', mainRole: 'Support', avatar: '/avatars/goblin.png' },
                { rank: 3, name: 'Vincenzo', team: 'Evo', score: 14200, winRate: '50%', kd: '6.8', mainRole: 'Sniper', avatar: '/avatars/scout.png' },
                { rank: 4, name: 'White444', team: 'Independent', score: 13500, winRate: '45%', kd: '7.5', mainRole: 'Rusher', avatar: '' },
            ],
            Teams: [
                { rank: 1, name: 'EVOS Divine', points: 35000, wins: 25, region: 'Indonesia', logo: 'EVO' },
                { rank: 2, name: 'Fluxo', points: 34200, wins: 22, region: 'Brazil', logo: 'FXO' },
                { rank: 3, name: 'LOUD', points: 32800, wins: 20, region: 'Brazil', logo: 'LL' },
            ]
        }
    };

    const currentData = leaderboards[activeGame]?.[activeCategory] || [];
    const top3 = currentData.slice(0, 3);
    const remaining = currentData.slice(3);

    // Helper for Podium Heights and Colors
    const getPodiumStyles = (rank) => {
        switch (rank) {
            case 1: return { height: 'pb-8 pt-12 text-center -mt-8 relative z-20', color: '#fbbf24', bg: 'from-yellow-400/30 to-transparent', border: 'border-yellow-400/80', shadow: 'shadow-[0_0_50px_rgba(251,191,36,0.3)] md:shadow-[0_0_80px_rgba(251,191,36,0.3)]' }; // Gold
            case 2: return { height: 'pb-8 pt-8 text-center relative z-10', color: '#94a3b8', bg: 'from-slate-400/30 to-transparent', border: 'border-slate-400/80', shadow: 'shadow-[0_0_40px_rgba(148,163,184,0.25)]' }; // Silver
            case 3: return { height: 'pb-8 pt-8 text-center relative z-10', color: '#b45309', bg: 'from-amber-700/30 to-transparent', border: 'border-amber-700/80', shadow: 'shadow-[0_0_40px_rgba(180,83,9,0.25)]' }; // Bronze
            default: return {};
        }
    };

    // Reorder Top 3 for visual podium: [2nd, 1st, 3rd]
    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

    return (
        <div className="min-h-screen bg-[#020509] text-white font-sans selection:bg-[#00cfff] selection:text-black">
            {/* Styles */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
        
        .bg-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes fillBar {
          from { width: 0%; }
        }

        .animate-fill-bar {
          animation: fillBar 3s ease-out forwards;
        }

        @keyframes scan {
          0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.2; }
          50% { transform: translateY(150%) scale(1.1); opacity: 0.8; }
        }
        .scan-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, #00cfff, transparent);
          height: 2px;
          width: 100%;
          animation: scan 3s linear infinite;
        }

        @keyframes pulse-grid {
          0% { opacity: 0.05; }
          50% { opacity: 0.15; }
          100% { opacity: 0.05; }
        }
        .grid-pulse {
          animation: pulse-grid 4s ease-in-out infinite;
        }

        /* Hide scrollbar for drawer/filters */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Unified Premium Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #020509;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--accent, #00cfff);
          border: 3px solid #020509;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          filter: brightness(1.2);
          box-shadow: 0 0 15px var(--accent-glow, rgba(0, 207, 255, 0.4));
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--accent, #00cfff);
          border-radius: 10px;
        }
      `}</style>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#020509]/85 backdrop-blur-md border-b border-[#00cfff] shadow-[0_4px_30px_rgba(0,207,255,0.1)]' : 'bg-[#020509]/20 backdrop-blur-md border-b border-white/5'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <a href="/" className="font-orbitron font-black text-2xl tracking-widest text-white">
                        ELITE<span className="text-[#00cfff]">ARENA</span>
                    </a>

                    <ul className="hidden md:flex gap-8">
                        {navLinks.map((link, idx) => (
                            <li key={idx}>
                                <a href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className={`font-bold text-sm tracking-widest uppercase transition-colors relative group ${link === 'Leaderboard' ? 'text-[#00cfff]' : 'text-gray-300 hover:text-[#00cfff]'}`}>
                                    {link}
                                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#00cfff] transition-all ${link === 'Leaderboard' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden md:flex items-center gap-6">
                        <a href="/login" className="text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors">Login</a>
                        <a href="/register" className="px-6 py-2.5 border border-[#00cfff] text-[#00cfff] hover:bg-[#00cfff] hover:text-[#020509] hover:shadow-[0_0_15px_rgba(0,207,255,0.4)] transition-all font-bold text-sm tracking-widest uppercase rounded flex items-center justify-center">
                            Register
                        </a>
                    </div>

                    <button className="md:hidden text-white hover:text-[#00cfff] transition-colors" onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={28} />
                    </button>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 bg-[#020509]/95 backdrop-blur-xl z-[60] transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 flex flex-col p-8 md:hidden`}>
                <div className="flex justify-end">
                    <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#00cfff]"><X size={32} /></button>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 gap-8">
                    {navLinks.map((link, idx) => (
                        <a key={idx} href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className={`font-orbitron font-bold text-2xl tracking-widest uppercase transition-colors ${link === 'Leaderboard' ? 'text-[#00cfff]' : 'text-white hover:text-[#00cfff]'}`} onClick={() => setMobileMenuOpen(false)}>{link}</a>
                    ))}
                    <div className="w-full h-px bg-[#112236] my-4"></div>
                    <a href="/login" className="font-orbitron font-bold text-xl tracking-widest uppercase text-gray-400 hover:text-white">Login</a>
                    <a href="/register" className="font-orbitron font-bold text-xl tracking-widest uppercase text-[#00cfff] shadow-[0_0_15px_rgba(0,207,255,0.3)] border border-[#00cfff] px-12 py-3 rounded text-center">Register</a>
                </div>
            </div>

            {/* Main Content Hub */}
            <main className="pt-28 pb-24 min-h-screen bg-grid relative">
                <div className="absolute inset-0 bg-grid grid-pulse pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* Header */}
                    <div className="mb-12 border-b border-white/10 pb-8 relative text-center">
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00cfff] rounded-full filter blur-[150px] opacity-10 pointer-events-none"></div>
                        <h1 className="font-orbitron font-black text-4xl md:text-5xl lg:text-6xl tracking-wider uppercase mb-4">
                            GLOBAL <span className="text-[#00cfff]">RANKINGS</span>
                        </h1>
                        <p className="text-gray-400 font-rajdhani text-xl mx-auto max-w-2xl">
                            Track the most lethal assets in the Elite Arena. View top operators and elite squadrons across the network.
                        </p>
                    </div>

                    {/* Filtering Controls */}
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-6 mb-16">

                        {/* Game Tabs */}
                        <div className="flex bg-[#050a12] p-2 rounded-xl border border-white/5 shadow-2xl">
                            {games.map(game => (
                                <button
                                    key={game}
                                    onClick={() => setActiveGame(game)}
                                    className={`px-6 py-3 font-orbitron font-bold text-sm tracking-widest uppercase transition-all rounded-md whitespace-nowrap ${activeGame === game ? 'bg-white/10 text-[#00cfff] shadow-[0_0_15px_rgba(0,207,255,0.15)] border border-[#00cfff]/30' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                                >
                                    {game}
                                </button>
                            ))}
                        </div>

                        {/* Category Tabs */}
                        <div className="flex bg-[#050a12] p-2 rounded-xl border border-white/5 shadow-2xl">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-8 py-3 font-orbitron font-bold text-sm tracking-widest uppercase transition-all rounded-md flex items-center gap-2 ${activeCategory === cat ? 'bg-[#00cfff] text-[#020509] shadow-[0_0_20px_rgba(0,207,255,0.3)]' : 'text-gray-500 hover:text-white bg-transparent'}`}
                                >
                                    {cat === 'Players' ? <Target size={18} /> : <Users size={18} />}
                                    {cat}
                                </button>
                            ))}
                        </div>

                    </div>

                    {/* Visual Podium (Top 3) */}
                    {podiumOrder.length > 0 && (
                        <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mb-20 px-4">
                            {podiumOrder.map((item, idx) => {
                                const styles = getPodiumStyles(item.rank);
                                const isFirst = item.rank === 1;

                                return (
                                    <div key={`${activeGame}-${activeCategory}-${item.rank}`} className={`w-full md:w-1/3 max-w-[320px] bg-[#050a12]/80 backdrop-blur-md rounded-t-2xl border-t border-x ${styles.border} ${styles.shadow} ${styles.height} transition-transform duration-500 hover:-translate-y-2`}>
                                        <div className={`absolute inset-0 bg-gradient-to-b ${styles.bg} rounded-t-2xl z-0 pointer-events-none opacity-60`}></div>

                                        <div className="relative z-10 flex flex-col items-center group">
                                            <div className="relative mb-6 animate-float">
                                                {isFirst && (
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20">
                                                        <Crown size={32} />
                                                    </div>
                                                )}
                                                <div className={`${isFirst ? 'w-32 h-32 border-[5px]' : 'w-24 h-24 border-4'} rounded-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] relative overflow-hidden`} style={{ borderColor: styles.color }}>
                                                    {item.avatar || activeCategory === 'Players' ? (
                                                        <img 
                                                            src={getAvatarUrl(item.avatar.split('/').pop().replace('.png', ''))} 
                                                            onError={handleAvatarError}
                                                            alt={item.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#020509] font-orbitron font-black text-2xl" style={{ color: styles.color }}>
                                                            {item.logo || item.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {/* Scanning Effect Overlay */}
                                                    <div className="scan-overlay" />
                                                    
                                                    {/* HUD Brackets */}
                                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00cfff]/40" />
                                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00cfff]/40" />
                                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00cfff]/40" />
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00cfff]/40" />
                                                </div>
                                                <div className={`absolute ${isFirst ? '-bottom-4 w-10 h-10 text-base border-2' : '-bottom-3 w-8 h-8 text-sm border'} left-1/2 -translate-x-1/2 rounded-full bg-[#020509] flex items-center justify-center font-orbitron font-black shadow-lg z-20`} style={{ borderColor: styles.color, color: styles.color }}>
                                                    {item.rank}
                                                </div>
                                            </div>

                                            <h2 className={`font-orbitron font-black tracking-wider uppercase mb-1 ${isFirst ? 'text-3xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-2xl text-gray-200'}`}>{item.name}</h2>
                                            <p className="font-rajdhani font-bold text-[#00cfff] tracking-widest uppercase text-sm mb-6 drop-shadow-[0_0_5px_rgba(0,207,255,0.4)]">{activeCategory === 'Players' ? item.team : item.region}</p>

                                            <div className="grid grid-cols-2 gap-4 w-full px-6">
                                                <div className="bg-[#020509] p-3 rounded border border-white/5 flex flex-col items-center">
                                                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">{activeCategory === 'Players' ? 'Score' : 'Points'}</span>
                                                    <span className="font-rajdhani font-bold text-lg" style={{ color: styles.color }}>{item.score || item.points}</span>
                                                </div>
                                                <div className="bg-[#020509] p-3 rounded border border-white/5 flex flex-col items-center">
                                                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">{activeCategory === 'Players' ? 'K/D Ratio' : 'Wins'}</span>
                                                    <span className="font-rajdhani font-bold text-lg text-white">{item.kd || item.wins}</span>
                                                </div>
                                            </div>

                                            {/* Animated Power/Status Bar */}
                                            <div className="w-full mt-6 px-6">
                                                <div className="w-full h-1.5 bg-[#020509] rounded-full overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
                                                    <div
                                                        className="h-full rounded-full animate-fill-bar relative"
                                                        style={{
                                                            width: item.rank === 1 ? '100%' : item.rank === 2 ? '85%' : '70%',
                                                            backgroundColor: styles.color,
                                                            boxShadow: `0 0 10px ${styles.color}`
                                                        }}
                                                    >
                                                        {/* Animated pulse head */}
                                                        <div className="absolute top-0 right-0 w-4 h-full bg-white opacity-80 blur-[2px] rounded-r-full"></div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Detailed Data Table (Rank 4+) */}
                    {remaining.length > 0 && (
                        <div className="bg-[#050a12] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative z-10">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10 font-orbitron text-xs text-gray-400 tracking-widest uppercase">
                                            <th className="py-4 px-6 font-bold w-16 text-center">Rank</th>
                                            <th className="py-4 px-6 font-bold">{activeCategory === 'Players' ? 'Operator' : 'Squadron'}</th>
                                            <th className="py-4 px-6 font-bold">{activeCategory === 'Players' ? 'Affiliation' : 'Region'}</th>
                                            <th className="py-4 px-6 font-bold text-right">{activeCategory === 'Players' ? 'Score' : 'Points'}</th>
                                            <th className="py-4 px-6 font-bold text-right">{activeCategory === 'Players' ? 'K/D' : 'Wins'}</th>
                                            <th className="py-4 px-6 font-bold text-right">{activeCategory === 'Players' ? 'Win Rate' : ''}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {remaining.map((item) => (
                                            <tr key={item.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="py-4 px-6 text-center font-orbitron font-bold text-gray-500 group-hover:text-white transition-colors">
                                                    #{item.rank}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#020509] border border-white/10 flex items-center justify-center overflow-hidden">
                                                            <img 
                                                                src={getAvatarUrl(activeCategory === 'Players' ? (item.avatar ? item.avatar.split('/').pop().replace('.png', '') : 'generic') : '')} 
                                                                onError={handleAvatarError}
                                                                alt="" 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                            {activeCategory !== 'Players' && (
                                                                <div className="font-orbitron font-bold text-xs text-[#00cfff]">
                                                                    {item.logo}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-orbitron font-bold text-white uppercase tracking-wider">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-rajdhani font-bold text-gray-400 uppercase tracking-widest">
                                                    {activeCategory === 'Players' ? item.team : item.region}
                                                </td>
                                                <td className="py-4 px-6 font-rajdhani font-bold text-[#00cfff] text-right text-lg">
                                                    {item.score || item.points}
                                                </td>
                                                <td className="py-4 px-6 font-rajdhani font-bold text-white text-right">
                                                    {item.kd || item.wins}
                                                </td>
                                                <td className="py-4 px-6 font-rajdhani font-bold text-gray-400 text-right">
                                                    {item.winRate || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
}

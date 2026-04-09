import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Filter, Shield, Clock, Users, Trophy, Scan } from 'lucide-react';
import Footer from '../components/Footer.jsx';

export default function Tournaments() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Filter states
    const [activeGame, setActiveGame] = useState('All');
    const [activeStatus, setActiveStatus] = useState('Upcoming');

    // Handle URL Query Parameters on Load
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gameParam = params.get('game');
        if (gameParam) {
            // Capitalize first letter to match our filter states
            const formattedGame = gameParam.charAt(0).toUpperCase() + gameParam.slice(1).toLowerCase();
            if (['Valorant', 'Bgmi', 'Freefire'].includes(formattedGame)) {
                setActiveGame(formattedGame === 'Bgmi' ? 'BGMI' : formattedGame === 'Freefire' ? 'Free Fire' : formattedGame);
            }
        }
    }, []);

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
    const games = ['All', 'Valorant', 'BGMI', 'Free Fire'];
    const statuses = ['All', 'Upcoming', 'Live', 'Completed'];

    // Mock Tournament Data
    const allTournaments = [
        { id: 1, name: 'VCT Challengers Open', game: 'Valorant', status: 'Upcoming', prize: '₹5,000', slots: '15/32', date: 'Oct 24, 18:00 UTC', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', color: '#ff4655' },
        { id: 2, name: 'BGIS Grind Scrims', game: 'BGMI', status: 'Live', prize: '₹1,00,000', slots: '100/100', date: 'Oct 22, 14:00 IST', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop', color: '#f8b400' },
        { id: 3, name: 'FFWS Regional Quals', game: 'Free Fire', status: 'Upcoming', prize: '₹10,000', slots: '32/48', date: 'Nov 01, 20:00 UTC', image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop', color: '#ff6b00' },
        { id: 4, name: 'Sentinel Series #4', game: 'Valorant', status: 'Live', prize: '₹2,000', slots: '16/16', date: 'Oct 21, 15:00 UTC', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', color: '#ff4655' },
        { id: 5, name: 'Diwali Showdown', game: 'BGMI', status: 'Upcoming', prize: '₹5,00,000', slots: '45/100', date: 'Oct 30, 16:00 IST', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop', color: '#f8b400' },
        { id: 6, name: 'Booyah Masters', game: 'Free Fire', status: 'Completed', prize: '₹8,000', slots: '48/48', date: 'Oct 15, 12:00 UTC', image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop', color: '#ff6b00' },
        { id: 7, name: 'Radiant Faceoff', game: 'Valorant', status: 'Upcoming', prize: '₹1,500', slots: '24/32', date: 'Oct 28, 19:00 UTC', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', color: '#ff4655' },
        { id: 8, name: 'Underdog League', game: 'BGMI', status: 'Completed', prize: '₹50,000', slots: '100/100', date: 'Oct 10, 15:00 IST', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop', color: '#f8b400' },
    ];

    const filteredTournaments = allTournaments.filter(t => {
        const gameMatch = activeGame === 'All' || t.game === activeGame;
        const statusMatch = activeStatus === 'All' || t.status === activeStatus;
        return gameMatch && statusMatch;
    });

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

        .filter-btn-active {
          box-shadow: inset 0 -2px 0 0 #00cfff;
          background: linear-gradient(to top, rgba(0, 207, 255, 0.1), transparent);
          color: #00cfff;
        }

        /* Hide scrollbar for drawer */
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

        @keyframes scan-horizontal {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .scanning-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          background: linear-gradient(to right, transparent, rgba(0, 207, 255, 0.2), transparent);
          z-index: 30;
          transform: skewX(-20deg);
          animation: scan-horizontal 2s infinite linear;
        }
      `}</style>

            {/* Navbar (Same as Landing) */}
            <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#020509]/85 backdrop-blur-md border-b border-[#00cfff] shadow-[0_4px_30px_rgba(0,207,255,0.1)]' : 'bg-[#020509]/20 backdrop-blur-md border-b border-white/5'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <a href="/" className="font-orbitron font-black text-2xl tracking-widest text-white">
                        ELITE<span className="text-[#00cfff]">ARENA</span>
                    </a>

                    <ul className="hidden md:flex gap-8">
                        {navLinks.map((link, idx) => (
                            <li key={idx}>
                                <a href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className={`font-bold text-sm tracking-widest uppercase transition-colors relative group ${link === 'Tournaments' ? 'text-[#00cfff]' : 'text-gray-300 hover:text-[#00cfff]'}`}>
                                    {link}
                                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#00cfff] transition-all ${link === 'Tournaments' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
                        <a key={idx} href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className={`font-orbitron font-bold text-2xl tracking-widest uppercase transition-colors ${link === 'Tournaments' ? 'text-[#00cfff]' : 'text-white hover:text-[#00cfff]'}`} onClick={() => setMobileMenuOpen(false)}>{link}</a>
                    ))}
                    <div className="w-full h-px bg-[#112236] my-4"></div>
                    <a href="/login" className="font-orbitron font-bold text-xl tracking-widest uppercase text-gray-400 hover:text-white">Login</a>
                    <a href="/register" className="font-orbitron font-bold text-xl tracking-widest uppercase text-[#00cfff] shadow-[0_0_15px_rgba(0,207,255,0.3)] border border-[#00cfff] px-12 py-3 rounded text-center">Register</a>
                </div>
            </div>

            {/* Main Content Hub */}
            <main className="pt-28 pb-24 min-h-screen bg-grid">
                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* Header */}
                    <div className="mb-12 border-b border-white/10 pb-8 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00cfff] rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>
                        <h1 className="font-orbitron font-black text-4xl md:text-5xl lg:text-6xl tracking-wider uppercase mb-4">
                            ACTIVE <span className="text-[#00cfff]">DEPLOYMENTS</span>
                        </h1>
                        <p className="text-gray-400 font-rajdhani text-xl max-w-2xl">
                            Browse the official Elite Arena tournament database. Filter by jurisdiction, confirm your extraction point, and deploy.
                        </p>
                    </div>

                    {/* Filtering Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 bg-[#050a12] p-4 rounded-xl border border-white/5 shadow-2xl">

                        {/* Game Tabs */}
                        <div className="flex overflow-x-auto hide-scrollbar w-full lg:w-auto gap-2">
                            {games.map(game => (
                                <button
                                    key={game}
                                    onClick={() => setActiveGame(game)}
                                    className={`px-6 py-3 font-orbitron font-bold text-sm tracking-widest uppercase transition-all rounded-md whitespace-nowrap ${activeGame === game ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}`}
                                >
                                    {game}
                                </button>
                            ))}
                        </div>

                        {/* Status Tabs */}
                        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar">
                            {statuses.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setActiveStatus(status)}
                                    className={`px-6 py-3 font-rajdhani font-bold text-sm tracking-widest uppercase transition-all whitespace-nowrap ${activeStatus === status ? 'text-[#00cfff] border-b-2 border-[#00cfff] bg-gradient-to-t from-[#00cfff]/10 to-transparent' : 'text-gray-500 border-b-2 border-transparent hover:text-gray-300'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Search (Visual Only) */}
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="SEARCH PROTOCOL..."
                                className="w-full bg-[#020509] border border-white/10 rounded-md py-3 pl-10 pr-4 font-rajdhani tracking-widest text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00cfff] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Tournament Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredTournaments.map(tournament => (
                            <div key={tournament.id} className="group relative bg-[#050a12] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col h-full">

                                {/* Header Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a12] to-transparent z-10"></div>
                                    <img src={tournament.image} alt={tournament.name} className="w-full h-full object-cover filter grayscale-[50%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                    
                                    {/* Scanning HUD Overlay on Hover */}
                                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <div className="scanning-line" />
                                      {/* Corner Brackets */}
                                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00cfff] shadow-[0_0_10px_rgba(0,207,255,0.5)]" />
                                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00cfff] shadow-[0_0_10px_rgba(0,207,255,0.5)]" />
                                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00cfff] shadow-[0_0_10px_rgba(0,207,255,0.5)]" />
                                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00cfff] shadow-[0_0_10px_rgba(0,207,255,0.5)]" />
                                      
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-[#00cfff] font-orbitron text-[10px] tracking-[0.3em] font-black pointer-events-none">
                                        <Scan className="w-4 h-4 animate-pulse" /> SCANNING PROTOCOL
                                      </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className={`px-3 py-1 text-xs font-bold tracking-widest uppercase rounded flex items-center gap-2 
                      ${tournament.status === 'Live' ? 'bg-red-500/20 text-red-500 border border-red-500/50' :
                                                tournament.status === 'Upcoming' ? 'bg-[#00cfff]/20 text-[#00cfff] border border-[#00cfff]/50' :
                                                    'bg-gray-500/20 text-gray-400 border border-gray-500/50'}`}>
                                            {tournament.status === 'Live' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                            {tournament.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col relative z-20 -mt-8">
                                    <div className="mb-4">
                                        <span className="font-orbitron text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-[#020509] border" style={{ borderColor: tournament.color, color: tournament.color }}>
                                            {tournament.game}
                                        </span>
                                    </div>

                                    <h3 className="font-orbitron font-black text-2xl tracking-wide mb-6 group-hover:text-[#00cfff] transition-colors line-clamp-2">
                                        {tournament.name}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-[#020509] border border-white/5 flex items-center justify-center text-[#00cfff]">
                                                <Trophy size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Prize Pool</div>
                                                <div className="font-rajdhani font-bold text-lg">{tournament.prize}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-[#020509] border border-white/5 flex items-center justify-center text-gray-400">
                                                <Users size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Slots</div>
                                                <div className="font-rajdhani font-bold text-lg">{tournament.slots}</div>
                                            </div>
                                        </div>

                                        <div className="col-span-2 flex items-center gap-3 mt-2">
                                            <div className="w-10 h-10 rounded bg-[#020509] border border-white/5 flex items-center justify-center text-gray-400">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Starting Time</div>
                                                <div className="font-rajdhani font-bold text-lg">{tournament.date}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-4 border-t border-white/5 bg-[#020509]/50">
                                    <a href="/login" className="w-full block text-center font-orbitron font-bold uppercase tracking-widest text-sm py-3 rounded bg-white/5 hover:bg-[#00cfff] border border-white/10 hover:border-[#00cfff] hover:text-[#020509] transition-all duration-300">
                                        {tournament.status === 'Completed' ? 'View Results' : 'Deploy Protocol'}
                                    </a>
                                </div>

                            </div>
                        ))}

                        {filteredTournaments.length === 0 && (
                            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-[#050a12]/50">
                                <Shield size={48} className="text-gray-600 mb-4" />
                                <h3 className="font-orbitron font-bold text-xl text-gray-400 uppercase tracking-widest mb-2">No Active Deployments</h3>
                                <p className="text-gray-600">Try adjusting your filters to find other active protocols.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

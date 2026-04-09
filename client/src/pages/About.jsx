import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Sword, Trophy, Zap, Crosshair, Users, Globe, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer.jsx';

export default function About() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        .glow-text {
          text-shadow: 0 0 20px rgba(0, 207, 255, 0.5);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

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
                                <a href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className={`font-bold text-sm tracking-widest uppercase transition-colors relative group ${link === 'About' ? 'text-[#00cfff]' : 'text-gray-300 hover:text-[#00cfff]'}`}>
                                    {link}
                                    <span className={`absolute -bottom-2 left-0 h-0.5 bg-[#00cfff] transition-all ${link === 'About' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
                        <a key={idx} href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className={`font-orbitron font-bold text-2xl tracking-widest uppercase transition-colors ${link === 'About' ? 'text-[#00cfff]' : 'text-white hover:text-[#00cfff]'}`} onClick={() => setMobileMenuOpen(false)}>{link}</a>
                    ))}
                    <div className="w-full h-px bg-[#112236] my-4"></div>
                    <a href="/login" className="font-orbitron font-bold text-xl tracking-widest uppercase text-gray-400 hover:text-white">Login</a>
                    <a href="/register" className="font-orbitron font-bold text-xl tracking-widest uppercase text-[#00cfff] shadow-[0_0_15px_rgba(0,207,255,0.3)] border border-[#00cfff] px-12 py-3 rounded text-center">Register</a>
                </div>
            </div>

            <main className="pt-28 pb-24 min-h-screen bg-grid relative overflow-hidden">
                {/* Background ambient lighting */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00cfff] rounded-full filter blur-[200px] opacity-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">

                    {/* Hero Section */}
                    <div className="text-center mt-12 mb-24">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#00cfff]/30 bg-[#00cfff]/10 text-[#00cfff] mb-6 font-orbitron text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(0,207,255,0.2)]">
                            <Globe size={14} /> Protocol: Elite Arena
                        </div>
                        <h1 className="font-orbitron font-black text-5xl md:text-7xl tracking-wider uppercase mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            THE <span className="text-[#00cfff] glow-text">APEX</span> OF<br />COMPETITIVE GAMING
                        </h1>
                        <p className="text-gray-400 font-rajdhani text-xl md:text-2xl mx-auto max-w-3xl leading-relaxed">
                            Elite Arena is the world's most advanced, high-stakes military-grade tournament platform. We don't just host games; we forge legends. Stop playing for fun and start playing for legacy.
                        </p>
                    </div>

                    {/* Win to Win Mechanics Section */}
                    <div className="mb-32 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-r from-transparent via-[#00cfff]/5 to-transparent pointer-events-none"></div>

                        <div className="text-center mb-16">
                            <h2 className="font-orbitron font-black text-4xl tracking-wider uppercase mb-4 text-white">
                                <span className="text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">WIN TO WIN</span> MECHANISMS
                            </h2>
                            <p className="text-gray-400 font-rajdhani text-xl max-w-2xl mx-auto">
                                Monetize your mechanical skill. Our architecture completely reinvents the eSports economy by paying out directly to the top performers, instantly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-[#050a12] border border-white/10 rounded-xl p-8 hover:border-[#fbbf24]/50 transition-all duration-500 hover:-translate-y-2 group shadow-xl">
                                <div className="w-16 h-16 rounded bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center text-[#fbbf24] mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <Sword size={32} />
                                </div>
                                <h3 className="font-orbitron font-bold text-2xl text-white mb-4 uppercase tracking-widest">Compete</h3>
                                <p className="text-gray-400 font-rajdhani text-lg leading-relaxed">
                                    Deploy into verified, high-stakes lobbies. Crush your opponents in raw, unadulterated combat across Valorant, BGMI, and Free Fire.
                                </p>
                            </div>

                            <div className="bg-[#050a12] border border-white/10 rounded-xl p-8 hover:border-[#00cfff]/50 transition-all duration-500 hover:-translate-y-2 group shadow-xl animate-float" style={{ animationDelay: '0s' }}>
                                <div className="w-16 h-16 rounded bg-[#00cfff]/10 border border-[#00cfff]/30 flex items-center justify-center text-[#00cfff] mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(0,207,255,0.2)]">
                                    <Trophy size={32} />
                                </div>
                                <h3 className="font-orbitron font-bold text-2xl text-white mb-4 uppercase tracking-widest">Dominate</h3>
                                <p className="text-gray-400 font-rajdhani text-lg leading-relaxed">
                                    Climb the global leaderboard. Earn your rank, prove your superiority, and solidify your legacy among the world's most lethal operators.
                                </p>
                            </div>

                            <div className="bg-[#050a12] border border-white/10 rounded-xl p-8 hover:border-[#10b981]/50 transition-all duration-500 hover:-translate-y-2 group shadow-xl">
                                <div className="w-16 h-16 rounded bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <Zap size={32} />
                                </div>
                                <h3 className="font-orbitron font-bold text-2xl text-white mb-4 uppercase tracking-widest">Monetize</h3>
                                <p className="text-gray-400 font-rajdhani text-lg leading-relaxed">
                                    Cash out instantly. We distribute massive prize pools securely and immediately upon extraction from the protocol. No delays.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Platform Features */}
                    <div className="mb-24">
                        <div className="flex items-center gap-4 mb-12">
                            <h2 className="font-orbitron font-black text-3xl tracking-wider uppercase text-white">System <span className="text-[#00cfff]">Specs</span></h2>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1 text-gray-500">
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h4 className="font-orbitron font-bold text-xl uppercase tracking-widest text-[#00cfff] mb-2">Vanguard Anti-Cheat Integration</h4>
                                    <p className="text-gray-400 font-rajdhani text-lg">Military-grade telemetry tracking and AI-driven behavior analysis ensures a completely sterile, manipulation-free combat environment.</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1 text-gray-500">
                                    <Crosshair size={32} />
                                </div>
                                <div>
                                    <h4 className="font-orbitron font-bold text-xl uppercase tracking-widest text-[#00cfff] mb-2">Automated Bracket Dynamics</h4>
                                    <p className="text-gray-400 font-rajdhani text-lg">Our server infrastructure automatically handles match pairings, result verifications, and bracket progression without human intervention.</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1 text-gray-500">
                                    <Users size={32} />
                                </div>
                                <div>
                                    <h4 className="font-orbitron font-bold text-xl uppercase tracking-widest text-[#00cfff] mb-2">Global Squadron Support</h4>
                                    <p className="text-gray-400 font-rajdhani text-lg">Build your roster. We offer deep team management tools, analytical dashboards, and direct team-to-team challenging mechanisms.</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 mt-1 text-gray-500">
                                    <Globe size={32} />
                                </div>
                                <div>
                                    <h4 className="font-orbitron font-bold text-xl uppercase tracking-widest text-[#00cfff] mb-2">Cross-Regional Latency Optimization</h4>
                                    <p className="text-gray-400 font-rajdhani text-lg">We route traffic through dedicated gaming spines to strictly minimize ping discrepancies across international deployments.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-[#050a12] border border-[#00cfff]/30 rounded-2xl p-12 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,207,255,0.1)]">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop')] opacity-[0.03] bg-cover bg-center pointer-events-none"></div>

                        <h2 className="relative z-10 font-orbitron font-black text-4xl tracking-wider uppercase mb-6 drop-shadow-lg">
                            PREPARE FOR <span className="text-[#00cfff]">DEPLOYMENT</span>
                        </h2>
                        <p className="relative z-10 text-gray-400 font-rajdhani text-xl mb-10 max-w-2xl mx-auto">
                            The arena is open. Sign up now, verify your identity, and get your clearance code to enter the highest tier of competitive gaming.
                        </p>

                        <a href="/register" className="relative z-10 inline-flex items-center gap-3 bg-white text-[#020509] hover:bg-[#00cfff] hover:shadow-[0_0_30px_rgba(0,207,255,0.5)] transition-all duration-300 px-10 py-4 font-orbitron font-black text-xl tracking-widest uppercase rounded">
                            INITIATE REGISTRATION <ChevronRight size={24} />
                        </a>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

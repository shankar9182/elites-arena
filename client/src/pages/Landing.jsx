import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Trophy, Crown, ShieldCheck, Zap } from 'lucide-react';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const titleCardRef = useRef(null);

  // Stats Counters state
  const [counters, setCounters] = useState({
    players: 0,
    tournaments: 0,
    prize: 0,
    active: 0
  });

  // THEME STATE
  useEffect(() => {
    const savedSettings = localStorage.getItem('elite_settings');
    let savedTheme = 'cyan';
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        savedTheme = parsed.theme || 'cyan';
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    const themes = {
      cyan: { accent: '#00F3FF', glow: 'rgba(0, 243, 255, 0.25)' },
      red: { accent: '#FF0055', glow: 'rgba(255, 0, 85, 0.25)' },
      gold: { accent: '#F59E0B', glow: 'rgba(245, 158, 11, 0.25)' },
      purple: { accent: '#7C3AED', glow: 'rgba(124, 58, 237, 0.25)' }
    };
    const currentTheme = themes[savedTheme.toLowerCase()] || themes.cyan;
    
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--accent-glow', currentTheme.glow);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse Parallax Track
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Title Card Scroll Reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setCardsRevealed(true);
        // keep observing if we want it to react multiple times, but let's reveal once
      }
    }, { threshold: 0.2 });

    if (titleCardRef.current) observer.observe(titleCardRef.current);
    return () => observer.disconnect();
  }, []);

  // Intersection Observer for Counters
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('stats-section');
    if (statsSection) observer.observe(statsSection);

    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const targets = { players: 1500000, tournaments: 2450, prize: 850000, active: 12453 };
    const duration = 2000;
    const frames = 60;
    const increment = {
      players: targets.players / (duration / (1000 / frames)),
      tournaments: targets.tournaments / (duration / (1000 / frames)),
      prize: targets.prize / (duration / (1000 / frames)),
      active: targets.active / (duration / (1000 / frames)),
    };

    let current = { players: 0, tournaments: 0, prize: 0, active: 0 };

    const update = () => {
      let keepGoing = false;
      const nextCounts = { ...current };

      Object.keys(targets).forEach(key => {
        if (current[key] < targets[key]) {
          nextCounts[key] = Math.min(current[key] + increment[key], targets[key]);
          keepGoing = true;
        }
      });

      current = nextCounts;
      setCounters({
        players: Math.floor(nextCounts.players),
        tournaments: Math.floor(nextCounts.tournaments),
        prize: Math.floor(nextCounts.prize),
        active: Math.floor(nextCounts.active)
      });

      if (keepGoing) requestAnimationFrame(update);
    };
    update();
  };

  const navLinks = ['Home', 'Tournaments', 'Leaderboard', 'About'];

  return (
    <div className="min-h-screen bg-[#020509] text-white font-sans overflow-x-hidden selection:bg-[#00cfff] selection:text-black">
      {/* Dynamic Style block for Orbitron and Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        
        .bg-layer-stars {
          background: radial-gradient(circle at center, transparent 0%, #020509 100%), 
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23020509"/><circle cx="20" cy="20" r="1.5" fill="white" opacity="0.3"/><circle cx="150" cy="80" r="1" fill="white" opacity="0.5"/><circle cx="300" cy="40" r="2" fill="var(--accent)" opacity="0.4"/><circle cx="350" cy="200" r="1" fill="white" opacity="0.2"/><circle cx="80" cy="300" r="1.5" fill="white" opacity="0.6"/><circle cx="250" cy="350" r="1" fill="white" opacity="0.3"/></svg>');
          animation: parallaxStars 100s linear infinite;
        }

        @keyframes parallaxStars {
          from { background-position: 0 0; }
          to { background-position: -1000px 500px; }
        }

        .bg-layer-particles {
          background-image: radial-gradient(circle, var(--accent) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.1;
        }

        @keyframes slowGlow {
          0%, 100% { opacity: 0.5; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 0.8; transform: scale(1.05) translate(-48%, -48%); }
        }

        .hero-glow-field {
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          filter: blur(40px);
          animation: slowGlow 8s ease-in-out infinite;
        }

        .word-stagger > span {
          display: inline-block;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.8s forwards;
        }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scrollTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }

        .animate-ticker {
          animation: scrollTicker 30s linear infinite;
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
          background: var(--accent);
          border: 3px solid #020509;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          filter: brightness(1.2);
          box-shadow: 0 0 15px var(--accent-glow);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 10px;
        }

        /* Brand Reveal Effect */
        @keyframes revealBrand {
          0% { width: 0; opacity: 0; }
          100% { width: 100%; opacity: 1; }
        }

        .revealing-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          animation: revealBrand 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
      `}</style>

      {!introFinished && (
        <BrandedIntro onComplete={() => setIntroFinished(true)} />
      )}

      {/* 1. Global Cursor Glint Effect */}
      <div
        className="pointer-events-none fixed z-[100] w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
        style={{
          left: `${(mousePos.x + 1) / 2 * window.innerWidth}px`,
          top: `${(mousePos.y + 1) / 2 * window.innerHeight}px`,
          background: 'radial-gradient(circle, var(--accent-glow) 0%, rgba(0,207,255,0) 60%)',
          mixBlendMode: 'screen'
        }}
      ></div>

      {/* 2. Glassmorphism Sticky Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#020509]/85 backdrop-blur-md border-b border-[var(--accent)] shadow-[0_4px_30px_var(--accent-glow)]' : 'bg-[#020509]/20 backdrop-blur-md border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <a href="#" className="font-orbitron font-black text-2xl tracking-widest text-white">
            ELITE<span className="text-[var(--accent)]">ARENA</span>
          </a>

          <ul className="hidden md:flex gap-8">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className="text-gray-300 hover:text-[#00cfff] font-bold text-sm tracking-widest uppercase transition-colors relative group">
                  {link}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-6">
            <a href="/login" className="text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors">Login</a>
            <a href="/register" className="px-6 py-2.5 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#020509] hover:shadow-[0_0_15px_var(--accent-glow)] transition-all font-bold text-sm tracking-widest uppercase rounded flex items-center justify-center">
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
            <a key={idx} href={link === 'Home' ? '/' : link === 'Tournaments' ? '/tournaments' : link === 'Leaderboard' ? '/leaderboard' : '/about'} className="font-orbitron font-bold text-2xl tracking-widest uppercase text-white hover:text-[#00cfff] transition-colors" onClick={() => setMobileMenuOpen(false)}>{link}</a>
          ))}
          <div className="w-full h-px bg-[#112236] my-4"></div>
          <a href="/login" className="font-orbitron font-bold text-xl tracking-widest uppercase text-gray-400 hover:text-white">Login</a>
          <a href="/register" className="font-orbitron font-bold text-xl tracking-widest uppercase text-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)] border border-[var(--accent)] px-12 py-3 rounded text-center">Register</a>
        </div>
      </div>

      {/* 2. Cinematic Hero Section */}
      <header className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Layered Depth Backgrounds */}
        <div className="absolute inset-0 bg-layer-stars z-0"></div>
        <div className="absolute inset-0 bg-layer-particles z-10"></div>
        <div className="absolute top-1/2 left-1/2 w-[60vw] h-[60vw] hero-glow-field z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>

        {/* Foreground Content */}
        <div className="relative z-30 max-w-5xl mx-auto px-6 text-center mt-12">
          <h1 className="font-orbitron font-black text-5xl md:text-7xl lg:text-8xl tracking-wider uppercase mb-6 leading-tight flex flex-wrap justify-center gap-x-4 gap-y-2 word-stagger">
            {'Forge Your Legend In The Arena'.split(' ').map((word, i) => (
              <span key={i} style={{ animationDelay: `${0.2 + (i * 0.15)}s` }}>{word}</span>
            ))}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl md:max-w-2xl mx-auto mb-10 tracking-wide font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 fill-mode-both">
            Where champions rise and legends are made. Compete in elite tournaments across the most competitive titles.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 fill-mode-both">
            <a href="/register" className="bg-[var(--accent)] text-[#020509] px-10 py-4 font-bold tracking-widest uppercase text-sm rounded shadow-[0_0_20px_var(--accent-glow)] hover:shadow-[0_0_40px_var(--accent-glow)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto overflow-hidden relative group">
              <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-[100%] transition-all duration-500 ease-in-out"></div>
              Enter the Arena
            </a>
            <a href="/watch" className="border border-white/30 hover:border-white text-white bg-transparent px-10 py-4 font-bold tracking-widest uppercase text-sm rounded hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
              Watch Live
            </a>
          </div>
        </div>
      </header >

      {/* 3. Now Live Marquee Ticker */}
      < div className="w-full bg-[#050a12] border-y border-[var(--accent)]/20 h-14 flex overflow-hidden relative z-30" >
        <div className="bg-[var(--accent)] text-[#020509] font-black uppercase tracking-widest px-6 flex items-center relative z-10 whitespace-nowrap">
          NOW LIVE
          <div className="absolute right-[-14px] top-0 w-0 h-0 border-t-[28px] border-t-transparent border-b-[28px] border-b-transparent border-l-[14px] border-l-[var(--accent)]"></div>
        </div>
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap pl-4 w-[200%]">
            {[1, 2].map((group) => (
              <div key={group} className="flex min-w-full justify-around items-center">
                <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_var(--accent-glow)] mx-8">• Valorant Pro League Season 5</span>
                <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_var(--accent-glow)] mx-8">• BGMI Masters Series Playoffs</span>
                <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_var(--accent-glow)] mx-8">• FreeFire World Clash Finals</span>
                <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-sm drop-shadow-[0_0_8px_var(--accent-glow)] mx-8">• Apex Legends ALGS Qualifiers</span>
              </div>
            ))}
          </div>
        </div>
      </div >

      {/* 4. Game Cards Section & Title Card */}
      < section
        ref={titleCardRef}
        className={`py-24 px-6 max-w-7xl mx-auto relative z-30 transition-all duration-1000 ease-out transform ${cardsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
      >
        <div
          className="text-center mb-16 transition-transform duration-200 ease-out"
          style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -5}deg) rotateY(${mousePos.x * 5}deg)` }}
        >
          <div className="inline-block p-8 rounded-2xl bg-[#050a12]/80 border border-[#00cfff]/20 shadow-[0_0_40px_rgba(0,207,255,0.15)] backdrop-blur-md hover:shadow-[0_0_60px_rgba(0,207,255,0.3)] hover:border-[#00cfff]/50 transition-all duration-500">
            <h4 className="font-orbitron font-black text-4xl md:text-5xl uppercase tracking-wider">
              Select Your <span className="text-[var(--accent)] drop-shadow-[0_0_15px_var(--accent-glow)]">Battleground</span>
            </h4>
            <div className="h-1 w-24 bg-[var(--accent)] mx-auto mt-6 rounded-full shadow-[0_0_10px_var(--accent-glow)]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">

          {/* Valorant Card */}
          <div style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -10}deg) rotateY(${mousePos.x * 10}deg)`, filter: `drop-shadow(${-mousePos.x * 20}px ${-mousePos.y * 20}px 30px rgba(255, 70, 85, 0.4))` }} className="transition-all duration-200 ease-out w-full max-w-[380px]">
            <div className="group relative w-full h-[500px] bg-[#050a12] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-4 hover:border-[#ff4655]/50 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale-[80%] group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020509] via-[#020509]/40 to-transparent group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col z-10">
                <h3 className="font-orbitron font-black text-4xl tracking-wider text-white uppercase translate-y-8 group-hover:translate-y-0 transition-transform duration-500">Valorant</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-75 mb-4">Tactical 5v5 FPS</p>
                <a href="/tournaments?game=valorant" className="w-full block text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold uppercase tracking-widest py-3 rounded text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#ff4655] hover:border-[#ff4655] transition-all duration-500 delay-150">
                  View Tournaments
                </a>
              </div>
            </div>
          </div>

          {/* BGMI Card */}
          <div style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -10}deg) rotateY(${mousePos.x * 10}deg)`, filter: `drop-shadow(${-mousePos.x * 20}px ${-mousePos.y * 20}px 30px rgba(248, 180, 0, 0.4))` }} className="transition-all duration-200 ease-out w-full max-w-[380px]">
            <div className="group relative w-full h-[500px] bg-[#050a12] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-4 hover:border-[#f8b400]/50 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] delay-100">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale-[80%] group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020509] via-[#020509]/40 to-transparent group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col z-10">
                <h3 className="font-orbitron font-black text-4xl tracking-wider text-white uppercase translate-y-8 group-hover:translate-y-0 transition-transform duration-500">BGMI</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-75 mb-4">Battle Royale</p>
                <a href="/tournaments?game=bgmi" className="w-full block text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold uppercase tracking-widest py-3 rounded text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#f8b400] hover:text-black hover:border-[#f8b400] transition-all duration-500 delay-150">
                  View Tournaments
                </a>
              </div>
            </div>
          </div>

          {/* FreeFire Card */}
          <div style={{ transform: `perspective(1000px) rotateX(${mousePos.y * -10}deg) rotateY(${mousePos.x * 10}deg)`, filter: `drop-shadow(${-mousePos.x * 20}px ${-mousePos.y * 20}px 30px rgba(255, 107, 0, 0.4))` }} className="transition-all duration-200 ease-out w-full max-w-[380px]">
            <div className="group relative w-full h-[500px] bg-[#050a12] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-4 hover:border-[#ff6b00]/50 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] delay-200">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale-[80%] group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#020509] via-[#020509]/40 to-transparent group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col z-10">
                <h3 className="font-orbitron font-black text-4xl tracking-wider text-white uppercase translate-y-8 group-hover:translate-y-0 transition-transform duration-500">Free Fire</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-75 mb-4">Survival Shooter</p>
                <a href="/tournaments?game=freefire" className="w-full block text-center bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold uppercase tracking-widest py-3 rounded text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#ff6b00] hover:border-[#ff6b00] transition-all duration-500 delay-150">
                  View Tournaments
                </a>
              </div>
            </div>
          </div>

        </div>
      </section >

      <section id="stats-section" className="bg-white/5 border-y border-white/10 py-16 relative z-30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:divide-x divide-white/10">
          <div className="text-center px-4">
            <h4 className="font-orbitron font-black text-3xl sm:text-4xl lg:text-3xl xl:text-5xl text-[var(--accent)] drop-shadow-[0_0_15px_var(--accent-glow)] mb-2 tracking-tight">
              {counters.players.toLocaleString()}
            </h4>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs sm:text-sm">Total Players</p>
          </div>
          <div className="text-center px-4 border-t border-white/5 pt-8 sm:border-t-0 sm:pt-0">
            <h4 className="font-orbitron font-black text-3xl sm:text-4xl lg:text-3xl xl:text-5xl text-[var(--accent)] drop-shadow-[0_0_15px_var(--accent-glow)] mb-2 tracking-tight">
              {counters.tournaments.toLocaleString()}
            </h4>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs sm:text-sm">Tournaments Hosted</p>
          </div>
          <div className="text-center px-4 border-t border-white/5 pt-8 lg:border-t-0 lg:pt-0">
            <h4 className="font-orbitron font-black text-3xl sm:text-4xl lg:text-3xl xl:text-5xl text-[var(--accent)] drop-shadow-[0_0_15px_var(--accent-glow)] mb-2 tracking-tight">
              ₹{counters.prize.toLocaleString()}
            </h4>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs sm:text-sm">Prize Distributed</p>
          </div>
          <div className="text-center px-4 border-t border-white/5 pt-8 lg:border-t-0 lg:pt-0">
            <h4 className="font-orbitron font-black text-3xl sm:text-4xl lg:text-3xl xl:text-5xl text-[var(--accent)] drop-shadow-[0_0_15px_var(--accent-glow)] mb-2 tracking-tight">
              {counters.active.toLocaleString()}
            </h4>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs sm:text-sm">Active Now</p>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-[#020509]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <Trophy size={16} className="text-amber-500" />
              <span className="font-mono text-[10px] text-amber-500 font-black uppercase tracking-[0.4em]">Sacred Grounds</span>
            </div>
            <h2 className="font-orbitron font-black text-5xl md:text-7xl text-white uppercase tracking-tighter mb-6 leading-none">
              Hall of <span className="text-[var(--accent)]">Fame</span>
            </h2>
            <p className="text-gray-400 font-inter max-w-2xl mx-auto text-lg leading-relaxed">
              Every season, only the most elite operatives ascend to the summit. These are the legends who dominated the arena and secured the ultimate bounty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {/* Second Place */}
            <div className="order-2 md:order-1 group">
              <div className="relative p-1 rounded-3xl bg-gradient-to-t from-slate-400/20 to-transparent hover:from-slate-400/40 transition-all duration-700">
                <div className="glass-panel rounded-[2rem] p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-[#0a1220] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                      <img src="/avatars/warrior.png" alt="Wraith" className="w-20 h-20 object-cover rounded-xl" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-400/10 rounded-lg mb-4">
                      <ShieldCheck size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Rank #2</span>
                    </div>
                    <h4 className="font-orbitron font-black text-2xl text-white uppercase mb-1">Vanguard Alpha</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Wraith Consortium</p>
                    <div className="h-px bg-white/10 w-full mb-6" />
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Prize Won</span>
                      <span className="text-white">₹7,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* First Place */}
            <div className="order-1 md:order-2 group z-20 md:-translate-y-8">
              <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-t from-amber-500/30 via-amber-500/5 to-transparent hover:from-amber-500/50 transition-all duration-700 shadow-2xl shadow-amber-500/10">
                <div className="glass-panel rounded-[2.4rem] p-10 text-center relative overflow-hidden border-amber-500/20">
                  <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center">
                      <Crown size={32} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] mb-2" />
                      <div className="h-4 w-px bg-amber-500" />
                    </div>
                    
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-[#0a1220] border-2 border-amber-500/30 flex items-center justify-center mb-8 relative group-hover:scale-110 transition-transform duration-500">
                       <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                       <img src="/avatars/samurai.png" alt="Sentinels" className="w-28 h-28 relative z-10 object-cover rounded-2xl" />
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 rounded-xl mb-6 border border-amber-500/30">
                      <Zap size={14} className="text-amber-500 animate-pulse" />
                      <span className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] font-mono">Season Winner</span>
                    </div>
                    
                    <h4 className="font-orbitron font-black text-4xl text-white uppercase tracking-tighter mb-2">Alpha Centauri</h4>
                    <p className="text-amber-500/60 text-xs font-bold uppercase tracking-[0.4em] mb-8">SENTINELS DIVISION</p>
                    
                    <div className="h-px bg-white/10 w-full mb-8" />
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Season Bounty</span>
                      <span className="text-amber-500 font-orbitron font-black text-xl">₹15,000</span>
                    </div>
                    
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Place */}
            <div className="order-3 group">
              <div className="relative p-1 rounded-3xl bg-gradient-to-t from-orange-400/20 to-transparent hover:from-orange-400/40 transition-all duration-700">
                <div className="glass-panel rounded-[2rem] p-8 text-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-[#0a1220] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                      <img src="/avatars/hunter.png" alt="LOUD" className="w-20 h-20 object-cover rounded-xl" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-400/10 rounded-lg mb-4">
                      <ShieldCheck size={14} className="text-orange-400" />
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest font-mono">Rank #3</span>
                    </div>
                    <h4 className="font-orbitron font-black text-2xl text-white uppercase mb-1">Rogue Shadow</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">LOUD SQUADRON</p>
                    <div className="h-px bg-white/10 w-full mb-6" />
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Prize Won</span>
                      <span className="text-white">₹3,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.5em] mb-4">Elite's Arena Protocol</p>
            <div className="flex justify-center gap-1 opacity-20">
               {[...Array(20)].map((_, i) => (
                 <div key={i} className="w-1 h-3 bg-white" />
               ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div >
  );
}

// ── Premium Branded Intro Sequence ──
const BrandedIntro = ({ onComplete }) => {
  const [percent, setPercent] = React.useState(0);
  const [text, setText] = React.useState('');
  const fullText = "INITIALIZING ELITE ARENA PROTOCOL >> ACCESS GRANTED";
  
  React.useEffect(() => {
    // Simulated Progress tracking
    const interval = setInterval(() => {
      setPercent(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1200);
          return 100;
        }
        return p + Math.floor(Math.random() * 8 + 3);
      });
    }, 100);

    // Terminal typing effect
    let i = 0;
    const textInterval = setInterval(() => {
      setText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(textInterval);
    }, 40);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020509] flex flex-col items-center justify-center font-orbitron overflow-hidden">
        {/* Digital distortion/noise grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(var(--accent) 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
        
        {/* Animated scanline */}
        <div className="absolute inset-x-0 h-px bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-scanline pointer-events-none z-10" />

        <div className="relative z-20 w-full max-w-md px-10 flex flex-col items-center text-center">
            {/* Status Header */}
            <div className="w-full mb-6 flex items-center justify-between text-[10px] tracking-[0.5em] text-[var(--accent)] font-black uppercase opacity-70">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                    SYSTEM_BOOT
                </div>
                <span>CORE_INIT: {percent}%</span>
            </div>
            
            {/* Progress Bar Container */}
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-10 border border-white/5 p-0.5 relative">
                <div className="h-full bg-gradient-to-r from-[var(--accent)] to-white transition-all duration-500 ease-out shadow-[0_0_20px_var(--accent-glow)] rounded-full" 
                     style={{ width: `${percent}%` }}></div>
            </div>
            
            {/* Terminal Output */}
            <div className="w-full text-[10px] font-mono text-slate-500 tracking-[0.3em] h-6 flex items-center justify-center">
                <span className="whitespace-pre">{text}</span>
                <span className="w-1.5 h-4 bg-[var(--accent)] ml-2 animate-pulse" />
            </div>

            {/* Brand Reveal */}
            <div className="mt-16 flex flex-col items-center">
                <h1 className="text-5xl md:text-6xl font-black tracking-[0.5em] text-white select-none revealing-text flex justify-center">
                    ELITE<span className="text-[var(--accent)] drop-shadow-[0_0_20px_var(--accent-glow)]">ARENA</span>
                </h1>
                <div className="mt-4 text-[9px] tracking-[1em] text-slate-400 font-bold uppercase opacity-0 animate-in fade-in duration-1000 delay-1000 fill-mode-both">
                    Universal Tournament Protocol
                </div>
            </div>
        </div>

        {/* Global style for intro animations */}
        <style>{`
          @keyframes scanline {
            0% { top: -10%; opacity: 0; }
            50% { opacity: 0.5; }
            100% { top: 110%; opacity: 0; }
          }
          .animate-scanline {
            animation: scanline 3s linear infinite;
          }
        `}</style>
    </div>
  );
};

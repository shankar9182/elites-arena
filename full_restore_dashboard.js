const fs = require('fs');
const filePath = 'd:/elites arena/client/src/pages/PlayerDashboard.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const overviewStart = content.indexOf("{activeNav === 'Overview' && (");
const bookSlotsEndMarker = "})()}"; 
const nextBlockStart = content.indexOf("{/* PLAYER IDENTITY MODAL */}");
const bookSlotsEnd = content.lastIndexOf(bookSlotsEndMarker, nextBlockStart) + bookSlotsEndMarker.length;

if (overviewStart === -1 || bookSlotsEnd === -1 || nextBlockStart === -1) {
    console.error("Could not find markers!", { overviewStart, bookSlotsEnd, nextBlockStart });
    process.exit(1);
}

const componentStart = content.indexOf("const PlayerDashboard = () => {");
if (componentStart === -1) {
    console.error("Could not find component start!");
    process.exit(1);
}

const newHead = `import { authAPI, tournamentAPI, requestAPI, notificationAPI } from '../services/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity, Trophy, Users, Key, LayoutGrid, Settings,
    Bell, ShieldAlert, Plus, Minus, Search, Filter, Edit2,
    Trash2, X, CheckCircle2, XCircle, Crown, Clock, Eye, Download, Share2, 
    ChevronRight, ChevronDown, Zap, Target, Calendar, ChevronLeft, LogOut, Loader2, Menu,
    Info, Mail, Send
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
};\n\n`;

const preContent = content.substring(componentStart, overviewStart);
const tail = content.substring(bookSlotsEnd);

const overviewContent = `                {activeNav === 'Overview' && (
                    <>
                        {/* 2. STATS OVERVIEW */}
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="premium-card rounded-3xl p-8 group hover:bg-white/[0.04]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={\`w-14 h-14 rounded-2xl bg-\${stat.color}-500/10 flex items-center justify-center text-\${stat.color}-500\`}>
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
                                                        <code className={\`font-mono-premium text-2xl font-black tracking-[0.2em] transition-all duration-500 \${revealKey ? 'text-[var(--accent)] blur-0 drop-shadow-[0_0_8px_var(--accent-glow)]' : 'text-slate-800 blur-md select-none'}\`}>
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
                                                <span className="text-[var(--accent)] font-bold">{\`\${t.slots?.booked || 0}/\${t.slots?.total || 0}\`}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full accent-gradient rounded-full w-2/3 group-hover:w-3/4 transition-all duration-1000 shadow-[0_0_10px_rgba(0,243,255,0.4)]" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group-hover:bg-cyan-500/5 transition-all">
                                                <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Fee</p>
                                                <p className="font-outfit font-black text-[var(--success)] text-sm">{t.entryFee === 0 ? 'FREE' : \`₹\${t.entryFee}\`}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group-hover:bg-cyan-500/5 transition-all">
                                                <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Yield</p>
                                                <p className="font-outfit font-black text-[var(--accent)] text-sm uppercase">{\`₹\${t.prizePool || t.prize}\`}</p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleReserveSlot(t._id || t.id)}
                                            disabled={isBooked}
                                            className={\`w-full py-5 border border-white/5 font-outfit font-black text-[10px] tracking-[0.3em] rounded-2xl transition-all uppercase shadow-lg \${
                                                isBooked 
                                                ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30 cursor-default' 
                                                : 'bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] group-hover:shadow-cyan-500/20'
                                            }\`}
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
                                                style={{ width: \`\${(earnedByCat(cat) / (totalByCat(cat) || 1)) * 100}%\` }}
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
                                            className={\`premium-card achievement-light-effect rounded-[2.5rem] overflow-hidden group cursor-pointer transition-all duration-500 
                                                \${isSelected ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_40px_rgba(168,85,247,0.1)] scale-[1.02]' : 'hover:border-white/10'}
                                                \${!item.earned ? 'opacity-60' : ''}\`}
                                        >
                                            <div className="p-8 space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <div className={\`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest 
                                                        \${item.rarity === 'Legendary' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 
                                                          item.rarity === 'Epic' ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' : 
                                                          'bg-slate-500/10 border-slate-500/30 text-slate-400'}\`}>
                                                        {item.rarity}
                                                    </div>
                                                    <span className="font-mono-premium text-[8px] text-slate-600 uppercase tracking-widest font-bold">{item.category}</span>
                                                </div>

                                                <div className="flex justify-center py-4">
                                                    <div className={\`w-24 h-24 rounded-full flex items-center justify-center text-4xl relative
                                                        \${item.earned ? 'bg-white/5 shadow-inner' : 'grayscale opacity-40'}\`}>
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
                                                        {item.earned ? \`Unlocked \${item.date}\` : 'Deployment Required'}
                                                    </p>
                                                </div>

                                                <div className={\`overflow-hidden transition-all duration-500 \${isSelected ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}\`}>
                                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                                        <p className="text-[11px] text-slate-400 leading-relaxed text-center italic">
                                                            "\${item.description}"
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
                                                    <div className={\`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 \${isSelected ? 'rotate-180 bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-600'}\`}>
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
                                        className={\`px-8 py-3 rounded-xl font-outfit font-bold text-xs uppercase tracking-widest transition-all \${
                                            tournamentTab === tab.id 
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }\`}
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
                                className={\`px-8 py-5 border rounded-2xl flex items-center justify-center gap-3 font-mono-premium text-xs font-bold uppercase tracking-widest transition-all \${
                                    showFilters 
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30' 
                                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5'
                                }\`}
                            >
                                <Filter size={16} /> Filters {(filterGame !== 'ALL' || filterFee !== 'ALL') && <span className="w-2 h-2 rounded-full bg-[var(--accent)] ml-1" />}
                            </button>
                        </div>

                        {/* Expandable Filter Box */}
                        <div className={\`grid transition-all duration-500 ease-in-out \${showFilters ? 'grid-rows-[1fr] opacity-100 mb-12' : 'grid-rows-[0fr] opacity-0 mb-0'}\`}>
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
                                                        className={\`px-4 py-2 rounded-xl text-xs font-bold font-inter uppercase tracking-wide transition-all \${
                                                            filterGame === game
                                                            ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                                                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                                        }\`}
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
                                                        className={\`px-4 py-2 rounded-xl text-xs font-bold font-inter uppercase tracking-wide transition-all \${
                                                            filterFee === fee
                                                            ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                                                            : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                                        }\`}
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
                                                        <p className="font-outfit font-black text-white text-sm">{t.entryFee === 0 ? 'FREE' : \`₹\${t.entryFee}\`}</p>
                                                    </div>
                                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center group-hover:bg-cyan-500/5 transition-all">
                                                        <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-widest mb-1">Bounty</p>
                                                        <p className="font-outfit font-black text-[var(--accent)] text-sm uppercase">{\`₹\${t.prizePool || t.prize}\`}</p>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => handleReserveSlot(t._id || t.id)}
                                                    disabled={isBooked}
                                                    className={\`w-full py-5 border border-white/5 font-outfit font-black text-[10px] tracking-[0.3em] rounded-2xl transition-all uppercase shadow-lg \${
                                                        isBooked 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 cursor-default' 
                                                        : 'bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)]'
                                                    }\`}
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
                                                        className={\`p-4 rounded-2xl border transition-all flex items-center gap-3 \${settings.theme === theme ? 'bg-white/10 border-amber-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}\`}
                                                    >
                                                        <div className={\`w-4 h-4 rounded-full \${
                                                            theme === 'cyan' ? 'bg-cyan-500' :
                                                            theme === 'red' ? 'bg-red-500' :
                                                            theme === 'gold' ? 'bg-amber-500' : 'bg-purple-500'
                                                        }\`} />
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
                                                    className={\`w-14 h-8 rounded-full relative transition-all \${settings.scanlines ? 'bg-amber-500' : 'bg-white/10'}\`}
                                                >
                                                    <div className={\`absolute top-1 w-6 h-6 bg-white rounded-full transition-all \${settings.scanlines ? 'left-7' : 'left-1'}\`} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-outfit font-bold text-white text-sm">High Fidelity</p>
                                                    <p className="text-[10px] text-slate-500">Maximum bloom and particle effects</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSettings({...settings, highFidelity: !settings.highFidelity})}
                                                    className={\`w-14 h-8 rounded-full relative transition-all \${settings.highFidelity ? 'bg-amber-500' : 'bg-white/10'}\`}
                                                >
                                                    <div className={\`absolute top-1 w-6 h-6 bg-white rounded-full transition-all \${settings.highFidelity ? 'left-7' : 'left-1'}\`} />
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
`;

fs.writeFileSync(filePath, newHead + preContent + overviewContent + tail);
console.log("Restoration Complete!");

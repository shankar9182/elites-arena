import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, UserPlus, ArrowRight, Crosshair, User, Mail, Gamepad2, X, Home, ChevronDown, Target, Activity, Zap, Crown, Lock } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Register() {
    const [accountType, setAccountType] = useState('PLAYER'); // 'PLAYER' or 'HOST'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mainGame: 'VALORANT',
        hostKey: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showHostKey, setShowHostKey] = useState(false);
    const [showGameDropdown, setShowGameDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const container = document.getElementById('game-select-container');
            if (container && !container.contains(event.target)) {
                setShowGameDropdown(false);
            }
        };

        if (showGameDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showGameDropdown]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('INITIALIZATION FAILED: ALL FIELDS REQUIRED');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('SECURITY MISMATCH: PASSWORDS DO NOT MATCH');
            return;
        }

        if (accountType === 'HOST' && !formData.hostKey) {
            setError('HOST KEY REQUIRED: ENTER YOUR ACCESS CODE');
            return;
        }

        setLoading(true);

        try {
            const res = await authAPI.register({
                name: formData.name,
                email: formData.email.toLowerCase(),
                password: formData.password,
                accountType,
                hostKey: accountType === 'HOST' ? formData.hostKey : undefined
            });

            if (res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data));

                // Redirect based on role
                if (res.data.role === 'ADMIN') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/player';
                }
            } else {
                window.location.href = '/login';
            }
        } catch (err) {
            setError(err.response?.data?.message?.toUpperCase() || 'SYSTEM ERROR: REGISTRATION REJECTED');
        } finally {
            setLoading(false);
        }
    };

    const isHost = accountType === 'HOST';

    return (
        <div className="min-h-screen bg-[#020509] flex items-center justify-center p-6 relative overflow-hidden text-white font-sans selection:bg-[#ffb800] selection:text-black">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 184, 0, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 184, 0, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 1;
          transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
          animation: gridMove 20s linear infinite;
        }
        
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 50px; }
        }

        .cyber-panel-gold {
          background: linear-gradient(135deg, rgba(7,16,30,0.85) 0%, rgba(2,5,9,0.98) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid #1a253a;
        }

        .cyber-panel-host {
          background: linear-gradient(135deg, rgba(20,5,40,0.90) 0%, rgba(2,5,9,0.98) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(124,58,237,0.35);
        }

        .cyber-scrollbar::-webkit-scrollbar { width: 4px; }
        .cyber-scrollbar::-webkit-scrollbar-track { background: rgba(2, 5, 9, 0.4); }
        .cyber-scrollbar::-webkit-scrollbar-thumb { background: #ffb800; border-radius: 10px; }
        .cyber-scrollbar::-webkit-scrollbar-thumb:hover { background: #ffcc33; }

        .cyber-input-gold {
          background: rgba(2, 5, 9, 0.6);
          border: 1px solid #1a253a;
          transition: all 0.3s ease;
        }
        
        .cyber-input-gold:focus-within {
          border-color: #ffb800;
          box-shadow: 0 0 15px rgba(255,184,0,0.15);
          background: rgba(7, 16, 30, 0.9);
        }

        .cyber-input-purple {
          background: rgba(2, 5, 9, 0.6);
          border: 1px solid rgba(124,58,237,0.25);
          transition: all 0.3s ease;
        }

        .cyber-input-purple:focus-within {
          border-color: #7c3aed;
          box-shadow: 0 0 15px rgba(124,58,237,0.2);
          background: rgba(15, 5, 35, 0.9);
        }

        .account-tab {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes hostGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.2); }
          50% { box-shadow: 0 0 40px rgba(124,58,237,0.4); }
        }
        .host-glow { animation: hostGlow 3s ease-in-out infinite; }
      `}</style>

            {/* Background Ambience */}
            <div className="grid-bg"></div>
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none z-0 transition-all duration-700 ${isHost ? 'bg-purple-600/10' : 'bg-[#ffb800]/5'}`}></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00cfff]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

            {/* Home Button */}
            <div className="absolute top-8 left-8 z-50">
                <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-[#ffb800] font-bold uppercase tracking-widest text-[10px] transition-all group">
                    <div className="w-8 h-8 rounded-full border border-[#1a253a] group-hover:border-[#ffb800] flex items-center justify-center transition-colors">
                        <Home size={14} />
                    </div>
                    <span>Back to Home</span>
                </a>
            </div>

            <div className="w-full max-w-[520px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-8 mb-8">

                {/* ── Account Type Toggle ── */}
                <div className="flex mb-8 rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm p-1 gap-1">
                    <button
                        type="button"
                        onClick={() => setAccountType('PLAYER')}
                        className={`account-tab flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest ${
                            !isHost
                                ? 'bg-[#ffb800] text-[#020509] shadow-[0_0_20px_rgba(255,184,0,0.3)]'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Shield size={14} />
                        Player
                    </button>
                    <button
                        type="button"
                        onClick={() => setAccountType('HOST')}
                        className={`account-tab flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest ${
                            isHost
                                ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Crown size={14} />
                        Tournament Host
                    </button>
                </div>

                {/* Header */}
                <div className="mb-8 flex flex-col items-center justify-center text-center">
                    <div className={`w-16 h-16 border rounded-lg flex items-center justify-center mb-6 relative transition-all duration-500 ${
                        isHost
                            ? 'bg-[#1a0540] border-[#7c3aed]/60 shadow-[0_0_30px_rgba(124,58,237,0.2)] host-glow'
                            : 'bg-[#07101e] border-[#ffb800]/50 shadow-[0_0_30px_rgba(255,184,0,0.15)]'
                    }`}>
                        <div className={`absolute inset-0 blur-md rounded-lg ${isHost ? 'bg-[#7c3aed]/20' : 'bg-[#ffb800]/20'}`}></div>
                        {isHost ? (
                            <Crown className="text-[#7c3aed] w-8 h-8 relative z-10" />
                        ) : (
                            <Crosshair className="text-[#ffb800] w-8 h-8 relative z-10" />
                        )}
                    </div>
                    <h1 className="font-orbitron font-black text-3xl tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {isHost ? (
                            <>JOIN AS <span className="text-[#7c3aed]">HOST</span></>
                        ) : (
                            <>JOIN THE <span className="text-[#ffb800]">ARENA</span></>
                        )}
                    </h1>
                    <p className="text-gray-400 font-bold tracking-widest text-[11px] uppercase mt-3 w-3/4 mx-auto leading-relaxed">
                        {isHost
                            ? 'Register as a tournament host. Conduct and manage competitive matches across multiple game genres.'
                            : 'Create your operative profile and deploy into active tournament brackets.'}
                    </p>
                </div>

                {/* Register Form Panel */}
                <div className={`rounded-xl p-8 relative shadow-2xl before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-transparent before:to-transparent before:opacity-50 transition-all duration-500 ${
                    isHost
                        ? 'cyber-panel-host before:via-[#7c3aed]'
                        : 'cyber-panel-gold before:via-[#ffb800]'
                }`}>

                    {error && (
                        <div className="bg-[#ff3c5a]/10 border border-[#ff3c5a]/30 text-[#ff3c5a] px-4 py-3 rounded text-[10px] font-bold uppercase tracking-widest mb-6 flex justify-between items-center animate-pulse">
                            {error}
                            <button type="button" onClick={() => setError('')}>
                                <X size={14} className="hover:text-white" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Username Row */}
                        <div className="space-y-1.5">
                            <label className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block">
                                {isHost ? 'HOST CALLSIGN' : 'CALLSIGN (USERNAME)'} <span className={isHost ? 'text-[#7c3aed]' : 'text-[#ffb800]'}>*</span>
                            </label>
                            <div className={`flex items-center rounded-sm overflow-hidden px-3 ${isHost ? 'cyber-input-purple' : 'cyber-input-gold'}`}>
                                <User size={16} className="text-gray-500 mr-2" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={isHost ? 'e.g. HOST_MAVERICK' : 'e.g. VENOM_99'}
                                    className="w-full bg-transparent text-white py-3.5 text-sm font-bold tracking-wider outline-none placeholder:text-gray-600 placeholder:font-medium"
                                />
                            </div>
                        </div>

                        {/* Email Row */}
                        <div className="space-y-1.5">
                            <label className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block">
                                COMMS LINK (EMAIL) <span className={isHost ? 'text-[#7c3aed]' : 'text-[#ffb800]'}>*</span>
                            </label>
                            <div className={`flex items-center rounded-sm overflow-hidden px-3 ${isHost ? 'cyber-input-purple' : 'cyber-input-gold'}`}>
                                <Mail size={16} className="text-gray-500 mr-2" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="operative@domain.com"
                                    className="w-full bg-transparent text-white py-3.5 text-sm font-medium tracking-wide outline-none placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block">
                                    SECURITY KEY <span className={isHost ? 'text-[#7c3aed]' : 'text-[#ffb800]'}>*</span>
                                </label>
                                <div className={`flex items-center rounded-sm overflow-hidden relative ${isHost ? 'cyber-input-purple' : 'cyber-input-gold'}`}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-transparent text-white p-3 text-sm font-medium tracking-widest outline-none placeholder:text-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block">
                                    CONFIRM KEY <span className={isHost ? 'text-[#7c3aed]' : 'text-[#ffb800]'}>*</span>
                                </label>
                                <div className={`flex items-center rounded-sm overflow-hidden ${isHost ? 'cyber-input-purple' : 'cyber-input-gold'}`}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-transparent text-white p-3 text-sm font-medium tracking-widest outline-none placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Game selection — only for Players */}
                        {!isHost && (
                            <div className="space-y-2 pt-2">
                                <label className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block">PRIMARY COMBAT ZONE <span className="text-[#ffb800]">*</span></label>
                                <div className="relative" id="game-select-container">
                                    <button
                                        type="button"
                                        onClick={() => setShowGameDropdown(!showGameDropdown)}
                                        className={`w-full cyber-input-gold flex items-center justify-between rounded-sm px-4 py-3.5 transition-all duration-300 ${showGameDropdown ? 'border-[#ffb800] ring-1 ring-[#ffb800]/20' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Gamepad2 size={16} className={`${showGameDropdown ? 'text-[#ffb800]' : 'text-gray-500'} transition-colors`} />
                                            <span className="text-sm font-black tracking-[0.2em] uppercase text-white">{formData.mainGame || 'SELECT ZONE'}</span>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${showGameDropdown ? 'rotate-180 text-[#ffb800]' : ''}`} />
                                    </button>

                                    {showGameDropdown && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-[#07101e] border border-[#1a253a] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffb800]/50 to-transparent"></div>
                                            <div className="max-h-[240px] overflow-y-auto cyber-scrollbar">
                                                {[
                                                    { id: 'VALORANT', icon: <Target size={14} />, desc: 'Tactical hero shooter operations' },
                                                    { id: 'BGMI', icon: <Activity size={14} />, desc: 'Battle royale deployment' },
                                                    { id: 'FREE FIRE', icon: <Zap size={14} />, desc: 'High-speed survival combat' },
                                                    { id: 'COD MOBILE', icon: <Crosshair size={14} />, desc: 'Elite tactical field combat' },
                                                    { id: 'APEX LEGENDS', icon: <Target size={14} />, desc: 'Advanced squad-based warfare' },
                                                    { id: 'DOTA 2', icon: <Activity size={14} />, desc: 'Strategic arena simulation' }
                                                ].map((game) => (
                                                    <div
                                                        key={game.id}
                                                        onClick={() => { setFormData(prev => ({ ...prev, mainGame: game.id })); setShowGameDropdown(false); }}
                                                        className={`group flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-white/[0.03] ${formData.mainGame === game.id ? 'bg-[#ffb800]/5' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-lg transition-all ${formData.mainGame === game.id ? 'bg-[#ffb800] text-black' : 'bg-white/5 text-gray-500 group-hover:text-white group-hover:bg-white/10'}`}>
                                                                {game.icon}
                                                            </div>
                                                            <div>
                                                                <p className={`text-[11px] font-black tracking-widest uppercase ${formData.mainGame === game.id ? 'text-[#ffb800]' : 'text-gray-300'}`}>{game.id}</p>
                                                                <p className="text-[9px] text-gray-500 font-medium tracking-tight uppercase group-hover:text-gray-400">{game.desc}</p>
                                                            </div>
                                                        </div>
                                                        {formData.mainGame === game.id && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#ffb800] shadow-[0_0_8px_#ffb800]"></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Host Key — only for HOST accounts */}
                        {isHost && (
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[#7c3aed] font-bold uppercase tracking-widest text-[10px] block flex items-center gap-2">
                                    <Lock size={11} />
                                    HOST ACCESS KEY <span className="text-[#7c3aed]">*</span>
                                </label>
                                <div className="cyber-input-purple flex items-center rounded-sm overflow-hidden relative">
                                    <Lock size={16} className="text-[#7c3aed]/60 ml-3 mr-2 shrink-0" />
                                    <input
                                        type={showHostKey ? 'text' : 'password'}
                                        name="hostKey"
                                        value={formData.hostKey}
                                        onChange={handleChange}
                                        placeholder="Enter your host access code"
                                        className="w-full bg-transparent text-white py-3.5 text-sm font-bold tracking-wider outline-none placeholder:text-gray-600 placeholder:font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowHostKey(!showHostKey)}
                                        className="absolute right-3 text-gray-500 hover:text-[#7c3aed] transition-colors"
                                    >
                                        {showHostKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">
                                    Contact the platform admin to receive your host key.
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-8 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm shadow-lg ${loading
                                ? 'bg-[#1a253a] text-gray-400 cursor-not-allowed border border-[#1a253a]'
                                : isHost
                                    ? 'bg-[#7c3aed] text-white hover:bg-purple-500 border border-transparent shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] hover:-translate-y-1'
                                    : 'bg-[#ffb800] text-[#020509] hover:bg-white border border-transparent shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1'
                                }`}
                        >
                            {loading ? (
                                <>Authenticating...</>
                            ) : (
                                <>
                                    {isHost ? <Crown size={16} /> : <UserPlus size={16} />}
                                    {isHost ? 'Register as Tournament Host' : 'Deploy Operative'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                    Already active in the field?{' '}
                    <a href="/login" className="text-[#ffb800] hover:text-white transition-colors ml-2 gap-1 inline-flex items-center group">
                        Login Protocol <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

            </div>
        </div>
    );
}

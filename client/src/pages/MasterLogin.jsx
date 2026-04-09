import React, { useState } from 'react';
import { ShieldAlert, Eye, EyeOff, LogIn, ArrowRight, Activity, X, Home, Lock } from 'lucide-react';
import { authAPI } from '../services/api';

export default function MasterLogin() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('PROTOCOL ERROR: ALL FIELDS REQUIRED');
            return;
        }

        setLoading(true);

        try {
            const res = await authAPI.login({
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            });

            if (res.data && res.data.token) {
                console.log('MASTER_LOGIN_RESPONSE:', res.data);
                // Verify Master Role
                if (res.data.role !== 'MASTER') {
                    throw new Error('ACCESS DENIED: INSUFFICIENT CLEARANCE');
                }

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data));
                window.location.href = '/master';
            } else {
                setError('VAULT RESPONSE INVALID');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg.toUpperCase() || 'ROOT CONNECTION REFUSED');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center p-6 relative overflow-hidden text-white font-outfit">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .font-mono-premium { font-family: 'JetBrains Mono', monospace; }
        
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 1;
        }
        
        .cyber-panel {
          background: linear-gradient(135deg, rgba(20,22,28,0.95) 0%, rgba(10,11,14,0.98) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(245,158,11,0.15);
        }

        .cyber-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        
        .cyber-input:focus-within {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
          box-shadow: 0 0 20px rgba(245,158,11,0.1);
        }

        .amber-glow {
          box-shadow: 0 0 30px rgba(245,158,11,0.2);
        }
      `}</style>

            <div className="grid-bg"></div>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-50"></div>

            <div className="absolute top-8 left-8 z-50">
                <a href="/" className="flex items-center gap-3 text-slate-500 hover:text-amber-500 font-bold uppercase tracking-[0.3em] text-[10px] transition-all group">
                    <div className="w-10 h-10 rounded-2xl border border-white/5 group-hover:border-amber-500/50 flex items-center justify-center transition-all bg-white/5">
                        <Home size={16} />
                    </div>
                    <span>System Root</span>
                </a>
            </div>

            <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="mb-12 flex flex-col items-center">
                    <div className="w-20 h-20 bg-amber-600/10 border border-amber-600/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-amber-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                        <ShieldAlert size={36} className="text-amber-500 relative z-10" />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Lock size={12} className="text-amber-500" />
                            <span className="font-mono-premium text-[10px] text-amber-500 uppercase tracking-[0.5em] font-bold">Secure Access Required</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">
                            Master <span className="text-transparent" style={{ WebkitTextStroke: '1px #f59e0b' }}>Control</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] pt-2">Sentinel Integrity Protocol v4.0</p>
                    </div>
                </div>

                <div className="cyber-panel rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Activity size={100} className="animate-pulse" />
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest mb-10 flex justify-between items-center animate-in slide-in-from-top-4">
                            <div className="flex items-center gap-3">
                                <X size={16} />
                                {error}
                            </div>
                            <button onClick={() => setError('')} className="hover:scale-110 transition-transform"><X size={14} /></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-slate-500 font-bold uppercase tracking-widest text-[10px] ml-1">Maintainer Identity</label>
                            <div className="cyber-input flex items-center rounded-2xl px-6">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="OPERATIVE-EMAIL@ELITEARENA.NET"
                                    className="w-full bg-transparent text-white py-5 text-sm font-bold tracking-widest outline-none placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Access Sequence</label>
                            </div>
                            <div className="cyber-input flex items-center rounded-2xl px-6 relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="w-full bg-transparent text-white py-5 pr-12 text-sm font-bold tracking-[0.3em] outline-none placeholder:text-slate-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 text-slate-600 hover:text-amber-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-20 rounded-2xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.4em] transition-all duration-500 relative overflow-hidden group/btn ${loading
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-amber-600 text-black hover:bg-amber-400 amber-glow hover:scale-[1.02] active:scale-95'
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                            {loading ? (
                                <Activity size={20} className="animate-spin text-amber-500" />
                            ) : (
                                <>
                                    <LogIn size={20} /> Initialize Root Link
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-12 text-center opacity-40">
                    <p className="font-mono-premium text-[8px] text-slate-500 uppercase tracking-[0.5em]">
                        Warning: Restricted Terminal. Unauthorized access attempts are logged and reported to Sentinel Protocol.
                    </p>
                </div>
            </div>
        </div>
    );
}

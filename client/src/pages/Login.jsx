import React, { useState } from 'react';
import { Shield, Eye, EyeOff, LogIn, ArrowRight, Activity, X, Home } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(''); // clear error on type
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('INITIALIZATION FAILED: ALL FIELDS REQUIRED');
            return;
        }

        setLoading(true);

        try {
            const res = await authAPI.login({
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            });

            if (res.data && res.data.token) {
                console.log('LOGIN_RESPONSE:', res.data);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data));

                // Redirect based on role
                if (res.data.role === 'MASTER') {
                    window.location.href = '/master';
                } else if (res.data.role === 'ADMIN') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/player';
                }
            } else {
                setError('INVALID RESPONSE FROM MAINFRAME');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message?.toUpperCase() || err.message?.toUpperCase() || 'MAINFRAME CONNECTION FAILURE');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020509] flex items-center justify-center p-6 relative overflow-hidden text-white font-sans">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        
        .particles-bg {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,207,255,0.15) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.5;
          z-index: 1;
          animation: float 40s linear infinite;
        }
        
        @keyframes float {
          from { background-position: 0 0; }
          to { background-position: -200px 200px; }
        }

        .cyber-panel {
          background: linear-gradient(135deg, rgba(7,16,30,0.8) 0%, rgba(2,5,9,0.95) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid #112236;
        }

        .cyber-input {
          background: rgba(2, 5, 9, 0.7);
          border: 1px solid #112236;
          transition: all 0.3s ease;
        }
        
        .cyber-input:focus-within {
          border-color: #00cfff;
          box-shadow: 0 0 15px rgba(0,207,255,0.15);
          background: rgba(7, 16, 30, 0.9);
        }

        /* Abstract glowing accent lines */
        .accent-line-top {
          position: absolute; top: 0; right: 20%; width: 30%; height: 1px;
          background: linear-gradient(90deg, transparent, #00cfff, transparent);
          box-shadow: 0 0 10px #00cfff;
        }
        .accent-line-bottom {
          position: absolute; bottom: 0; left: 10%; width: 40%; height: 1px;
          background: linear-gradient(90deg, transparent, #00cfff, transparent);
          box-shadow: 0 0 10px #00cfff;
        }
      `}</style>

            {/* Background Ambience */}
            <div className="particles-bg"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00cfff]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

            {/* Home Button */}
            <div className="absolute top-8 left-8 z-50">
                <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-[#00cfff] font-bold uppercase tracking-widest text-[10px] transition-all group">
                    <div className="w-8 h-8 rounded-full border border-[#112236] group-hover:border-[#00cfff] flex items-center justify-center transition-colors">
                        <Home size={14} />
                    </div>
                    <span>Back to Home</span>
                </a>
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Logo / Header */}
                <div className="mb-10 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-[#07101e] border border-[#112236] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,207,255,0.1)] relative group cursor-default overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00cfff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Shield className="text-[#00cfff] w-8 h-8 relative z-10" />
                    </div>
                    <h1 className="font-orbitron font-black text-3xl tracking-widest uppercase flex flex-col items-center">
                        <span>ELITE<span className="text-[#00cfff] drop-shadow-[0_0_10px_rgba(0,207,255,0.4)]">ARENA</span></span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
                        <Activity size={12} className="text-[#00cfff]" /> Auth Protocol Initialization
                    </p>
                </div>

                {/* Login Form Panel */}
                <div className="cyber-panel rounded-lg p-8 relative overflow-hidden shadow-2xl">
                    <div className="accent-line-top"></div>
                    <div className="accent-line-bottom"></div>

                    {error && (
                        <div className="bg-[#ff3c5a]/10 border border-[#ff3c5a]/30 text-[#ff3c5a] px-4 py-3 rounded text-[10px] font-bold uppercase tracking-widest mb-6 flex justify-between items-center animate-pulse">
                            {error}
                            <button onClick={() => setError('')}><X size={14} className="hover:text-white" /></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block">OPERATIVE ID <span className="text-[#00cfff]">*</span></label>
                            <div className="cyber-input flex items-center rounded-sm overflow-hidden">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    className="w-full bg-transparent text-white p-3.5 text-sm font-medium tracking-wide outline-none placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block">SECURITY KEY <span className="text-[#00cfff]">*</span></label>
                                <a href="#" className="text-[#00cfff] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Forgot Key?</a>
                            </div>
                            <div className="cyber-input flex items-center rounded-sm overflow-hidden relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="w-full bg-transparent text-white p-3.5 pr-12 text-sm font-medium tracking-widest outline-none placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-8 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-sm ${loading
                                ? 'bg-[#112236] text-gray-400 cursor-not-allowed border border-[#112236]'
                                : 'bg-[#00cfff] text-[#020509] hover:bg-white border border-transparent shadow-[0_0_20px_rgba(0,207,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]'
                                }`}
                        >
                            {loading ? (
                                <>Verifying Matrix...</>
                            ) : (
                                <>
                                    <LogIn size={16} /> Establish Connection
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center border-t border-[#112236]/50 pt-6">
                    <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4">
                        New to the Arena?{' '}
                        <a href="/register" className="text-[#00cfff] hover:text-white transition-colors ml-2 gap-1 inline-flex items-center group">
                            Register <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </p>
                    
                    <a href="/master-login" className="inline-flex items-center gap-2 text-gray-700 hover:text-amber-500 font-bold uppercase tracking-[0.3em] text-[9px] transition-all group">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-amber-500 group-hover:shadow-[0_0_8px_#f59e0b] transition-all" />
                        Master Access Portal
                    </a>
                </div>

            </div>
        </div>
    );
}

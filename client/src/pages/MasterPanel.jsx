import React, { useState, useEffect } from 'react';
import api, { requestAPI } from '../services/api';
import { 
    Key, Plus, ShieldAlert, Trash2, Copy, CheckCircle, 
    Clock, User, Hash, AlertTriangle, RefreshCw, X,
    ChevronRight, Mail, Send, Check, Ban, LogOut
} from 'lucide-react';

const MasterPanel = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ useType: 'SINGLE', note: '' });
    const [showGrantModal, setShowGrantModal] = useState(false);
    const [activeTab, setActiveTab] = useState('KEYS');
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [processingRequestId, setProcessingRequestId] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchKeys = async () => {
        try {
            const res = await api.get('/keys');
            setKeys(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching keys:', error);
            showNotify('Failed to decrypt key vault', 'error');
            setLoading(false);
            
            // If we get an error fetching keys, verify if we are still authenticated
            if (error.response?.status === 401 || error.response?.status === 403) {
                window.location.href = '/master-login';
            }
        }
    };

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (!token || !storedUser) {
                window.location.href = '/master-login';
                return;
            }

            try {
                const user = JSON.parse(storedUser);
                if (user.role === 'ADMIN') {
                    window.location.href = '/admin';
                    return;
                }
                if (user.role !== 'MASTER') {
                    window.location.href = '/master-login';
                    return;
                }
            } catch (e) {
                window.location.href = '/master-login';
                return;
            }
            
            if (activeTab === 'KEYS') fetchKeys();
            if (activeTab === 'REQUESTS') fetchRequests();
        };
        checkAuth();
    }, [activeTab]);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleGenerateKey = async () => {
        setGenerating(true);
        try {
            const res = await api.post('/keys/generate', newKeyData);
            setKeys([res.data, ...keys]);
            setShowGrantModal(false);
            setNewKeyData({ useType: 'SINGLE', note: '' });
            showNotify('New Host Access Protocol Initialized');
        } catch (error) {
            showNotify('Key generation protocol failed', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handleRevokeKey = async (id) => {
        try {
            await api.put(`/keys/revoke/${id}`);
            setKeys(keys.map(k => k._id === id ? { ...k, isRevoked: true } : k));
            showNotify('Access Key Terminated', 'error');
        } catch (error) {
            showNotify('Revocation sequence failed', 'error');
        }
    };

    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const res = await requestAPI.getAll();
            setRequests(res.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            showNotify('Failed to fetch player petitions', 'error');
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/master-login';
    };

    const handleUpdateRequest = async (id, status) => {
        setProcessingRequestId(id);
        try {
            await requestAPI.update(id, { 
                status, 
                generateKey: status === 'APPROVED',
                adminNote: status === 'APPROVED' ? 'Host access granted via Master Panel.' : 'Request declined.'
            });
            setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
            showNotify(`Petition ${status === 'APPROVED' ? 'Granted' : 'Denied'}`, status === 'APPROVED' ? 'success' : 'error');
            fetchRequests(); // Refresh to show the newly generated key
            if (status === 'APPROVED') fetchKeys(); // Refresh keys if one was generated
        } catch (error) {
            showNotify('Failed to process petition', 'error');
        } finally {
            setProcessingRequestId(null);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showNotify('Key copied to tactical clipboard');
    };

    return (
        <div className="min-h-screen bg-[#0D0E12] text-white p-8 lg:p-12 font-outfit selection:bg-amber-500 selection:text-black">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
                .font-mono-premium { font-family: 'JetBrains Mono', monospace; }
                .grid-layer {
                    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
            
            <div className="fixed inset-0 grid-layer pointer-events-none opacity-20" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <ShieldAlert size={20} className="animate-pulse" />
                            <span className="font-mono-premium text-[10px] font-bold uppercase tracking-[0.4em]">Master Control Protocol</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                            Key <span className="text-transparent border-t-2 border-b-2 border-amber-500/50" style={{ WebkitTextStroke: '1px white' }}>Management</span>
                        </h1>
                        <p className="mt-6 text-slate-500 font-medium max-w-xl text-sm leading-relaxed uppercase tracking-widest">
                            Authorize tournament hosts by generating unique tactical access keys. Security clearance level: <span className="text-amber-500">ROOT-SENTINEL</span>.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowGrantModal(true)}
                            className="group relative px-10 py-5 bg-amber-600 rounded-2xl overflow-hidden active:scale-95 transition-all shadow-xl shadow-amber-600/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="relative flex items-center gap-3 font-black text-sm uppercase tracking-widest">
                                <Plus size={20} /> Initialize New Key
                            </span>
                        </button>

                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-8 py-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 group font-black text-[10px] tracking-[0.3em] uppercase"
                        >
                            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-12 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('KEYS')}
                        className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'KEYS' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Access Keys
                    </button>
                    <button 
                        onClick={() => setActiveTab('REQUESTS')}
                        className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all relative ${activeTab === 'REQUESTS' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Host Petitions
                        {requests.filter(r => r.status === 'PENDING').length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#0D0E12] animate-pulse">
                                {requests.filter(r => r.status === 'PENDING').length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <Key size={60} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Managed Keys</p>
                        <h3 className="text-4xl font-black text-white">{keys.length}</h3>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <CheckCircle size={60} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Active Protocols</p>
                        <h3 className="text-4xl font-black text-emerald-500">{keys.filter(k => !k.isRevoked).length}</h3>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <AlertTriangle size={60} className="text-rose-500" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Terminated Keys</p>
                        <h3 className="text-4xl font-black text-rose-500">{keys.filter(k => k.isRevoked).length}</h3>
                    </div>
                </div>

                {/* Key Table */}
                {/* Main Content Switcher */}
                {activeTab === 'KEYS' ? (
                    <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-sm animate-in fade-in duration-500">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                                    <th className="px-10 py-8">Access Key</th>
                                    <th className="px-10 py-8">Type</th>
                                    <th className="px-10 py-8">Initiated</th>
                                    <th className="px-10 py-8">Status</th>
                                    <th className="px-10 py-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
                                                <p className="text-slate-500 font-mono-premium text-xs uppercase tracking-widest">Decrypting Vault Data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : keys.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center text-slate-600 font-medium uppercase tracking-widest text-[10px]">
                                            No access keys generated. Initialize protocol to begin.
                                        </td>
                                    </tr>
                                ) : keys.map((k, i) => (
                                    <tr key={k._id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <code className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-amber-500 font-mono-premium text-sm">
                                                    {k.key}
                                                </code>
                                                {!k.isRevoked && (
                                                    <button 
                                                        onClick={() => copyToClipboard(k.key)}
                                                        className="p-2 text-slate-500 hover:text-white transition-colors"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border ${k.useType === 'SINGLE' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 'border-indigo-500/20 text-indigo-500 bg-indigo-500/5'} uppercase tracking-widest`}>
                                                {k.useType}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white text-xs font-bold">{new Date(k.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[9px] text-slate-600 font-mono-premium uppercase tracking-tighter">
                                                    {new Date(k.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${k.isRevoked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse outline outline-2 outline-emerald-500/20'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${k.isRevoked ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {k.isRevoked ? 'Terminated' : 'Operational'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            {!k.isRevoked && (
                                                <button 
                                                    onClick={() => handleRevokeKey(k._id)}
                                                    className="px-6 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-sm animate-in fade-in duration-500">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                                    <th className="px-10 py-8">Player Petition</th>
                                    <th className="px-10 py-8">Message</th>
                                    <th className="px-10 py-8">Applied</th>
                                    <th className="px-10 py-8">Tactical Key</th>
                                    <th className="px-10 py-8">Status</th>
                                    <th className="px-10 py-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {loadingRequests ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
                                                <p className="text-slate-500 font-mono-premium text-xs uppercase tracking-widest">Scanning Inbound Petitions...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-32 text-center text-slate-600 font-medium uppercase tracking-widest text-[10px]">
                                            No active petitions found in neural buffer.
                                        </td>
                                    </tr>
                                ) : requests.map((req) => (
                                    <tr key={req._id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-amber-500/30 transition-all">
                                                    <User size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm font-bold tracking-tight">{req.user?.name || 'Unknown Subject'}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono-premium uppercase">{req.user?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-slate-400 text-xs leading-relaxed max-w-md line-clamp-2 italic">
                                                "{req.message}"
                                            </p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white text-xs font-bold">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[9px] text-slate-600 font-mono-premium uppercase tracking-tighter">
                                                    {new Date(req.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            {req.keyGenerated ? (
                                                <div className="flex items-center gap-3">
                                                    <code className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-500 font-mono-premium text-[10px]">
                                                        {req.keyGenerated}
                                                    </code>
                                                    <button 
                                                        onClick={() => copyToClipboard(req.keyGenerated)}
                                                        className="p-1.5 text-slate-500 hover:text-white transition-colors"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-700 font-mono-premium italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    req.status === 'PENDING' ? 'bg-amber-500 animate-pulse outline outline-2 outline-amber-500/20' : 
                                                    req.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                                                }`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    req.status === 'PENDING' ? 'text-amber-500' : 
                                                    req.status === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            {req.status === 'PENDING' ? (
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleUpdateRequest(req._id, 'REJECTED')}
                                                        disabled={processingRequestId === req._id}
                                                        className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                                        title="Deny Petition"
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateRequest(req._id, 'APPROVED')}
                                                        disabled={processingRequestId === req._id}
                                                        className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                                        title="Grant Access"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-mono-premium text-slate-600 uppercase tracking-widest italic">Archived</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Grant Modal */}
            {showGrantModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                    <div className="w-full max-w-lg bg-[#111419] border border-white/10 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <RefreshCw size={120} className="animate-spin-slow" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Key Initialization</h2>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-10">Configure new Host Authorization Protocol</p>
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Key Durability</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setNewKeyData({...newKeyData, useType: 'SINGLE'})}
                                        className={`py-4 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all ${newKeyData.useType === 'SINGLE' ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        Single Use
                                    </button>
                                    <button 
                                        onClick={() => setNewKeyData({...newKeyData, useType: 'MULTI'})}
                                        className={`py-4 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all ${newKeyData.useType === 'MULTI' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        Multi Use
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Protocol Identifier (Note)</label>
                                <input 
                                    type="text"
                                    value={newKeyData.note}
                                    onChange={(e) => setNewKeyData({...newKeyData, note: e.target.value})}
                                    placeholder="e.g. DreamHack Season 4 Host"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-amber-500 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button 
                                    onClick={() => setShowGrantModal(false)}
                                    className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    onClick={handleGenerateKey}
                                    disabled={generating}
                                    className="flex-1 py-5 bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {generating ? 'Processing...' : 'Execute Protocol'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div className={`fixed bottom-10 right-10 z-[200] px-8 py-5 rounded-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-right-10 duration-500 shadow-2xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="font-bold text-xs uppercase tracking-widest">{notification.message}</span>
                </div>
            )}
        </div>
    );
};

export default MasterPanel;

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'PlayerDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Bell & Notification Dropdown
const bellBlock = /<div className="relative cursor-pointer group">\s*<div className="p-2.5 rounded-xl bg-white\/5 hover:bg-white\/10 transition-colors border border-white\/5">\s*<Bell size=\{18\} className="text-\[var\(--text-secondary\)\] group-hover:text-\[var\(--text-primary\)\]" \/>\s*<\/div>\s*<span className="absolute -top-1 -right-1 w-5 h-5 bg-\[var\(--danger\)\] text-white text-\[10px\] font-bold flex items-center justify-center rounded-full border-2 border-\[var\(--bg-deep\)\]">2<\/span>\s*<\/div>/m;

const newBellBlock = `                    <div className="relative">
                        <div 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={\`p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border cursor-pointer group \${showNotifications ? 'border-[var(--accent)]' : 'border-white/5'}\`}
                        >
                            <Bell size={18} className={notifications.some(n => !n.isRead) ? "text-[var(--accent)] animate-pulse" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"} />
                        </div>
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[var(--bg-deep)] animate-in zoom-in duration-300">
                                {notifications.filter(n => !n.isRead).length}
                            </span>
                        )}

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-4 w-80 glass-panel rounded-3xl overflow-hidden shadow-2xl z-[100] animate-in slide-in-from-top-4 duration-300">
                                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <span className="font-outfit text-sm font-bold text-white uppercase tracking-widest">Alert Center</span>
                                    <span className="font-mono-premium text-[10px] text-[var(--accent)] opacity-60">DRCT-092</span>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center">
                                            <Info size={32} className="mx-auto text-white/10 mb-3" />
                                            <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-tighter">No active transmissions</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n._id} 
                                                onClick={() => !n.isRead && handleMarkRead(n._id)}
                                                className={\`p-5 border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.03] relative overflow-hidden \${!n.isRead ? 'bg-[var(--accent)]/5' : ''}\`}
                                            >
                                                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)]" />}
                                                <div className="flex gap-4">
                                                    <div className={\`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 \${n.type === 'KEY_GRANT' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500'}\`}>
                                                        {n.type === 'KEY_GRANT' ? <Key size={14} /> : <Mail size={14} />}
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-[11px] font-bold text-white leading-tight uppercase tracking-tight">{n.title}</p>
                                                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                                                        <span className="text-[9px] text-[var(--text-secondary)] opacity-50 font-mono-premium mt-1">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                                    <button className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">Clear All Logs</button>
                                </div>
                            </div>
                        )}
                    </div>`;

if (bellBlock.test(content)) {
    content = content.replace(bellBlock, newBellBlock);
    console.log('Bell block replaced');
} else {
    console.error('Bell block not found');
}

// 2. Add Sidebar Button
const sidebarMatch = /<\/nav>\s*<div className="p-4 border-t border-white\/5">/m;
const newSidebarPart = `                        <div className="px-4 py-2 mt-4 mb-2">
                             <button
                                 onClick={() => setShowRequestModal(true)}
                                 className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-amber-600/10 text-amber-500 border border-amber-500/20 hover:bg-amber-600/20 transition-all font-bold group"
                             >
                                 <ShieldAlert size={20} className="group-hover:rotate-12 transition-transform shrink-0" />
                                 {(sidebarOpen || isMobileSidebarOpen) && <span className="text-xs uppercase tracking-widest font-black animate-in fade-in duration-300">Request Host</span>}
                             </button>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-white/5">`;

if (sidebarMatch.test(content)) {
    content = content.replace(sidebarMatch, newSidebarPart);
    console.log('Sidebar button added');
} else {
    console.error('Sidebar match not found');
}

// 3. Add Request Modal
const footerMatch = /        <\/div>\s*<\/div>\s*\);\s*};/m;
const modalCode = `            {/* Host Access Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-xl glass-panel rounded-[3rem] p-10 relative overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-cyan-500/5 rotate-45 blur-[80px]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                        <ShieldAlert size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h2 className="font-outfit text-2xl font-black text-white uppercase tracking-tight">Petition for Host Access</h2>
                                        <p className="font-mono-premium text-[10px] text-slate-500 uppercase tracking-widest">Protocol: EA-AUTH-HOST-REQ</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowRequestModal(false)}
                                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitRequest} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="font-mono-premium text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                        <Mail size={12} /> Message to Overseers
                                    </label>
                                    <textarea 
                                        value={requestMessage}
                                        onChange={(e) => setRequestMessage(e.target.value)}
                                        placeholder="Briefly describe your hosting experience or tournament plans..."
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm focus:border-amber-500 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 resize-none"
                                        required
                                    />
                                </div>

                                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                                    <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                        Submitting this petition will initiate a background security audit by the Master Admin. 
                                        If approved, you will receive an encrypted access key in your notification center.
                                    </p>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowRequestModal(false)}
                                        className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={requestLoading || !requestMessage.trim()}
                                        className="flex-1 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {requestLoading ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <Loader2 size={16} className="animate-spin" />
                                                Transmitting...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3">
                                                <Send size={16} />
                                                Submit Petition
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};`;

if (footerMatch.test(content)) {
    content = content.replace(footerMatch, modalCode);
    console.log('Modal added');
} else {
    console.error('Footer match not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch complete');

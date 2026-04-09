import React, { useState } from 'react';
import { X, Menu } from 'lucide-react';

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <>
      <footer className="bg-[#030811] border-t border-white/5 pt-16 pb-8 px-6 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="font-orbitron font-black text-2xl tracking-widest text-[#00cfff] drop-shadow-[0_0_10px_rgba(0,207,255,0.3)] cursor-default">
            <span className="text-white">ELITE</span>ARENA
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <button onClick={() => setActiveModal('privacy')} className="text-gray-500 hover:text-[#00cfff] font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer outline-none">Privacy Policy</button>
            <button onClick={() => setActiveModal('terms')} className="text-gray-500 hover:text-[#00cfff] font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer outline-none">Terms of Service</button>
            <button onClick={() => setActiveModal('support')} className="text-gray-500 hover:text-[#00cfff] font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer outline-none">Contact Support</button>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-[#00cfff] transition-colors"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></a>
            <a href="#" className="text-gray-500 hover:text-[#00cfff] transition-colors"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
            <a href="#" className="text-gray-500 hover:text-[#00cfff] transition-colors"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg></a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">
          &copy; 2026 Elite Arena. All rights reserved. Let the battle commence.
        </div>
      </footer>

      {/* Footer Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative w-full max-w-2xl bg-[#0a0f1a] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="border-b border-white/10 p-6 flex justify-between items-center bg-[#0d1421]">
              <h3 className="font-orbitron font-bold text-xl text-[#00cfff] tracking-widest uppercase">
                {activeModal === 'privacy' && 'Privacy Protocol'}
                {activeModal === 'terms' && 'Terms of Engagement'}
                {activeModal === 'support' && 'Support Uplink'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-500 hover:text-white transition-colors p-1"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#0a0f1a]">
              {activeModal === 'privacy' && (
                <div className="space-y-6 text-gray-400 font-medium leading-relaxed font-rajdhani">
                  <section>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-sm font-orbitron">Data Encryption</h4>
                    <p>All protocol communications are encrypted via 256-bit quantum-resistant algorithms. Your tactical data remains isolated within your sector.</p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-sm font-orbitron">Session Persistence</h4>
                    <p>Guest sessions use localized storage to maintain HUD configurations. No permanent identifiers are logged during non-authenticated transmissions.</p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-sm font-orbitron">Tournament Records</h4>
                    <p>Combat logs and tournament statistics are archived for 90 cycles to ensure fair play validation and historical data integrity.</p>
                  </section>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="space-y-6 text-gray-400 font-medium leading-relaxed font-rajdhani">
                  <section>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-sm font-orbitron">Combat Regulations</h4>
                    <p>By engaging in ELITE ARENA, you agree to uphold the Code of Valor. Exploitation of sub-atomic glitches or unauthorized HUD modifications is strictly prohibited.</p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-sm font-orbitron">Anti-Cheat Consent</h4>
                    <p>Real-time sector monitoring is active during all ranked protocols. Detection of external tactical assistance will result in immediate protocol termination.</p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-sm font-orbitron">Intellectual Property</h4>
                    <p>All arena designs and tactical assets are the property of the Cyber-Industrial Collective. Unauthorized duplication of HUD interfaces is contested.</p>
                  </section>
                </div>
              )}

              {activeModal === 'support' && (
                <div className="space-y-6 font-rajdhani">
                  {!formSubmitted ? (
                    <div className="space-y-4">
                      <p className="text-gray-400 text-sm">Initiating direct uplink to Command Central. Please provide your protocol details.</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1 font-orbitron">Protocol ID / Subject</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Connection Error"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#00cfff] focus:outline-none transition-all font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1 font-orbitron">Transmission Data</label>
                          <textarea 
                            rows="4"
                            placeholder="Describe your issue..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#00cfff] focus:outline-none transition-all font-medium resize-none shadow-inner"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            setFormSubmitted(true);
                            setTimeout(() => {
                              setFormSubmitted(false);
                              setActiveModal(null);
                            }, 3000);
                          }}
                          className="w-full bg-[#00cfff]/10 border border-[#00cfff]/50 hover:bg-[#00cfff]/20 text-[#00cfff] font-bold py-4 rounded-lg transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 group font-orbitron shadow-[0_4px_15px_rgba(0,207,255,0.1)]"
                        >
                          Initiate Uplink
                          <Menu className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center animate-in fade-in duration-500">
                      <div className="w-16 h-16 bg-[#00cfff]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-8 h-8 bg-[#00cfff] rounded-full animate-ping opacity-50" />
                      </div>
                      <h4 className="text-white font-orbitron font-bold text-xl mb-2 tracking-widest uppercase">SIGNAL SENT</h4>
                      <p className="text-gray-500 text-sm">Command has received your transmission. Closing socket...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Decor */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#00cfff]/30 to-transparent" />
          </div>
        </div>
      )}
    </>
  );
}

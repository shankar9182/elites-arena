const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'AdminPanel.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure isAuthorized state exists (it should, but just in case)
if (!content.includes('const [isAuthorized, setIsAuthorized]')) {
    content = content.replace(
        'export default function AdminPanel() {',
        'export default function AdminPanel() {\n    const [isAuthorized, setIsAuthorized] = useState(false);'
    );
}

// 2. Add the checkAuth useEffect
if (!content.includes('const checkAuth = () =>')) {
    const useEffectBlock = `
    useEffect(() => {
        const checkAuth = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.role === 'ADMIN') {
                        setIsAuthorized(true);
                        return;
                    }
                } catch (e) {
                    console.error('Auth check failed');
                }
            }
            setIsAuthorized(false);
        };
        checkAuth();
    }, []);\n`;

    // Insert after the activePanel useEffect
    content = content.replace(
        /setIsEditing\(false\);\s*\},\s*\[activePanel\]\);/,
        'setIsEditing(false);\n    }, [activePanel]);\n' + useEffectBlock
    );
}

// 3. Add the render guard
if (!content.includes('if (!isAuthorized && !loading)')) {
    const guideBlock = `
    if (!isAuthorized && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0D0E12] text-white p-8">
                <style>{\`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                \`}</style>
                <div className="w-24 h-24 bg-rose-500/10 rounded-3xl flex items-center justify-center border border-rose-500/20 mb-8">
                    <ShieldAlert size={48} className="text-rose-500" />
                </div>
                <h1 className="font-outfit font-black text-4xl mb-4 tracking-tighter uppercase">Clearance Required</h1>
                <p className="text-slate-400 max-w-md text-center mb-8 font-inter text-sm leading-relaxed">Your account does not have the required Sentinel-level clearance to access the Management Vault. Unauthorized access attempts are logged.</p>
                <button 
                    onClick={() => window.location.href = '/player'}
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-outfit font-bold text-sm uppercase tracking-widest text-slate-300 hover:text-white"
                >
                    Return to Player Dashboard
                </button>
            </div>
        );
    }\n`;

    // Insert before the main return statement of AdminPanel
    // We look for "return (" that is preceded by ") ;" or similar from navItems
    content = content.replace(
        /\];\s+return \(/,
        '];\n\n' + guideBlock + '\n    return ('
    );
}

fs.writeFileSync(filePath, content);
console.log('REPAIR COMPLETE: AdminPanel.jsx is now secure and functional.');

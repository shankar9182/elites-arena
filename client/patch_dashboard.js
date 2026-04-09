const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'PlayerDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Icons
const iconMatch = /ChevronLeft, LogOut, Loader2, Menu/m;
if (iconMatch.test(content)) {
    content = content.replace(iconMatch, 'ChevronLeft, LogOut, Loader2, Menu,\r\n    Mail, Send, Info');
    console.log('Icons added');
} else {
    console.error('Icons not found');
}

// 2. Add States
const stateMatch = /const \[loading, setLoading\] = useState\(true\);/m;
if (stateMatch.test(content)) {
    content = content.replace(stateMatch, 'const [loading, setLoading] = useState(true);\r\n\r\n    // New State for Requests & Notifications\r\n    const [notifications, setNotifications] = useState([]);\r\n    const [showNotifications, setShowNotifications] = useState(false);\r\n    const [showRequestModal, setShowRequestModal] = useState(false);\r\n    const [requestMessage, setRequestMessage] = useState(\'\');\r\n    const [requestLoading, setRequestLoading] = useState(false);');
    console.log('States added');
} else {
    console.error('States not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch applied successfully');

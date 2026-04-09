import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing'
import PlayerDashboard from './pages/PlayerDashboard.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import ObserverView from './pages/ObserverView.jsx'
import ObserverLobby from './pages/ObserverLobby.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import MasterPanel from './pages/MasterPanel.jsx'
import MasterLogin from './pages/MasterLogin.jsx'
import Tournaments from './pages/Tournaments.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import About from './pages/About.jsx'
function App() {
    const path = window.location.pathname;
    console.log("APP_INITIALIZED: Path =", path);

    const renderContent = () => {
        console.log("RENDER_CONTENT_START: Path =", path);
        try {
            if (path === '/player' || path === '/dashboard') {
                console.log("RENDERING: PlayerDashboard");
                return <PlayerDashboard />
            }
            if (path === '/admin') {
                console.log("RENDERING: AdminPanel");
                return <AdminPanel />
            }
            if (path === '/watch') return <ObserverLobby />
            if (path === '/observer') return <ObserverView />
            if (path === '/tournaments') return <Tournaments />
            if (path === '/leaderboard') return <Leaderboard />
            if (path === '/about') return <About />
            if (path === '/login') {
                console.log("RENDERING: Login");
                return <Login />
            }
            if (path === '/register') return <Register />
            if (path === '/master') return <MasterPanel />
            if (path === '/master-login') return <MasterLogin />
            console.log("RENDERING: Landing (Default)");
            return <Landing />
        } catch (err) {
            console.error("CRITICAL_RENDER_ERROR:", err);
            return <div style={{color: 'red', padding: '20px'}}>Render Error: {err.message}</div>
        }
    };

    return (
        <div id="app-root-container">
            {renderContent()}
        </div>
    );
}

export default App

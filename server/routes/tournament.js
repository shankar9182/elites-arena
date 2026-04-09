const express = require('express');
const router = express.Router();
const {
    getAllTournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    deleteTournament,
    joinTournament,
    getLiveTournamentInfo,
    getLiveBracket,
    getMatchDetail,
    getTournamentEvents,
    getTeamsStatus,
    updateMatchResult
} = require('../controllers/tournamentController');
const { protect, admin } = require('../middleware/auth');

// ── Observer / Live endpoints (no auth required) ──
// IMPORTANT: These specific routes must be placed BEFORE /:id to avoid conflicts
router.get('/live-info', getLiveTournamentInfo);
router.get('/bracket', getLiveBracket);
router.get('/events', getTournamentEvents);
router.get('/teams-status', getTeamsStatus);
router.get('/match/:matchId', getMatchDetail);
router.put('/match/:matchId', protect, admin, updateMatchResult);

// ── Standard CRUD ──
router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);
router.post('/', protect, admin, createTournament);
router.put('/:id', protect, admin, updateTournament);
router.delete('/:id', protect, admin, deleteTournament);
router.post('/:id/join', protect, joinTournament);

module.exports = router;

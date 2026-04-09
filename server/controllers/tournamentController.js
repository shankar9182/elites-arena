const Tournament = require('../../database/models/Tournament');
const User = require('../../database/models/User');
const Match = require('../../database/models/Match');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getAllTournaments = async (req, res) => {
    try {
        const query = {};
        if (req.query.game) {
            query.game = { $regex: new RegExp(req.query.game.trim(), 'i') };
        }
        if (req.query.status) {
            query.status = req.query.status.toUpperCase();
        }

        const tournaments = await Tournament.find(query).populate('organizer', 'name email').sort({ startTime: -1 });
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('participants.user', 'name email avatar level');
        
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private/Admin
exports.createTournament = async (req, res) => {
    try {
        const { title, game, prizePool, entryFee, slots, startTime, platform, description } = req.body;

        const tournament = await Tournament.create({
            title, game, prizePool, entryFee, slots, startTime, platform, description,
            organizer: req.user.id
        });

        res.status(201).json(tournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
exports.updateTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });

        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        res.json(tournament);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a tournament
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin
exports.deleteTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findByIdAndDelete(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        res.json({ message: 'Tournament removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a tournament
// @route   POST /api/tournaments/:id/join
// @access  Private
exports.joinTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.status !== 'UPCOMING') return res.status(400).json({ message: 'Tournament is no longer accepting participants' });

        const isJoined = tournament.participants.find(p => p.user.toString() === req.user.id);
        if (isJoined) return res.status(400).json({ message: 'User already joined this tournament' });
        if (tournament.participants.length >= tournament.slots.total) return res.status(400).json({ message: 'Tournament is full' });

        tournament.participants.push({ user: req.user.id });
        tournament.slots.booked = tournament.participants.length;
        await tournament.save();

        res.json({ message: 'Successfully joined tournament', tournament });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── OBSERVER / LIVE ENDPOINTS ────────────────────────────────────────────────

// @desc    Get info for the currently LIVE tournament
// @route   GET /api/tournaments/live-info
// @access  Public
exports.getLiveTournamentInfo = async (req, res) => {
    try {
        const { tournamentId, game } = req.query;
        let tournament;

        if (tournamentId) {
            tournament = await Tournament.findById(tournamentId);
        } else {
            const gameFilter = game ? { game: { $regex: new RegExp(game, 'i') } } : {};
            tournament = await Tournament.findOne({ status: 'LIVE', ...gameFilter }) ||
                         await Tournament.findOne({ status: 'UPCOMING', ...gameFilter }) ||
                         await Tournament.findOne(gameFilter);
        }

        if (!tournament) return res.status(404).json({ message: 'No tournament found' });

        res.json({
            name: tournament.title,
            game: tournament.game,
            date: new Date(tournament.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
            prize: tournament.prizePool > 0 ? `₹${tournament.prizePool.toLocaleString()}` : 'TBD',
            format: 'Single Elim',
            slots: `${tournament.slots.total} Teams`,
            server: tournament.platform || 'GLOBAL',
            tournamentId: tournament._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live bracket (all matches) for the current live tournament
// @route   GET /api/tournaments/bracket
// @access  Public
exports.getLiveBracket = async (req, res) => {
    try {
        const { tournamentId, game } = req.query;
        let tournament;

        if (tournamentId) {
            tournament = await Tournament.findById(tournamentId);
        } else {
            const gameFilter = game ? { game: { $regex: new RegExp(game, 'i') } } : {};
            tournament = await Tournament.findOne({ status: 'LIVE', ...gameFilter }) ||
                         await Tournament.findOne({ ...gameFilter }) ||
                         await Tournament.findOne({});
        }

        if (!tournament) return res.status(404).json({ message: 'No tournament found' });

        const dbMatches = await Match.find({ tournament: tournament._id }).sort({ createdAt: 1 });

        const slots = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'final'];
        const bracket = {};

        slots.forEach((slot, i) => {
            const m = dbMatches[i];
            if (m) {
                bracket[slot] = {
                    id: m._id,
                    dbId: m._id,
                    t1: m.teams[0]?.name || 'TBD',
                    s1: m.teams[0]?.score ?? 0,
                    t2: m.teams[1]?.name || 'TBD',
                    s2: m.teams[1]?.score ?? 0,
                    winner: m.winner ? (m.winner === m.teams[0]?.name ? 't1' : 't2') : null,
                    status: m.status
                };
            } else {
                bracket[slot] = { id: slot, t1: 'TBD', s1: null, t2: 'TBD', s2: null, winner: null, status: 'PENDING' };
            }
        });

        const championMatch = dbMatches.find(m => m.status === 'COMPLETED' && m.winner);
        bracket.champion = championMatch ? championMatch.winner : null;

        res.json(bracket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get real-time score/detail for a specific match by its DB ID
// @route   GET /api/tournaments/match/:matchId
// @access  Public
exports.getMatchDetail = async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match) return res.status(404).json({ message: 'Match not found' });

        res.json({
            id: match._id,
            t1: match.teams[0]?.name || 'TBD',
            s1: match.teams[0]?.score ?? 0,
            t2: match.teams[1]?.name || 'TBD',
            s2: match.teams[1]?.score ?? 0,
            winner: match.winner ? (match.winner === match.teams[0]?.name ? 't1' : 't2') : null,
            status: match.status,
            updatedAt: match.updatedAt || match.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live event log for the active tournament
// @route   GET /api/tournaments/events
// @access  Public
exports.getTournamentEvents = async (req, res) => {
    try {
        const { tournamentId, game } = req.query;
        let tournament;

        if (tournamentId) {
            tournament = await Tournament.findById(tournamentId);
        } else {
            const gameFilter = game ? { game: { $regex: new RegExp(game, 'i') } } : {};
            tournament = await Tournament.findOne({ status: 'LIVE', ...gameFilter }) ||
                               await Tournament.findOne({ ...gameFilter }) ||
                               await Tournament.findOne({});
        }

        if (!tournament) return res.json([{ id: 1, text: 'No active tournament', time: 'Now' }]);

        const recentMatches = await Match.find({ tournament: tournament._id, status: 'COMPLETED' })
            .sort({ completedAt: -1 }).limit(5);

        const events = recentMatches.map(m => ({
            id: m._id,
            text: m.winner ? `${m.winner} advances to the next round` : 'Match concluded',
            time: m.completedAt
                ? `${Math.max(1, Math.round((Date.now() - new Date(m.completedAt)) / 60000))} min ago`
                : 'Recently'
        }));

        if (events.length === 0) {
            events.push({ id: 1, text: 'Broadcast is live. Match results will appear here.', time: 'Now' });
        }

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live team status map for the active tournament
// @route   GET /api/tournaments/teams-status
// @access  Public
exports.getTeamsStatus = async (req, res) => {
    try {
        const { tournamentId, game } = req.query;
        let tournament;

        if (tournamentId) {
            tournament = await Tournament.findById(tournamentId);
        } else {
            const gameFilter = game ? { game: { $regex: new RegExp(game, 'i') } } : {};
            tournament = await Tournament.findOne({ status: 'LIVE', ...gameFilter }) ||
                               await Tournament.findOne({ ...gameFilter }) ||
                               await Tournament.findOne({});
        }

        if (!tournament) return res.json({});

        const matches = await Match.find({ tournament: tournament._id });
        const teamStatus = {};

        matches.forEach(m => {
            m.teams.forEach(t => {
                if (t.name) {
                    const isEliminated = m.status === 'COMPLETED' && !t.isWinner;
                    // Only overwrite Active with Eliminated, never the other way
                    if (!teamStatus[t.name] || teamStatus[t.name] === 'Active') {
                        teamStatus[t.name] = isEliminated ? 'Eliminated' : 'Active';
                    }
                }
            });
        });

        res.json(teamStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update match result (scores, winner, status)
// @route   PUT /api/tournaments/match/:matchId
// @access  Private/Admin
exports.updateMatchResult = async (req, res) => {
    try {
        const { s1, s2, status, winner } = req.body;
        const match = await Match.findById(req.params.matchId);

        if (!match) return res.status(404).json({ message: 'Match not found' });

        // Update scores
        if (s1 !== undefined && match.teams[0]) match.teams[0].score = s1;
        if (s2 !== undefined && match.teams[1]) match.teams[1].score = s2;
        
        // Update status
        if (status) match.status = status;
        
        // Update winner
        if (winner) {
            match.winner = winner;
            if (match.teams[0]) match.teams[0].isWinner = (winner === match.teams[0].name);
            if (match.teams[1]) match.teams[1].isWinner = (winner === match.teams[1].name);
            if (status === 'COMPLETED') {
                match.completedAt = Date.now();
            }
        }

        // ── NEW: Optional Team Name Updates (For Bracket Advancement) ──
        const { t1Name, t2Name } = req.body;
        if (t1Name && match.teams[0]) match.teams[0].name = t1Name;
        if (t2Name && match.teams[1]) match.teams[1].name = t2Name;

        await match.save();
        res.json(match);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


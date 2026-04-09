/**
 * Utility for handling user profile avatars
 */

// List of officially supported avatar IDs matching files in /public/avatars/*.png
export const VALID_AVATARS = [
    'Sentinel',
    'assassin',
    'droid',
    'generic',
    'generic2',
    'generic3',
    'goblin',
    'hacker',
    'hunter',
    'jonathan',
    'mage',
    'ninja',
    'pilot',
    'samurai',
    'scout',
    'soldier',
    'vr_gamer',
    'warrior'
];

export const DEFAULT_AVATAR = 'generic';

/**
 * Gets the correct URL for an avatar, falling back to generic if input is invalid
 * @param {string} avatarName - The avatar identifier from the database
 * @returns {string} - Public path to the avatar image
 */
export const getAvatarUrl = (avatarName) => {
    const name = avatarName || DEFAULT_AVATAR;
    
    // Check if the name exists in our official list
    if (VALID_AVATARS.includes(name)) {
        return `/avatars/${name}.png`;
    }
    
    // If name is not found, fallback to generic
    return `/avatars/${DEFAULT_AVATAR}.png`;
};

/**
 * Handle image load errors by switching to the default avatar
 * @param {Event} e - Image error event
 */
export const handleAvatarError = (e) => {
    if (e.target.src.includes('/avatars/generic.png')) {
        // Prevent infinite loop if generic itself is missing
        return;
    }
    e.target.src = `/avatars/${DEFAULT_AVATAR}.png`;
};

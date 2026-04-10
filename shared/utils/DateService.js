/**
 * DateService — Single authoritative date source for the whole app.
 *
 * Every piece of code that needs "today's date" must come here.
 * This eliminates timezone/midnight inconsistencies across files.
 */

/** Returns today as YYYY-MM-DD (local device time) */
export const getTodayKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/** Returns yesterday as YYYY-MM-DD */
export const getYesterdayKey = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/** Convert any Date / ISO string to YYYY-MM-DD local-time key */
export const toDateKey = (dateOrIso) => {
    const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * How many calendar days between two YYYY-MM-DD keys.
 * Always returns a non-negative integer.
 */
export const daysBetween = (keyA, keyB) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const a = new Date(keyA + 'T00:00:00');
    const b = new Date(keyB + 'T00:00:00');
    return Math.abs(Math.round((b - a) / msPerDay));
};

/**
 * Days elapsed since a given YYYY-MM-DD key (or ISO start date).
 * Used for daysActive — always computed, never stored.
 */
export const daysElapsedSince = (startDateOrKey) => {
    if (!startDateOrKey) return 0;
    const key = startDateOrKey.includes('T')
        ? toDateKey(startDateOrKey)
        : startDateOrKey;
    return daysBetween(key, getTodayKey());
};

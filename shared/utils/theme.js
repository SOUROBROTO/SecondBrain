import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { SettingsContext } from '../../features/settings/context/SettingsContext';

const LIGHT = {
    black: '#FFFFFF',
    white: '#37352F',
    surface: '#FFFFFF',
    surface2: '#F7F7F5',
    surface3: '#F7F7F5',
    text: '#37352F',
    textSub: 'rgba(55, 53, 47, 0.65)',
    textMuted: 'rgba(55, 53, 47, 0.5)',
    textDisabled: 'rgba(55, 53, 47, 0.3)',
    border: 'rgba(55, 53, 47, 0.09)',
    borderMed: 'rgba(55, 53, 47, 0.16)',
    borderStrong: 'rgba(55, 53, 47, 0.25)',
    accent: '#2383E2',
    accentBg: 'rgba(35, 131, 226, 0.1)',
    accentBgMed: 'rgba(35, 131, 226, 0.2)',
    danger: '#E03E3E',
    dangerBg: '#FBE4E4',
    success: '#0F7B6C',
    successBg: '#EDF3EC',
    warn: '#D9730D',
    warnBg: '#FBF3DB',
    info: '#0B6E99',
    infoBg: '#E8F3F9',
    high: '#E03E3E',
    med: '#D9730D',
    low: '#0F7B6C',
};

const DARK = {
    black: '#0d0d0d',
    white: '#FFFFFF',
    surface: '#171717',
    surface2: '#1f1f1f',
    surface3: '#242424',
    text: '#ececec',
    textSub: '#8e8ea0',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textDisabled: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255,255,255,0.08)',
    borderMed: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.25)',
    accent: '#10a37f',
    accentBg: 'rgba(16, 163, 127, 0.15)',
    accentBgMed: 'rgba(16, 163, 127, 0.25)',
    danger: '#E03E3E',
    dangerBg: 'rgba(224, 62, 62, 0.15)',
    success: '#0F7B6C',
    successBg: 'rgba(15, 123, 108, 0.15)',
    warn: '#D9730D',
    warnBg: 'rgba(217, 115, 13, 0.15)',
    info: '#0B6E99',
    infoBg: 'rgba(11, 110, 153, 0.15)',
    high: '#E03E3E',
    med: '#D9730D',
    low: '#0F7B6C',
};

export const R = {
    xs: 4, sm: 6, md: 8, lg: 12, xl: 16, xxl: 24, round: 999,
};

export const S = {
    xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28,
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { settings, loading } = useContext(SettingsContext);

    // Subscribe to system appearance if auto
    const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme());

    useEffect(() => {
        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme);
        });
        return () => sub?.remove?.();
    }, []);

    // Determine target mode
    const isDarkTheme = settings?.theme === 'auto' || !settings?.theme
        ? systemColorScheme === 'dark'
        : settings.theme === 'dark';

    const C = isDarkTheme ? DARK : LIGHT;

    const T = {
        h1: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, color: C.text },
        h2: { fontSize: 20, fontWeight: '600', letterSpacing: -0.2, color: C.text },
        h3: { fontSize: 20, fontWeight: '600', letterSpacing: -0.2, color: C.text },
        h4: { fontSize: 20, fontWeight: '600', letterSpacing: -0.2, color: C.text },
        h5: { fontSize: 15, fontWeight: '600', color: C.text },
        body: { fontSize: 15, fontWeight: '400', color: C.text, lineHeight: 22 },
        bodySm: { fontSize: 13, fontWeight: '400', color: C.textSub, lineHeight: 18 },
        label: { fontSize: 13, fontWeight: '500', color: C.textSub },
        cap: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2, color: C.textMuted },
    };

    // If settings haven't loaded, hold render
    if (loading) return null;

    return (
        <ThemeContext.Provider value={{ C, T, R, S, isDarkTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

// To prevent pure import destructuring crashes globally in legacy scripts
export const C = LIGHT;
export const T = {};
export const isDarkTheme = false;

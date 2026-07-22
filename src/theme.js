import { execSync } from 'child_process';

export const themes = {
  light: {
    name: 'light',
    fg: '#1a1a1a',
    bg: '#f4f4f4',
    border: '#888888',
    selected: { bg: '#e0e0e0', fg: '#000000' },
    header: { fg: '#333333' },
    success: '#2e7d32',
    error: '#c62828',
    spinner: '#555555',
  },
  dark: {
    name: 'dark',
    fg: '#e4e4e4',
    bg: '#1a1a2e',
    border: '#444466',
    selected: { bg: '#16213e', fg: '#ffffff' },
    header: { fg: '#a0a0c0' },
    success: '#69f0ae',
    error: '#ff5252',
    spinner: '#666688',
  },
};

export function detectTerminalTheme() {
  try {
    if (process.env.TERM_PROGRAM === 'Apple_Terminal' || process.env.TERM_PROGRAM === 'iTerm.app') {
      return 'dark';
    }

    if (process.env.COLORFGBG) {
      const parts = process.env.COLORFGBG.split(';');
      const bg = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(bg)) {
        const r = (bg >> 16) & 0xff;
        const g = (bg >> 8) & 0xff;
        const b = bg & 0xff;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5 ? 'dark' : 'light';
      }
    }

    if (process.platform === 'darwin') {
      const darkMode = execSync
        ('defaults read -g AppleInterfaceStyle 2>/dev/null', { encoding: 'utf8' })
        .trim();
      return darkMode === 'Dark' ? 'dark' : 'light';
    }
  } catch (e) {
    // fallback to dark
  }
  return 'dark';
}

export function getTheme(override) {
  const setting = override || process.env.GRAB_THEME || 'auto';
  if (setting === 'light') return themes.light;
  if (setting === 'dark') return themes.dark;
  const detected = detectTerminalTheme();
  return themes[detected];
}

export function applyThemeToScreen(screen, theme) {
  screen.style.fg = theme.fg;
  screen.style.bg = theme.bg;
}

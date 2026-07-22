import blessed from 'blessed';
import { getTheme } from '../theme.js';

let screenInstance = null;

export function createScreen(themeOverride) {
  screenInstance = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'grab',
    mouse: true,
    warnings: false,
    autoPadding: true,
  });

  const theme = getTheme(themeOverride);
  screenInstance.style.fg = theme.fg;
  screenInstance.style.bg = theme.bg;

  screenInstance.key(['C-c'], () => {
    process.exit(0);
  });

  return { screen: screenInstance, theme };
}

export function destroyScreen() {
  if (screenInstance) {
    try {
      screenInstance.destroy();
    } catch (e) {
      // ignore
    }
    screenInstance = null;
  }
}

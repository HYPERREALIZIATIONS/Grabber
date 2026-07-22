import { Command } from 'commander';
import blessed from 'blessed';
import { createScreen, destroyScreen } from './tui/screen.js';
import { createWelcomeScreen } from './tui/welcome.js';
import { showLoadingScreen } from './tui/welcome.js';
import { createPickerScreen } from './tui/picker.js';
import { createProgressScreen } from './tui/progress.js';
import { fetchFormats, downloadVideo } from './engine/download.js';

const program = new Command();

program
  .name('grab')
  .description('Polished terminal video downloader')
  .version('1.0.0')
  .option('-t, --theme <theme>', 'Theme: auto, light, dark', 'auto')
  .argument('[url]', 'Video URL to download');

program.parse();

async function run(url, theme) {
  const { screen, theme: currentTheme } = createScreen(theme);

  try {
    const loading = showLoadingScreen(screen, currentTheme, 'Fetching video info...');
    const data = await fetchFormats(url, (msg) => loading.update(msg));
    loading.destroy();

    const list = createPickerScreen(screen, currentTheme, data.formats, async (format) => {
      list.detach();
      const progress = createProgressScreen(screen, currentTheme);

      try {
        const filePath = await downloadVideo(url, format, (p) => {
          if (typeof p === 'string') {
            progress.update({ filename: p });
          } else {
            progress.update(p);
          }
        });

        progress.destroy();
        destroyScreen();

        console.log(`\nSaved to: ${filePath}`);
        process.exit(0);
      } catch (e) {
        progress.destroy();
        const errorBox = blessed.box({
          parent: screen,
          top: 'center',
          left: 'center',
          width: '50%',
          height: 'shrink',
          tags: true,
          border: { type: 'line' },
          style: {
            fg: currentTheme.fg,
            bg: currentTheme.bg,
            border: { fg: currentTheme.error },
          },
          content: `{center}{bold}${e.message}{/bold}{/center}`,
        });

        screen.render();
        await new Promise(resolve => setTimeout(resolve, 3000));
        errorBox.detach();
        process.exit(1);
      }
    });

    screen.render();
  } catch (e) {
    destroyScreen();
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

async function runWelcome(theme) {
  const { screen, theme: currentTheme } = createScreen(theme);

  const onSubmit = async (url) => {
    const welcomeBox = screen.children[0];
    if (welcomeBox) welcomeBox.detach();

    const loading = showLoadingScreen(screen, currentTheme, 'Fetching video info...');
    const data = await fetchFormats(url, (msg) => loading.update(msg));
    loading.destroy();

    const list = createPickerScreen(screen, currentTheme, data.formats, async (format) => {
      list.detach();
      const progress = createProgressScreen(screen, currentTheme);

      try {
        const filePath = await downloadVideo(url, format, (p) => {
          if (typeof p === 'string') {
            progress.update({ filename: p });
          } else {
            progress.update(p);
          }
        });

        progress.destroy();
        destroyScreen();

        console.log(`\nSaved to: ${filePath}`);
        process.exit(0);
      } catch (e) {
        progress.destroy();
        const errorBox = blessed.box({
          parent: screen,
          top: 'center',
          left: 'center',
          width: '50%',
          height: 'shrink',
          tags: true,
          border: { type: 'line' },
          style: {
            fg: currentTheme.fg,
            bg: currentTheme.bg,
            border: { fg: currentTheme.error },
          },
          content: `{center}{bold}${e.message}{/bold}{/center}`,
        });

        screen.render();
        await new Promise(resolve => setTimeout(resolve, 3000));
        errorBox.detach();
        process.exit(1);
      }
    });

    screen.render();
  };

  createWelcomeScreen(screen, currentTheme, onSubmit);
  screen.render();
}

const opts = program.opts();
const theme = opts.theme;

if (program.args[0]) {
  run(program.args[0], theme);
} else {
  runWelcome(theme);
}

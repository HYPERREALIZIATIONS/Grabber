import blessed from 'blessed';

export function createWelcomeScreen(screen, theme, onSubmit) {
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '70%',
    height: 9,
    tags: true,
    border: { type: 'line' },
    style: {
      fg: theme.fg,
      bg: theme.bg,
      border: { fg: theme.border },
    },
    content: '{center}{bold}{cyan-fg}grab{/cyan-fg}{/bold}\n\nPaste a video link to download it.\nSupports YouTube, X, Instagram, TikTok, Threads, and more.\n\n{/#888}Press Enter to submit, Ctrl+C to quit{/#888}{/center}',
  });

  const input = blessed.textbox({
    parent: box,
    top: 7,
    left: 2,
    width: box.width - 4,
    height: 1,
    inputOnFocus: true,
    mouse: true,
    keys: true,
    style: {
      fg: theme.fg,
      bg: theme.bg,
      focus: { bg: theme.selected.bg },
    },
  });

  const hint = blessed.text({
    parent: box,
    bottom: 0,
    left: 'center',
    width: 'shrink',
    height: 1,
    style: { fg: theme.spinner },
    content: '{center}Enter to submit | Esc to quit{/center}',
  });

  input.on('cancel', () => {
    process.exit(0);
  });

  input.on('submit', () => {
    const value = input.value.trim();
    if (value) {
      onSubmit(value);
    }
  });

  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

  box.focus();
  return { box, input };
}

export function showLoadingScreen(screen, theme, message) {
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '50%',
    height: 'shrink',
    tags: true,
    border: { type: 'line' },
    style: {
      fg: theme.fg,
      bg: theme.bg,
      border: { fg: theme.border },
    },
    content: `{center} ${message}{/center}`,
  });

  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    box.setContent(`{center} ${message}${'.'.repeat(dots)}{/center}`);
    box.screen.render();
  }, 300);

  return {
    update: (msg) => {
      box.setContent(`{center} ${msg}{/center}`);
      box.screen.render();
    },
    destroy: () => {
      clearInterval(interval);
      box.detach();
      screen.render();
    },
  };
}

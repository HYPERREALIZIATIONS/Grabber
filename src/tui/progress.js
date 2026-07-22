import blessed from 'blessed';

export function createProgressScreen(screen, theme) {
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '60%',
    height: 'shrink',
    tags: true,
    border: { type: 'line' },
    style: {
      fg: theme.fg,
      bg: theme.bg,
      border: { fg: theme.border },
    },
    label: ' Downloading ',
    content: '{center}Preparing...{/center}',
  });

  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

  box.visible = true;
  return {
    update: (progress) => {
      const percent = progress.percent || '0%';
      const speed = progress.speed || '';
      const eta = progress.eta || '';
      const total = progress.total || '';
      const filename = progress.filename || 'downloading...';

      const lines = [
        `{bold}${filename}{/bold}`,
        '',
        `  Size:      ${total}`,
        `  Progress:  ${percent}`,
        `  Speed:     ${speed}`,
        `  ETA:       ${eta}`,
        '',
        '{center}Press Ctrl+C to cancel{/center}',
      ].join('\n');

      box.setContent(lines);
      box.screen.render();
    },
    destroy: () => {
      box.detach();
      screen.render();
    },
  };
}

import blessed from 'blessed';

export function createPickerScreen(screen, theme, formats, onSelect) {
  const box = blessed.box({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '60%',
    height: '60%',
    tags: true,
    border: { type: 'line' },
    style: {
      fg: theme.fg,
      bg: theme.bg,
      border: { fg: theme.border },
    },
    label: ' Choose quality ',
  });

  const list = blessed.list({
    parent: box,
    top: 1,
    left: 1,
    width: box.width - 2,
    height: box.height - 2,
    mouse: true,
    keys: true,
    vi: false,
    style: {
      fg: theme.fg,
      bg: theme.bg,
      selected: { bg: theme.selected.bg, fg: theme.selected.fg },
      item: { fg: theme.fg },
    },
    items: formats.map(f => f.label),
  });

  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

  list.on('select', () => {
    const idx = list.selected;
    if (idx >= 0 && idx < formats.length) {
      onSelect(formats[idx]);
    }
  });

  list.on('cancel', () => {
    process.exit(0);
  });

  list.focus();
  return list;
}

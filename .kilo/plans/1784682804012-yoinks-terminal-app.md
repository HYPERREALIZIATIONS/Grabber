# grab — Terminal Video Downloader

## Goal
Build a polished terminal app (`grab`) that downloads videos from YouTube, X/Twitter, Instagram, Threads, TikTok, and similar sites. It must support interactive URL pasting, a full-screen quality picker with keyboard + mouse navigation, automatic theme support, and transparent yt-dlp/ffmpeg installation.

## Tech Stack
| Purpose | Package / Tool | Rationale |
|---|---|---|
| TUI framework | `blessed` | Mature, built-in mouse + keyboard widget set, centered layout, themes. |
| Download engine | `ytdlp-nodejs` | Auto-downloads the standalone yt-dlp binary and ffmpeg; exposes JSON format info and progress events. |
| CLI parsing | `commander` | Standard, minimal boilerplate for `yoinks [url]` and `--theme`. |
| Runtime | Node.js ≥ 18 | Required by the environment. |

## Architecture
```
src/
├── cli.js            # Entry point, argv parsing, launch flow
├── tui/
│   ├── screen.js     # Screen creation, theme init, cleanup
│   ├── welcome.js    # URL input / paste screen
│   ├── picker.js     # Full-screen format picker list
│   └── progress.js   # Download progress overlay
├── engine/
│   ├── binaries.js   # Ensure yt-dlp + ffmpeg exist, cache to ~/.cache/yoinks/
│   ├── formats.js    # Fetch formats, parse into human-friendly options
│   └── download.js   # Execute download with progress events
└── theme.js          # Theme definitions, auto-detect logic
```

## User Flow
1. **Launch**
   - `yoinks [url]` or `yoinks`
   - If URL is passed, skip the welcome screen and fetch formats immediately.
   - If no URL, show a centered welcome screen with instructions and a textbox to paste a link.

2. **Welcome Screen**
   - Title: `yoinks`
   - Subtitle: paste a video link anywhere
   - `textbox` widget: accepts typed input and pasted text (Ctrl+V / Cmd+V / right-click paste).
   - Keys: `Enter` to submit, `Ctrl+C` / `q` to quit.
   - Shows a loading spinner or message while fetching formats.

3. **Format Picker** (full-screen `blessed.List`)
   - Centered vertically, width ~60%, border `line`.
   - Header line: "Choose quality".
   - Items (curated list, built from `getFormatsAsync` / `getInfoAsync`):
     - `Best Video & Audio (MP4)`
     - `4K (2160p) MP4` (if available)
     - `1440p MP4` (if available)
     - `1080p MP4`
     - `720p MP4`
     - `480p MP4`
     - `360p MP4` (if available)
     - `Audio Only (MP3)`
   - Keyboard nav: `up`/`down` arrows, `Enter` to download, `q`/`Esc` to back.
   - Mouse: click to select and download.
   - Empty states: if no formats found, show error and allow retry.

4. **Download Progress**
   - Full-width or centered box beneath the header.
   - Text: filename, downloaded size / total size, speed, ETA.
   - Progress bar updates via `onProgress` events.
   - Abort option: `Ctrl+C` cancels the download and returns to the picker.

5. **Completion**
   - Brief success message.
   - Restore terminal, print the final file path to stdout:
     `Saved to: /Users/you/Downloads/…`

## Binary Management
1. On first run, instantiate `YtDlp` with no `binaryPath`.
2. Call `helpers.downloadYtDlp()` (or `new YtDlp().downloadYtDlp()`) to cache the standalone binary to `~/.cache/yoinks/yt-dlp`.
3. Before downloading, check `checkInstallationAsync({ ffmpeg: true })`; if missing, call `downloadFFmpeg()` and cache alongside.
4. Reuse the cached binaries on subsequent runs.

## Theme System
Three themes: `light`, `dark`, `auto`.

**Palettes**
- Light: `fg: #1a1a1a`, `bg: #f4f4f4`, border `#888`, selected bg `#e0e0e0`, selected fg `#000`.
- Dark: `fg: #e4e4e4`, `bg: #1a1a2e`, border `#444`, selected bg `#16213e`, selected fg `#fff`.

**Auto detection**
- Attempt OSC 11 background-color escape sequence:
  - Write `\e]11;?\a` to the terminal, read response.
  - Parse hex color `#RRGGBB`; compute luminance.
  - If luminance < 0.5 → dark, else light.
- If OSC 11 is unsupported or times out (1s), fall back to dark.

**Environment overrides**
- `YONKS_THEME=auto|light|dark` (default: auto).

**Application**
- `screen` option sets base `style.fg` / `style.bg`.
- Each widget inherits theme via explicit `style` overrides.
- Blessed tags (`{bold}`, `{cyan-fg}`) are used for emphasis where needed.

## Output Path
- Default output template: `~/Downloads/%(title)s.%(ext)s`
- We resolve `os.homedir() + '/Downloads'` and pass it via `.output()` to the builder.
- After download, `result.filePaths[0]` is the saved path; restore terminal and `console.log()` it.

## Error Handling
- Invalid URL or unsupported site: show error box inside TUI, offer retry or quit.
- Download failure (network, age-gate, geo-block): show error, allow retry or return to picker.
- User abort (`Ctrl+C`): kill the spawned yt-dlp process, clean up, restore terminal, silent exit.
- Missing dependencies: rely on `ytdlp-nodejs` auto-download with a visible loading message.

## Packaging
- `package.json` includes:
  - `name: yoinks`
  - `version: 1.0.0`
  - `bin: { yoinks: "./src/cli.js" }`
  - `dependencies: blessed, ytdlp-nodejs, commander`
  - `engines: { node: ">=18" }`

## Validation
- `npm install` completes without errors.
- `node src/cli.js --help` renders help text correctly.
- `node src/cli.js https://www.youtube.com/watch?v=dQw4w9WgXcQ` enters the picker (can be manually verified).
- `npm run lint` (if configured) passes.

## Open Questions
1. **Audio extraction format**: The spec says "audio only mp3". Should we always convert to MP3, or should `audioonly` show the raw container and let the user choose? (Recommendation: Audio Only always outputs MP3 for simplicity, since ffmpeg is already installed.)
2. **Paste behavior**: If the user's terminal doesn't support right-click or Ctrl+V paste into a blessed textbox, should we also read stdin on launch if it's not a TTY? (Recommendation: yes, if `process.stdin.isTTY` is false, read the first line as the URL immediately.)
3. **Playlist support**: Should we detect playlists and offer "download all" vs "pick one video"? (Recommendation: out of scope for v1; treat playlist URL as "download all" with default best quality, or show first video only.)

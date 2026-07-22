import os from 'os';
import path from 'path';
import fs from 'fs';
import { getYtDlp } from './binaries.js';
import { parseFormats } from './formats.js';

export async function fetchFormats(url, onProgress) {
  const ytdlp = await getYtDlp();
  onProgress && onProgress('Fetching video info...');

  let info;
  try {
    info = await ytdlp.getInfoAsync(url);
  } catch (e) {
    throw new Error(`Failed to fetch video info: ${e.message}`);
  }

  const formats = parseFormats(info);
  return { formats, title: info.title || 'video', info };
}

export async function downloadVideo(url, formatOption, onProgress) {
  const downloadsDir = path.join(os.homedir(), 'Downloads');
  const ytdlp = await getYtDlp();

  const outputTemplate = path.join(downloadsDir, '%(title)s.%(ext)s');

  onProgress && onProgress('Starting download...');

  let result;
  try {
    result = await ytdlp.downloadAsync(url, {
      format: formatOption,
      output: outputTemplate,
      onProgress: (p) => {
        if (onProgress) {
          const percent = p.percentage ? `${p.percentage.toFixed(1)}%` : '...';
          const speed = p.speed ? `${(p.speed / 1024 / 1024).toFixed(1)} MB/s` : '';
          const eta = p.eta ? `${Math.floor(p.eta / 60)}:${String(Math.floor(p.eta % 60)).padStart(2, '0')}` : '';
          const total = p.totalSize ? `${(p.totalSize / 1024 / 1024).toFixed(1)} MB` : '';
          onProgress({ percent, speed, eta, total, filename: p.filename || 'downloading...' });
        }
      },
    });
  } catch (e) {
    throw new Error(`Download failed: ${e.message}`);
  }

  if (result && result.filePaths && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  throw new Error('Download completed but no file was saved');
}

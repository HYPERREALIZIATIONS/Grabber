import os from 'os';
import path from 'path';
import fs from 'fs';
import { YtDlp, helpers } from 'ytdlp-nodejs';

const CACHE_DIR = path.join(os.homedir(), '.cache', 'grab');
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

export function getCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  return CACHE_DIR;
}

export function getYtDlpPath() {
  return path.join(getCacheDir(), 'yt-dlp');
}

export function getFfmpegPath() {
  return path.join(getCacheDir(), 'ffmpeg');
}

export function getDownloadsDir() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
  return DOWNLOADS_DIR;
}

let ytDlpInstance = null;

export async function getYtDlp() {
  if (ytDlpInstance) return ytDlpInstance;

  const cacheDir = getCacheDir();
  const ytDlpPath = path.join(cacheDir, 'yt-dlp');
  let binaryPath = ytDlpPath;

  if (!fs.existsSync(ytDlpPath)) {
    await helpers.downloadYtDlp(cacheDir);
    binaryPath = path.join(cacheDir, 'yt-dlp', 'yt-dlp');
  }

  const ffmpegPath = path.join(cacheDir, 'ffmpeg');
  if (!fs.existsSync(ffmpegPath)) {
    try {
      await helpers.downloadFFmpeg(ffmpegPath);
    } catch (e) {
      console.warn('Could not download ffmpeg, may need it for merging formats');
    }
  }

  ytDlpInstance = new YtDlp({
    binaryPath: binaryPath,
    ffmpegPath: ffmpegPath,
  });

  return ytDlpInstance;
}

export async function ensureBinaries(onProgress) {
  onProgress && onProgress('Checking yt-dlp...');
  const cacheDir = getCacheDir();
  const ytDlpPath = path.join(cacheDir, 'yt-dlp');
  if (!fs.existsSync(ytDlpPath)) {
    onProgress && onProgress('Downloading yt-dlp...');
    await helpers.downloadYtDlp(cacheDir);
  }

  onProgress && onProgress('Checking ffmpeg...');
  const ffmpegPath = path.join(cacheDir, 'ffmpeg');
  if (!fs.existsSync(ffmpegPath)) {
    onProgress && onProgress('Downloading ffmpeg...');
    await helpers.downloadFFmpeg(ffmpegPath);
  }
}

export function parseFormats(info) {
  const formats = info.formats || [];
  const items = [];

  const audioOnly = formats.find(f => f.acodec && f.vcodec === 'none' && f.ext === 'mp3');
  if (!audioOnly) {
    const bestAudio = formats
      .filter(f => f.acodec && f.vcodec === 'none')
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];
    if (bestAudio) items.push({ label: 'Audio Only (MP3)', filter: 'audioonly', type: 'mp3', quality: 0 });
  } else {
    items.push({ label: 'Audio Only (MP3)', filter: 'audioonly', type: 'mp3', quality: 0 });
  }

  const videoResolutions = ['2160p', '1440p', '1080p', '720p', '480p', '360p'];
  const availableRes = new Set();
  const mergedFormats = formats.filter(f => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none');
  const videoOnlyFormats = formats.filter(f => f.vcodec && f.vcodec !== 'none' && (!f.acodec || f.acodec === 'none'));

  for (const f of videoOnlyFormats) {
    if (f.height) availableRes.add(`${f.height}p`);
  }
  for (const f of mergedFormats) {
    if (f.height) availableRes.add(`${f.height}p`);
  }

  const sortedAvailable = videoResolutions.filter(r => availableRes.has(r));

  for (const res of sortedAvailable) {
    const hasDirect = mergedFormats.some(f => f.height && `${f.height}p` === res && (f.ext === 'mp4' || f.ext === 'webm'));
    if (hasDirect) {
      items.push({ label: `${res} (MP4)`, filter: 'audioandvideo', type: 'mp4', quality: res });
    } else {
      items.push({ label: `${res} (MP4)`, filter: 'mergevideo', type: 'mp4', quality: res });
    }
  }

  const bestVideo = formats.filter(f => f.vcodec && f.vcodec !== 'none');
  const bestMerged = mergedFormats.length > 0;
  if (bestMerged || bestVideo.length > 0) {
    const existing = items.find(i => i.label.includes('Best Video'));
    if (!existing) {
      items.unshift({ label: 'Best Video & Audio (MP4)', filter: 'mergevideo', type: 'mp4', quality: 'highest' });
    }
  }

  return items;
}

export function getVideoTitle(info) {
  return info.title || 'video';
}

export function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, ' ').trim() || 'video';
}

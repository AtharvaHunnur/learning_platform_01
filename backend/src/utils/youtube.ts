/**
 * Extracts YouTube Video ID from various URL formats
 */
export const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Returns the max resolution thumbnail URL for a YouTube video
 */
export const getYouTubeThumbnail = (url: string): string | null => {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Extracts YouTube Playlist ID from a URL
 */
export const getYouTubePlaylistId = (url: string): string | null => {
  const match = url.match(/[?&]list=([^#\&\?]+)/);
  return match ? match[1] : null;
};

/**
 * Parses duration text (e.g. 10:24) into seconds
 */
export const parseDurationToSeconds = (durationText: string): number => {
  if (!durationText) return 0;
  const parts = durationText.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
};

/**
 * Fetches playlist videos natively by parsing ytInitialData
 */
export const getPlaylistVideos = async (playlistId: string): Promise<any[]> => {
  try {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' }
    });
    const html = await response.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!match) return [];
    
    const data = JSON.parse(match[1]);
    const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs;
    if (!tabs) return [];
    
    let items = [];
    for (const tab of tabs) {
      const contents = tab.tabRenderer?.content?.sectionListRenderer?.contents;
      if (contents) {
        for (const content of contents) {
          const listRenderer = content.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer;
          if (listRenderer && listRenderer.contents) {
            items = listRenderer.contents;
            break;
          }
        }
      }
      if (items.length > 0) break;
    }

    const videos = [];
    for (const item of items) {
      const vid = item.playlistVideoRenderer;
      if (vid && vid.isPlayable) {
        videos.push({
          id: vid.videoId,
          title: vid.title?.runs?.[0]?.text || 'Untitled Video',
          durationText: vid.lengthText?.simpleText || '0:00',
          thumbnail: `https://img.youtube.com/vi/${vid.videoId}/maxresdefault.jpg`
        });
      }
    }
    return videos;
  } catch (err) {
    console.error("Failed to fetch playlist items", err);
    return [];
  }
};

/**
 * Fetches details for a single video
 */
export const getSingleVideoDetails = async (videoId: string) => {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
    const html = await response.text();
    
    let title = 'Untitled Video';
    const titleMatch = html.match(/<meta itemprop="name" content="(.*?)">/);
    if (titleMatch) title = titleMatch[1];
    
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    let durationSeconds = 0;
    
    if (playerResponseMatch) {
       const data = JSON.parse(playerResponseMatch[1]);
       durationSeconds = parseInt(data.videoDetails?.lengthSeconds || '0', 10);
       if (!titleMatch && data.videoDetails?.title) {
          title = data.videoDetails.title;
       }
    }
    
    return {
      id: videoId,
      title,
      durationText: durationSeconds > 0 ? `${Math.floor(durationSeconds/60)}:${(durationSeconds%60).toString().padStart(2,'0')}` : '0:00',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  } catch(e) {
    console.error("Failed to fetch video details", e);
    return null;
  }
};

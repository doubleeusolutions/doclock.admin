/**
 * Video Utilities for DocLock Mobile App
 * Supports YouTube ID extraction, thumbnail resolution, and embed helpers.
 */

export function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isYouTubeUrl(url?: string | null): boolean {
  return !!getYouTubeId(url);
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1&rel=0&modestbranding=1`;
}

export function resolveVideoThumbnail(thumbnailUrl?: string | null, videoUrl?: string | null): string {
  if (thumbnailUrl && thumbnailUrl.trim().length > 0) {
    return thumbnailUrl.trim();
  }
  const ytId = getYouTubeId(videoUrl);
  if (ytId) {
    return getYouTubeThumbnail(ytId);
  }
  return 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80';
}

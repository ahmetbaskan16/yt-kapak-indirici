
import { Resolution } from '../types';

export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

export const getThumbnailUrl = (videoId: string, resolution: Resolution): string => {
  const base = `https://img.youtube.com/vi/${videoId}/`;
  switch (resolution) {
    case 'maxres': return `${base}maxresdefault.jpg`;
    case 'sd': return `${base}sddefault.jpg`;
    case 'hq': return `${base}hqdefault.jpg`;
    case 'mq': return `${base}mqdefault.jpg`;
    case 'default': return `${base}default.jpg`;
    default: return `${base}hqdefault.jpg`;
  }
};

export const resolutionLabels: Record<Resolution, string> = {
  maxres: '4K/1080p (MaxRes)',
  sd: '720p (Standard)',
  hq: '480p (High)',
  mq: '360p (Medium)',
  default: '120p (Default)'
};

export const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error('Download failed', error);
    return false;
  }
};

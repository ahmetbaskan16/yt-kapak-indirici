
export type Resolution = 'default' | 'mq' | 'hq' | 'sd' | 'maxres';

export interface ThumbnailInfo {
  id: string;
  videoId: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export enum TabType {
  DOWNLOADER = 'İndirici',
  HISTORY = 'Geçmiş',
  FAVORITES = 'Favoriler'
}

import React from 'react';
import { ThumbnailInfo } from '../types';
import { downloadImage } from '../services/youtube';

interface ThumbnailCardProps {
  item: ThumbnailInfo;
  onRemove?: (id: string) => void;
  onToggleFavorite?: (item: ThumbnailInfo) => void;
  isFavorite?: boolean;
  onSelect?: (videoId: string) => void;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ item, onRemove, onToggleFavorite, isFavorite, onSelect }) => {
  return (
    <div className="bg-[#1f1f1f] rounded-lg overflow-hidden group border border-transparent hover:border-[#ff0000] transition-all">
      <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => onSelect?.(item.videoId)}>
        <img src={item.url} alt={`YouTube Kapak Resmi ${item.videoId}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2 mb-2 text-gray-200">Video ID: {item.videoId}</h3>
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={() => downloadImage(item.url, `yt-kapak-${item.videoId}.jpg`)}
            className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            İndir
          </button>
          <div className="flex gap-2">
            {onToggleFavorite && (
              <button 
                onClick={() => onToggleFavorite(item)}
                className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-[#ff0000] bg-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
            {onRemove && (
              <button 
                onClick={() => onRemove(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailCard;
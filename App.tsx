
import React, { useState, useEffect } from 'react';
import { TabType, ThumbnailInfo, ToastMessage } from './types';
import { extractVideoId, getThumbnailUrl, downloadImage, resolutionLabels } from './services/youtube';
import Toast from './components/Toast';
import ThumbnailCard from './components/ThumbnailCard';

const STORAGE_KEYS = {
  HISTORY: 'yt_thumb_history_v2',
  FAVORITES: 'yt_thumb_favorites_v2'
};

const AdUnit: React.FC<{ slot?: string }> = ({ slot }) => (
  <div className="my-8 mx-auto w-full max-w-4xl overflow-hidden flex flex-col items-center">
    <span className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Sponsorlu Reklam</span>
    <div className="w-full bg-white/5 border border-white/5 rounded-lg flex items-center justify-center min-h-[90px] md:min-h-[250px]">
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-2955495316558332"
           data-ad-slot={slot || "default"}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TabType.DOWNLOADER);
  const [urlInput, setUrlInput] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [history, setHistory] = useState<ThumbnailInfo[]>([]);
  const [favorites, setFavorites] = useState<ThumbnailInfo[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense yükleme hatası", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleExtract = () => {
    const videoId = extractVideoId(urlInput);
    if (videoId) {
      setSelectedVideoId(videoId);
      const newHistoryItem: ThumbnailInfo = {
        id: Math.random().toString(36).substring(2, 9),
        videoId,
        url: getThumbnailUrl(videoId, 'hq'),
        title: `YouTube Video ${videoId}`,
        timestamp: Date.now()
      };
      setHistory(prev => {
        const filtered = prev.filter(h => h.videoId !== videoId);
        return [newHistoryItem, ...filtered].slice(0, 50);
      });
      addToast('Kapak resmi başarıyla getirildi!', 'success');
    } else {
      addToast('Geçersiz YouTube URL\'si. Lütfen kontrol edin.', 'error');
    }
  };

  const toggleFavorite = (item: ThumbnailInfo) => {
    const isFav = favorites.some(f => f.videoId === item.videoId);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.videoId !== item.videoId));
      addToast('Favorilerden çıkarıldı.', 'info');
    } else {
      setFavorites(prev => [item, ...prev]);
      addToast('Favorilere eklendi!', 'success');
    }
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleDownload = async (res: any) => {
    if (!selectedVideoId) return;
    const url = getThumbnailUrl(selectedVideoId, res);
    const success = await downloadImage(url, `youtube-kapak-${selectedVideoId}-${res}.jpg`);
    if (success) {
      addToast(`Görüntü (${res}) indiriliyor...`, 'success');
    } else {
      addToast('İndirme başarısız. Bu çözünürlük YouTube sunucularında bulunamadı.', 'error');
    }
  };

  const onSelectFromHistory = (videoId: string) => {
    setSelectedVideoId(videoId);
    setActiveTab(TabType.DOWNLOADER);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-white selection:bg-[#ff0000] selection:text-white">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(TabType.DOWNLOADER)}>
          <div className="bg-[#ff0000] p-1.5 rounded-lg shadow-lg shadow-red-600/20">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tighter">YouTube <span className="text-[#ff0000]">Kapak</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => setActiveTab(TabType.DOWNLOADER)} className={`text-sm font-medium transition-colors hover:text-white ${activeTab === TabType.DOWNLOADER ? 'text-white' : 'text-gray-400'}`}>İndirici</button>
          <button onClick={() => setActiveTab(TabType.HISTORY)} className={`text-sm font-medium transition-colors hover:text-white ${activeTab === TabType.HISTORY ? 'text-white' : 'text-gray-400'}`}>Geçmiş</button>
          <button onClick={() => setActiveTab(TabType.FAVORITES)} className={`text-sm font-medium transition-colors hover:text-white ${activeTab === TabType.FAVORITES ? 'text-white' : 'text-gray-400'}`}>Favoriler</button>
          <button onClick={() => setActiveTab('About')} className={`text-sm font-medium transition-colors hover:text-white ${activeTab === 'About' ? 'text-white' : 'text-gray-400'}`}>Hakkımızda</button>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">v2.1 Pro</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {activeTab === TabType.DOWNLOADER && (
          <div className="space-y-12">
            <section className="bg-gradient-to-br from-[#1f1f1f] to-[#121212] p-8 md:p-16 rounded-3xl shadow-2xl border border-white/5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff0000] to-transparent opacity-50"></div>
              <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-none">YouTube Kapak Resmini <br/><span className="text-[#ff0000]">HD İndir.</span></h1>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Video linkini yapıştırın ve saniyeler içinde 4K, HD veya SD kalitesinde kapak görsellerini cihazınıza kaydedin.
              </p>
              
              <div className="relative group max-w-3xl mx-auto">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#0a0a0a] border-2 border-white/10 focus:border-[#ff0000] focus:outline-none rounded-2xl py-5 px-6 text-lg transition-all pr-36 placeholder:text-gray-700 shadow-inner"
                />
                <button
                  onClick={handleExtract}
                  className="absolute right-2 top-2 bottom-2 bg-[#ff0000] hover:bg-[#cc0000] text-white px-8 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                  Getir
                </button>
              </div>
            </section>

            <AdUnit slot="home-top" />

            {selectedVideoId && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 shadow-xl">
                <div className="space-y-4">
                   <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/5 group">
                      <img 
                        src={getThumbnailUrl(selectedVideoId, 'maxres')} 
                        alt="Kapak Resmi Önizleme" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = getThumbnailUrl(selectedVideoId, 'hq'); }}
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"></div>
                   </div>
                   <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                     <span>ID: {selectedVideoId}</span>
                     <button 
                       onClick={() => toggleFavorite({id:Math.random().toString(), videoId:selectedVideoId, url:getThumbnailUrl(selectedVideoId, 'hq'), title:'', timestamp:Date.now()})} 
                       className={`flex items-center gap-1 font-bold transition-colors ${favorites.some(f=>f.videoId===selectedVideoId) ? 'text-[#ff0000]' : 'hover:text-white'}`}
                     >
                       <svg className="w-4 h-4" fill={favorites.some(f=>f.videoId===selectedVideoId) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                       {favorites.some(f=>f.videoId===selectedVideoId) ? 'Favorilerde' : 'Favorilere Ekle'}
                     </button>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-black mb-2 tracking-tight">Kalite Seçin</h2>
                  {(['maxres', 'sd', 'hq', 'mq', 'default'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => handleDownload(res)}
                      className="group flex items-center justify-between bg-white/5 hover:bg-[#ff0000] p-5 rounded-2xl transition-all border border-white/5 hover:border-transparent"
                    >
                      <div className="text-left">
                        <span className="block font-bold text-lg group-hover:text-white transition-colors">{resolutionLabels[res]}</span>
                        <span className="text-xs text-gray-500 uppercase group-hover:text-white/70">{res === 'maxres' ? 'Önerilen' : 'Standart'}</span>
                      </div>
                      <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <article className="prose prose-invert max-w-none bg-[#111111] p-10 md:p-16 rounded-3xl border border-white/5 shadow-lg">
              <header className="mb-10 border-l-4 border-[#ff0000] pl-6">
                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">YouTube Thumbnail İndirme Rehberi</h2>
                <p className="text-gray-500">YouTube videolarından yüksek çözünürlüklü kapak resimleri nasıl alınır?</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-400 leading-relaxed">
                <section className="space-y-4">
                  <h3 className="text-2xl font-bold text-white tracking-tight">YouTube Thumbnail Nedir?</h3>
                  <p>
                    YouTube thumbnail veya Türkçesiyle <strong>kapak resmi</strong>, bir videonun tıklanma oranını (CTR) belirleyen en önemli görsel unsurdur. Profesyonel bir içerik üreticisi olarak, rakip kanalların kapak tasarımlarını incelemek, renk paletlerini analiz etmek veya kendi projelerinizde referans olarak kullanmak için bu görsellere ihtiyaç duyabilirsiniz.
                  </p>
                  <p>
                    Bu araç, herhangi bir YouTube videosunun kapak fotoğrafını orijinal kalitesinde (Full HD, 4K) çekip indirmenizi sağlayan hızlı ve güvenli bir platformdur.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Kapak Resmi Nasıl İndirilir?</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3"><span className="text-[#ff0000] font-black">01.</span> Videonun URL'sini YouTube üzerinden kopyalayın.</li>
                    <li className="flex gap-3"><span className="text-[#ff0000] font-black">02.</span> Arama kutusuna linki yapıştırın ve "Getir" butonuna basın.</li>
                    <li className="flex gap-3"><span className="text-[#ff0000] font-black">03.</span> Listelenen farklı çözünürlükler arasından ihtiyacınız olanı seçin.</li>
                    <li className="flex gap-3"><span className="text-[#ff0000] font-black">04.</span> "İndir" butonuna tıklayarak görseli saniyeler içinde kaydedin.</li>
                  </ul>
                </section>
              </div>

              <AdUnit slot="article-mid" />

              <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Sıkça Sorulan Sorular (SSS)</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[#ff0000] font-bold mb-1">İndirdiğim görseller telifli mi?</h4>
                    <p className="text-sm">Evet, görsellerin telif hakları ilgili video üreticisine aittir. Bu görselleri ticari projelerinizde kullanmadan önce sahiplerinden izin almanız yasal açıdan önemlidir.</p>
                  </div>
                  <div>
                    <h4 className="text-[#ff0000] font-bold mb-1">En yüksek hangi kalitede indirebilirim?</h4>
                    <p className="text-sm">Eğer içerik üreticisi videoya yüksek kaliteli bir kapak yüklediyse, <strong>MaxResDefault</strong> seçeneği ile 1920x1080 çözünürlüğünde indirebilirsiniz.</p>
                  </div>
                  <div>
                    <h4 className="text-[#ff0000] font-bold mb-1">Bu servis ücretsiz mi?</h4>
                    <p className="text-sm">Evet, servisimiz tamamen ücretsizdir ve herhangi bir kayıt veya üyelik gerektirmez.</p>
                  </div>
                </div>
              </div>
            </article>

            <AdUnit slot="home-bottom" />
          </div>
        )}

        {activeTab === TabType.HISTORY && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black uppercase tracking-tight">Arama Geçmişi</h1>
              <button 
                onClick={() => { setHistory([]); addToast('Geçmiş temizlendi.', 'info'); }}
                className="text-xs text-gray-500 hover:text-[#ff0000] transition-colors font-bold uppercase"
              >
                Hepsini Sil
              </button>
            </div>
            {history.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(item => (
                  <ThumbnailCard 
                    key={item.id} 
                    item={item} 
                    onRemove={removeFromHistory} 
                    isFavorite={favorites.some(f=>f.videoId===item.videoId)} 
                    onToggleFavorite={toggleFavorite}
                    onSelect={onSelectFromHistory}
                  />
                ))}
              </div>
            ) : <EmptyState message="Henüz bir video sorgulamadınız." />}
          </div>
        )}

        {activeTab === TabType.FAVORITES && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-black uppercase tracking-tight">Beğendiğim Kapaklar</h1>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(item => (
                  <ThumbnailCard 
                    key={item.id} 
                    item={item} 
                    isFavorite={true} 
                    onToggleFavorite={toggleFavorite}
                    onSelect={onSelectFromHistory}
                  />
                ))}
              </div>
            ) : <EmptyState message="Henüz favorilere kapak eklemediniz." icon="heart" />}
          </div>
        )}

        {activeTab === 'About' && (
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in py-10">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black">Hakkımızda</h1>
              <p className="text-gray-400 text-lg">YouTube içerik üreticileri için geliştirilmiş, saniyeler içinde yüksek kaliteli veri sunan profesyonel bir araçtır.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-white/5 rounded-3xl border border-white/5 transition-transform hover:-translate-y-1">
                 <h3 className="font-bold text-xl mb-3 text-white">Işık Hızında</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Doğrudan YouTube sunucularına bağlanarak bekleme süresini minimize ediyoruz.</p>
               </div>
               <div className="p-8 bg-white/5 rounded-3xl border border-white/5 transition-transform hover:-translate-y-1">
                 <h3 className="font-bold text-xl mb-3 text-white">%100 Güvenli</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Hiçbir verinizi kendi sunucumuzda saklamıyoruz. Aramalarınız sadece sizin tarayıcınızda kalır.</p>
               </div>
            </div>
            <div className="bg-[#ff0000]/10 p-8 rounded-3xl border border-[#ff0000]/20 text-center">
              <h3 className="font-bold text-xl mb-2">Destek</h3>
              <p className="text-sm text-gray-400">Her türlü soru ve öneri için bize ulaşabilirsiniz.</p>
            </div>
          </div>
        )}

        {activeTab === 'Privacy' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-10">
            <h1 className="text-3xl font-black uppercase">Gizlilik ve Kullanım</h1>
            <p className="text-gray-400 leading-relaxed">
              Kullanıcı gizliliğine önem veriyoruz. Sitemizde yapılan aramalar sunucu taraflı kaydedilmez; tüm veriler tarayıcınızın <strong>Yerel Depolama (Local Storage)</strong> alanında tutulur. 
              Sitemiz Google AdSense reklam ağını kullanmaktadır. Google, ilgi alanlarınıza göre reklam göstermek için çerezleri (cookies) kullanabilir.
            </p>
            <p className="text-gray-400 leading-relaxed italic border-t border-white/5 pt-6">
              Not: Bu site resmi olarak YouTube veya Google ile bağlı değildir. Tüm logolar ve görseller ilgili hak sahiplerine aittir.
            </p>
          </div>
        )}
      </main>

      <footer className="bg-[#0a0a0a] border-t border-white/5 py-16 px-4 mt-20">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-12">
            <div>
              <span className="text-3xl font-black text-white mb-6 block">YouTube <span className="text-[#ff0000]">Kapak</span></span>
              <p className="text-gray-500 text-sm leading-relaxed">
                YouTube dünyasında tasarım ve analiz yapmanın en hızlı yolu. Profesyoneller için tasarlanmış HD kapak resmi indirme platformu.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Menü</h4>
              <ul className="text-gray-500 text-sm space-y-3">
                <li><button onClick={() => setActiveTab(TabType.DOWNLOADER)} className="hover:text-white transition-colors">Ana Sayfa</button></li>
                <li><button onClick={() => setActiveTab(TabType.HISTORY)} className="hover:text-white transition-colors">Geçmiş</button></li>
                <li><button onClick={() => setActiveTab(TabType.FAVORITES)} className="hover:text-white transition-colors">Favoriler</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Yasal Bilgiler</h4>
              <ul className="text-gray-500 text-sm space-y-3">
                <li><button onClick={() => setActiveTab('Privacy')} className="hover:text-white transition-colors">Gizlilik Politikası</button></li>
                <li><button onClick={() => setActiveTab('About')} className="hover:text-white transition-colors">Hakkımızda</button></li>
                <li><button onClick={() => setActiveTab('Privacy')} className="hover:text-white transition-colors">Kullanım Şartları</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 text-center">
            <p className="text-gray-600 text-xs mb-2 italic">Designed for Content Creators & Designers</p>
            <p className="text-gray-700 text-[10px]">&copy; {new Date().getFullYear()} Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

const EmptyState: React.FC<{ message: string; icon?: 'history' | 'heart' }> = ({ message, icon = 'history' }) => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-700 bg-white/2 rounded-3xl border border-dashed border-white/10">
    <div className="mb-6 opacity-20">
      {icon === 'history' ? (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </div>
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm mt-2 opacity-50">Üstteki kutuya bir video linki yapıştırarak başlayın.</p>
  </div>
);

export default App;
"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faExpand, faVolumeHigh, faVolumeMute, 
  faForwardStep, faBackwardStep, faGear,
  faUpRightAndDownLeftFromCenter, faKeyboard,
  faRotateRight, faCirclePlay
} from "@fortawesome/free-solid-svg-icons";

interface MultiSourcePlayerProps {
  sources: { name: string; url: string; type: 'embed' | 'm3u8'; source: string }[];
  onEpisodeNext?: () => void;
  onEpisodePrev?: () => void;
  movieName?: string;
  episodeName?: string;
}

export default function MultiSourcePlayer({ sources, onEpisodeNext, onEpisodePrev, movieName, episodeName }: MultiSourcePlayerProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const currentSource = sources[currentSourceIndex];

  const handleNextSource = () => {
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex(currentSourceIndex + 1);
      setLoading(true);
      setError(false);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
    handleNextSource();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') setShowShortcuts(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full flex flex-col bg-[#0a0c14] rounded-xl overflow-hidden shadow-2xl">
      {/* Tabs */}
      <div className="flex gap-2 p-3 bg-[#0F111A] overflow-x-auto scrollbar-hide">
        {sources.map((src, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentSourceIndex(idx);
              setLoading(true);
              setError(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              idx === currentSourceIndex 
                ? 'bg-[#FFD875] text-black' 
                : 'bg-[#1E2030] text-white hover:bg-[#2a2d3e]'
            }`}
          >
            <span className={`source-badge-${src.source.toLowerCase()} w-2 h-2 rounded-full bg-current`} />
            {src.name}
          </button>
        ))}
      </div>

      {/* Player Area */}
      <div className="relative w-full aspect-video bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="w-10 h-10 border-4 border-[#FFD875] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 gap-4 text-white">
            <p>Lỗi tải video từ nguồn này</p>
            {currentSourceIndex < sources.length - 1 && (
              <button onClick={handleNextSource} className="px-4 py-2 bg-[#FFD875] text-black rounded font-medium">
                Thử nguồn tiếp theo
              </button>
            )}
          </div>
        )}

        {currentSource && currentSource.type === 'embed' && (
          <iframe
            ref={iframeRef}
            src={currentSource.url}
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
        
        {/* Shortcuts Overlay */}
        {showShortcuts && (
          <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center text-white">
            <div className="p-6 bg-[#1E2030] rounded-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faKeyboard} /> Phím tắt
              </h3>
              <ul className="space-y-2">
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">?</kbd> Đóng/Mở bảng này</li>
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd> Tập tiếp theo</li>
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> Tập trước</li>
              </ul>
              <button onClick={() => setShowShortcuts(false)} className="mt-6 px-4 py-2 bg-[#FFD875] text-black rounded w-full font-medium">
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="p-3 bg-[#0F111A] flex items-center justify-between text-white border-t border-white/5">
        <div className="flex items-center gap-4">
          {onEpisodePrev && (
            <button onClick={onEpisodePrev} className="hover:text-[#FFD875] transition-colors" title="Tập trước">
              <FontAwesomeIcon icon={faBackwardStep} />
            </button>
          )}
          <FontAwesomeIcon icon={faCirclePlay} className="text-[#FFD875] text-xl" />
          {onEpisodeNext && (
            <button onClick={onEpisodeNext} className="hover:text-[#FFD875] transition-colors" title="Tập tiếp theo">
              <FontAwesomeIcon icon={faForwardStep} />
            </button>
          )}
          <div className="hidden sm:block text-sm font-medium">
            {movieName} {episodeName && `- ${episodeName}`}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowShortcuts(true)} className="hover:text-[#FFD875] transition-colors" title="Phím tắt">
            <FontAwesomeIcon icon={faKeyboard} />
          </button>
          <div className="relative group">
            <button className="hover:text-[#FFD875] transition-colors flex items-center gap-1">
              <FontAwesomeIcon icon={faGear} />
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col bg-[#1E2030] rounded overflow-hidden">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                <button key={speed} className="px-4 py-1.5 hover:bg-[#FFD875] hover:text-black text-sm whitespace-nowrap">
                  {speed}x
                </button>
              ))}
            </div>
          </div>
          <button className="hover:text-[#FFD875] transition-colors" title="Fullscreen">
            <FontAwesomeIcon icon={faExpand} />
          </button>
        </div>
      </div>
    </div>
  );
}

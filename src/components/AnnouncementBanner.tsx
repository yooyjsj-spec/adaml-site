import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ASSETS } from '../data/assets';
import { useI18n } from '../i18n';

// 새 배너로 교체할 때는 이 값을 바꿔주세요. 이전에 닫은 사용자에게도 새 배너가 다시 표시됩니다.
const BANNER_STORAGE_KEY = 'adaml_home_banner_dismissed_top2percent';

export const AnnouncementBanner: React.FC = () => {
  const { m } = useI18n();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(BANNER_STORAGE_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleClose = () => {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, '1');
    } catch {
      // localStorage unavailable; dismissal just won't persist across visits
    }
  };

  if (dismissed) return null;

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[100/23] rounded-xl overflow-hidden">
        <img
          src={ASSETS.IMAGES.HOME_TOP_BANNER}
          alt={m.home.announcementBanner.alt}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <button
          type="button"
          onClick={handleClose}
          aria-label={m.home.announcementBanner.close}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Search } from 'lucide-react';

export interface PublicationSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Publications 페이지용 검색창 컴포넌트
 * asset_publication_search.ts에서 enabled/placeholder 등 설정 가능
 */
export const PublicationSearchBar: React.FC<PublicationSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by journal name, paper/patent title...',
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200 shadow-sm"
        aria-label="Publications search"
      />
    </div>
  );
};

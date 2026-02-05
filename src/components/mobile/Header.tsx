import { FiSearch } from 'react-icons/fi';
import TypingAnimation from './TypingAnimation';

interface MobileHeaderProps {
  isTablet?: boolean;
  onHeaderClick?: () => void;
}

// Search bar component (internal to Header)
function SearchBar({ isTablet, onClick }: { isTablet: boolean; onClick?: () => void }) {
  return (
    <div
      className={`flex items-center rounded-2xl shadow-lg bg-white/80 backdrop-blur-md border border-gray-300/50 px-4 py-3 w-full mx-auto cursor-pointer select-none transition-all duration-200 hover:bg-white/90 hover:border-gray-400/60 active:scale-[0.98]
      ${isTablet ? 'max-w-2xl min-h-[72px]' : 'max-w-xl min-h-[60px]'}`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label="Open filter modal"
    >
      <FiSearch className={`${isTablet ? 'text-3xl' : 'text-2xl'} text-gray-600 mr-3 flex-shrink-0`} />
      <div className="flex flex-col">
        <TypingAnimation text="Searching for a new home..." speed={80} pauseDuration={1500} />
        <span className={`${isTablet ? 'text-sm' : 'text-xs'} text-gray-500 font-medium mt-0.5`}>
          Neighborhood <span className="mx-1">•</span> Configuration <span className="mx-1">•</span> Budget
        </span>
      </div>
    </div>
  );
}

// Main header component
export default function MobileHeader({ isTablet = false, onHeaderClick }: MobileHeaderProps) {
  return (
    <header className={`${isTablet ? 'px-6' : 'px-4'} pt-4 pb-2 bg-transparent`}>
      <SearchBar isTablet={isTablet} onClick={onHeaderClick} />
    </header>
  );
} 
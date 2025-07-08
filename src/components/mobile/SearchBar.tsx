import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';

export default function SearchBar({ 
  placeholder, 
  onSearch 
}: { 
  placeholder: string;
  onSearch?: (query: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 shadow-sm">
      <FiSearch className="text-xl text-gray-400 mr-3" />
      <input
        type="text"
        className="flex-1 bg-transparent outline-none border-none text-gray-700 placeholder-gray-400 text-base"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
} 
import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleClearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleClearSearch,
}) => (
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
    <input
      type="text"
      placeholder="Search reports..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10 pr-10 py-4 w-full border border-gray-200 rounded-[2px] outline-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
    />
    {searchQuery && (
      <button
        onClick={handleClearSearch}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-6 w-6" />
      </button>
    )}
  </div>
);

export default SearchBar;

import { FiSearch } from 'react-icons/fi';

function SearchBar(
  setSearchTerm
) {
  return (
    <div className="flex items-center bg-purple-100 dark:bg-dark-tertiary rounded-full px-4 py-2 w-full shadow-sm m-2 transition-colors duration-300">
      {/* Search Icon */}
      <FiSearch className="text-gray-500 dark:text-gray-400 text-lg" />

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search"
        className="ml-2 bg-transparent outline-none text-gray-600 dark:text-dark-text text-sm w-full transition-colors duration-300"
      />
    </div>
  );
}

export default SearchBar;

import { FiSearch } from 'react-icons/fi';

function SearchBar() {
  return (
    <div className="flex items-center bg-purple-100 rounded-full px-4 py-2 w-full shadow-sm m-2">
      {/* Search Icon */}
      <FiSearch className="text-gray-500 text-lg" />

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search"
        className="ml-2 bg-transparent outline-none text-gray-600 text-sm w-full"
      />
    </div>
  );
}

export default SearchBar;

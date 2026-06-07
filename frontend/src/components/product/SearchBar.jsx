import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search products...' }) => {
  return (
    <div className="search-bar">
      <input
        className="search-bar__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <FiSearch className="search-bar__icon" />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          title="Clear search"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

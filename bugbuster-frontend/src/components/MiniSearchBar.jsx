import React, { useState } from 'react';
import '../css/MiniSearchBar.css';

function MiniSearchBar({ onSearch, placeholder = "Rechercher..." }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mini-search-form">
      <div className="mini-search-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="mini-search-input"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="mini-clear-btn"
          >
            ✕
          </button>
        )}
        <button type="submit" className="mini-search-btn">
          🔍
        </button>
      </div>
    </form>
  );
}

export default MiniSearchBar;
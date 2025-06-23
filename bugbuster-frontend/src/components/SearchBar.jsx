import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SearchBar.css';

function SearchBar({ onSearch, placeholder = "Rechercher une question...", initialValue = "" }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // NOUVEAU : Toujours rediriger vers SearchResults au lieu de rester sur Home
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
          title="Rechercher dans toutes les questions"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="clear-btn"
          >
            ✕
          </button>
        )}
        <button type="submit" className="search-btn">
          🔍
        </button>
      </div>
      <small className="search-tip">
        💡 Tip : Appuyez sur Entrée ou cliquez sur la loupe pour rechercher
      </small>
    </form>
  );
}

export default SearchBar;
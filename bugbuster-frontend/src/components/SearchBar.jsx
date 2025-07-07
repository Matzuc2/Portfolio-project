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
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value); // Recherche dynamique dans QuestionList
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // CORRECTION: La loupe navigue vers SearchResults
    if (searchTerm.trim()) {
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
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="clear-btn"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
          <button 
            type="submit" 
            className="search-btn"
            aria-label="Rechercher"
            title="Voir tous les résultats"
            disabled={!searchTerm.trim()}
          >
            🔍
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
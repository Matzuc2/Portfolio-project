import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MiniSearchBar.css';

function MiniSearchBar({ placeholder = "Rechercher..." }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // NOUVEAU : Rediriger vers la page SearchResults
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
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
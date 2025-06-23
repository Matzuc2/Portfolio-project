import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MiniAdvancedSearchBar.css';

function MiniAdvancedSearchBar({ onSearch, placeholder = "Rechercher..." }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value, { type: searchType });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Naviguer vers la page de résultats de recherche
      const searchParams = {
        query: searchTerm.trim(),
        type: searchType
      };
      const queryString = new URLSearchParams(searchParams).toString();
      navigate(`/search?${queryString}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('', { type: searchType });
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'tag': return 'Rechercher par tag...';
      case 'user': return 'Rechercher par utilisateur...';
      case 'title': return 'Rechercher dans les titres...';
      default: return placeholder;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mini-advanced-search-form">
      <div className="mini-search-wrapper">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="mini-search-type"
        >
          <option value="all">Tout</option>
          <option value="title">Titre</option>
          <option value="tag">Tag</option>
          <option value="user">User</option>
        </select>
        
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
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

export default MiniAdvancedSearchBar;
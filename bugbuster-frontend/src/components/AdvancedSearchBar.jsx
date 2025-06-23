import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tagService from '../services/tagService';
import '../css/AdvancedSearchBar.css';

function AdvancedSearchBar({ onSearch, initialValue = "", showFilters = true }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    type: 'all', // all, title, content, tag, user
    sortBy: 'recent', // recent, popular, answered
    tags: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (showAdvanced) {
      loadTags();
    }
  }, [showAdvanced]);

  const loadTags = async () => {
    try {
      const result = await tagService.getAllTags();
      if (result.success) {
        const tagNames = result.data.map(tag => tag.Name || tag.name);
        setAvailableTags(tagNames);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-suggest pour les recherches par tag
    if (searchFilters.type === 'tag' && value.trim()) {
      const suggestions = availableTags.filter(tag =>
        tag.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setTagSuggestions(suggestions);
      setShowTagSuggestions(suggestions.length > 0);
    } else {
      setShowTagSuggestions(false);
    }

    if (onSearch) {
      onSearch(value, searchFilters);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = () => {
    if (!searchTerm.trim()) return;

    // Créer les paramètres de recherche
    const searchParams = {
      query: searchTerm.trim(),
      type: searchFilters.type,
      sortBy: searchFilters.sortBy,
      tags: searchFilters.tags.join(',')
    };

    // Naviguer vers la page de résultats
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/search?${queryString}`);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...searchFilters, [filterName]: value };
    setSearchFilters(newFilters);
    
    if (onSearch && searchTerm) {
      onSearch(searchTerm, newFilters);
    }
  };

  const addTagToFilter = (tag) => {
    if (!searchFilters.tags.includes(tag)) {
      const newTags = [...searchFilters.tags, tag];
      handleFilterChange('tags', newTags);
    }
    setShowTagSuggestions(false);
  };

  const removeTagFromFilter = (tagToRemove) => {
    const newTags = searchFilters.tags.filter(tag => tag !== tagToRemove);
    handleFilterChange('tags', newTags);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchFilters({
      type: 'all',
      sortBy: 'recent',
      tags: []
    });
    setShowTagSuggestions(false);
    if (onSearch) {
      onSearch('', searchFilters);
    }
  };

  const handleTagSuggestionClick = (tag) => {
    if (searchFilters.type === 'tag') {
      setSearchTerm(tag);
      setShowTagSuggestions(false);
    } else {
      addTagToFilter(tag);
    }
  };

  return (
    <div className="advanced-search-container">
      <form onSubmit={handleSubmit} className="advanced-search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={
              searchFilters.type === 'tag' ? "Rechercher par tag..." :
              searchFilters.type === 'user' ? "Rechercher par utilisateur..." :
              searchFilters.type === 'title' ? "Rechercher dans les titres..." :
              searchFilters.type === 'content' ? "Rechercher dans le contenu..." :
              "Rechercher une question..."
            }
            className="search-input"
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
          
          {showFilters && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`filter-toggle-btn ${showAdvanced ? 'active' : ''}`}
            >
              🔧
            </button>
          )}
          
          <button type="submit" className="search-btn">
            🔍
          </button>
        </div>

        {/* Suggestions de tags */}
        {showTagSuggestions && (
          <div className="tag-suggestions-dropdown">
            {tagSuggestions.map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTagSuggestionClick(tag)}
                className="tag-suggestion-item"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Filtres avancés */}
      {showAdvanced && showFilters && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Rechercher dans :</label>
              <select
                value={searchFilters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
              >
                <option value="all">Tout</option>
                <option value="title">Titres uniquement</option>
                <option value="content">Contenu uniquement</option>
                <option value="tag">Par tag</option>
                <option value="user">Par utilisateur</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Trier par :</label>
              <select
                value={searchFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                <option value="recent">Plus récent</option>
                <option value="popular">Plus populaire</option>
                <option value="answered">Avec réponses</option>
                <option value="unanswered">Sans réponses</option>
              </select>
            </div>
          </div>

          {/* Tags de filtrage */}
          <div className="filter-group tags-filter">
            <label className="filter-label">Filtrer par tags :</label>
            <div className="selected-filter-tags">
              {searchFilters.tags.map((tag, index) => (
                <span key={index} className="filter-tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTagFromFilter(tag)}
                    className="remove-filter-tag"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="popular-filter-tags">
              {availableTags.slice(0, 8).map((tag, index) => (
                !searchFilters.tags.includes(tag) && (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addTagToFilter(tag)}
                    className="popular-filter-tag"
                  >
                    + {tag}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchBar;
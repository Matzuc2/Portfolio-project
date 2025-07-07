import React, { useState, useEffect } from 'react';
import tagService from '../services/tagService';
import { useNotification } from '../hooks/useNotification';
import '../css/FilterSidebar.css';

function FilterSidebar({ onFiltersChange, initialFilters = {} }) {
  const { showError } = useNotification();
  
  const [filters, setFilters] = useState({
    searchType: 'all', // 'all', 'title', 'content', 'tags'
    tags: [],
    sortBy: 'newest', // 'newest', 'oldest', 'most-votes', 'most-answers'
    dateFrom: '',
    dateTo: '',
    hasAnswers: false,
    noAnswers: false,
    isResolved: false,
    ...initialFilters
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    searchType: true,
    tags: false,
    status: true,
    sort: false // Maintenant expandable comme les autres
  });

  // Charger les tags depuis la base de données
  useEffect(() => {
    loadTags();
  }, []);

  // Notifier les changements de filtres
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  // Filtrer les tags selon la recherche
  useEffect(() => {
    if (tagSearchQuery.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.toLowerCase().includes(tagSearchQuery.toLowerCase()) &&
        !filters.tags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowTagSuggestions(false);
    }
  }, [tagSearchQuery, availableTags, filters.tags]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const result = await tagService.getAllTags();
      
      if (result.success) {
        const tagNames = result.data.map(tag => tag.Name || tag.name);
        setAvailableTags(tagNames);
      } else {
        showError('Erreur lors du chargement des tags');
        setAvailableTags(getFallbackTags());
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
      setAvailableTags(getFallbackTags());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackTags = () => [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
    'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
    'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis',
    'Git', 'Docker', 'AWS', 'Azure', 'Linux', 'Windows'
  ];

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleTagAdd = (tagName) => {
    if (!filters.tags.includes(tagName) && filters.tags.length < 10) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
      setTagSearchQuery('');
      setShowTagSuggestions(false);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchType: 'all',
      tags: [],
      sortBy: 'newest',
      dateFrom: '',
      dateTo: '',
      hasAnswers: undefined,
      isResolved: undefined
    };
    
    setFilters(clearedFilters);
    setTagSearchQuery('');
    setShowTagSuggestions(false);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    
    // Type de recherche (si différent de 'all')
    if (filters.searchType && filters.searchType !== 'all') count++;
    
    // Tags
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    
    // Statut de résolution
    if (filters.isResolved !== undefined) count++;
    
    // Nombre de réponses
    if (filters.hasAnswers !== undefined) count++;
    
    // Tri (si différent de 'newest')
    if (filters.sortBy && filters.sortBy !== 'newest') count++;
    
    // Dates
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="filter-sidebar">
      {/* Header */}
      <div className="filter-header">
        <h3 className="filter-title">
          Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </h3>
        {activeFiltersCount > 0 && (
          <button onClick={clearAllFilters} className="clear-filters-btn">
            Effacer tout
          </button>
        )}
      </div>

      {/* Tags sélectionnés */}
      {filters.tags.length > 0 && (
        <div className="selected-tags">
          <p className="selected-tags-title">Tags sélectionnés :</p>
          {filters.tags.map((tag, index) => (
            <span key={index} className="selected-filter-tag">
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="remove-tag"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Type de recherche */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('searchType')}
        >
          Type de recherche
          <span className={`expand-icon ${expandedSections.searchType ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.searchType && (
          <div className="filter-section-content">
            <div className="filter-option">
              <input
                type="radio"
                id="search-all"
                name="searchType"
                value="all"
                checked={filters.searchType === 'all'}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
              />
              <label htmlFor="search-all" className="filter-option-label">
                Partout
              </label>
            </div>
            <div className="filter-option">
              <input
                type="radio"
                id="search-title"
                name="searchType"
                value="title"
                checked={filters.searchType === 'title'}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
              />
              <label htmlFor="search-title" className="filter-option-label">
                Titre uniquement
              </label>
            </div>
            <div className="filter-option">
              <input
                type="radio"
                id="search-content"
                name="searchType"
                value="content"
                checked={filters.searchType === 'content'}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
              />
              <label htmlFor="search-content" className="filter-option-label">
                Contenu uniquement
              </label>
            </div>
            <div className="filter-option">
              <input
                type="radio"
                id="search-tags"
                name="searchType"
                value="tags"
                checked={filters.searchType === 'tags'}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
              />
              <label htmlFor="search-tags" className="filter-option-label">
                Tags uniquement
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('tags')}
        >
          Tags
          <span className={`expand-icon ${expandedSections.tags ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.tags && (
          <div className="filter-section-content">
            <div className="tag-input-container">
              <input
                type="text"
                placeholder="Rechercher un tag..."
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                className="tag-input"
              />
              {showTagSuggestions && (
                <div className="tag-suggestions">
                  {filteredTags.slice(0, 8).map((tag, index) => (
                    <div
                      key={index}
                      className="tag-suggestion"
                      onClick={() => handleTagAdd(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Statut des questions */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('status')}
        >
          Statut des questions
          <span className={`expand-icon ${expandedSections.status ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.status && (
          <div className="filter-section-content">
            <div className="activity-options">
              <div className="activity-option">
                <input
                  type="checkbox"
                  id="is-resolved"
                  checked={filters.isResolved === true}
                  onChange={(e) => handleFilterChange('isResolved', e.target.checked ? true : undefined)}
                />
                <label htmlFor="is-resolved" className="activity-option-label">
                  ✅ Résolu (avec réponse acceptée)
                </label>
              </div>
              <div className="activity-option">
                <input
                  type="checkbox"
                  id="not-resolved"
                  checked={filters.isResolved === false}
                  onChange={(e) => handleFilterChange('isResolved', e.target.checked ? false : undefined)}
                />
                <label htmlFor="not-resolved" className="activity-option-label">
                  ❌ Non résolu
                </label>
              </div>
              <div className="activity-option">
                <input
                  type="checkbox"
                  id="has-answers"
                  checked={filters.hasAnswers === true}
                  onChange={(e) => handleFilterChange('hasAnswers', e.target.checked ? true : undefined)}
                />
                <label htmlFor="has-answers" className="activity-option-label">
                  💬 A des réponses
                </label>
              </div>
              <div className="activity-option">
                <input
                  type="checkbox"
                  id="no-answers"
                  checked={filters.hasAnswers === false}
                  onChange={(e) => handleFilterChange('hasAnswers', e.target.checked ? false : undefined)}
                />
                <label htmlFor="no-answers" className="activity-option-label">
                  ❓ Sans réponse
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tri */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('sort')}
        >
          Trier par
          <span className={`expand-icon ${expandedSections.sort ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.sort && (
          <div className="filter-section-content">
            <div className="sort-options">
              <div className="sort-option">
                <input
                  type="radio"
                  id="sort-newest"
                  name="sortBy"
                  value="newest"
                  checked={filters.sortBy === 'newest'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                />
                <label htmlFor="sort-newest" className="sort-option-label">
                  🕐 Plus récent
                </label>
              </div>
              <div className="sort-option">
                <input
                  type="radio"
                  id="sort-oldest"
                  name="sortBy"
                  value="oldest"
                  checked={filters.sortBy === 'oldest'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                />
                <label htmlFor="sort-oldest" className="sort-option-label">
                  🕑 Plus ancien
                </label>
              </div>
              <div className="sort-option">
                <input
                  type="radio"
                  id="sort-most-votes"
                  name="sortBy"
                  value="most-votes"
                  checked={filters.sortBy === 'most-votes'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                />
                <label htmlFor="sort-most-votes" className="sort-option-label">
                  👍 Plus de votes
                </label>
              </div>
              <div className="sort-option">
                <input
                  type="radio"
                  id="sort-most-answers"
                  name="sortBy"
                  value="most-answers"
                  checked={filters.sortBy === 'most-answers'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                />
                <label htmlFor="sort-most-answers" className="sort-option-label">
                  💬 Plus de réponses
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('date')}
        >
          Dates
          <span className={`expand-icon ${expandedSections.date ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
        {expandedSections.date && (
          <div className="filter-section-content">
            <div className="date-filters">
              <div className="date-filter">
                <label htmlFor="date-from" className="date-filter-label">
                  Date de début :
                </label>
                <input
                  type="date"
                  id="date-from"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="date-filter-input"
                />
              </div>
              <div className="date-filter">
                <label htmlFor="date-to" className="date-filter-label">
                  Date de fin :
                </label>
                <input
                  type="date"
                  id="date-to"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="date-filter-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterSidebar;

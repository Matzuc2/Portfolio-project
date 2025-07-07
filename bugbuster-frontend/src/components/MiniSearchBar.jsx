import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import questionService from '../services/questionService';
import tagService from '../services/tagService';
import '../css/MiniSearchBar.css';

function MiniSearchBar({ placeholder = "Rechercher...", initialValue = "" }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  // Recherche dynamique
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      performDynamicSearch(searchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Fermer suggestions en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [questionsResult, tagsResult] = await Promise.all([
        questionService.getAllQuestions(),
        tagService.getAllTags()
      ]);

      if (questionsResult.success) {
        setAllQuestions(questionsResult.data);
      }

      if (tagsResult.success) {
        setAllTags(tagsResult.data.map(tag => tag.name || tag.Name));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const performDynamicSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    const searchLower = query.toLowerCase();
    const results = [];

    try {
      // 1. RECHERCHE DANS LES TAGS (priorité haute)
      const matchingTags = allTags.filter(tag => 
        tag.toLowerCase().includes(searchLower)
      ).slice(0, 3);

      matchingTags.forEach(tag => {
        results.push({
          type: 'tag',
          title: `🏷️ Tag: ${tag}`,
          subtitle: `Questions avec le tag "${tag}"`,
          value: tag,
          action: () => navigate(`/search?tags=${encodeURIComponent(tag)}`)
        });
      });

      // 2. RECHERCHE DANS LES TITRES
      const titleMatches = allQuestions.filter(question => 
        question.Title?.toLowerCase().includes(searchLower)
      ).slice(0, 3);

      titleMatches.forEach(question => {
        results.push({
          type: 'question',
          title: question.Title,
          subtitle: `Par ${question.User?.Username || 'Utilisateur'} • ${question.stats?.answerCount || 0} réponses`,
          value: question.Title,
          action: () => navigate(`/question/${question.Id}`)
        });
      });

      // 3. QUESTIONS AVEC TAGS CORRESPONDANTS
      const taggedQuestions = allQuestions.filter(question => {
        const questionTags = question.Tags || [];
        return questionTags.some(tag => 
          (tag.name || tag.Name || '').toLowerCase().includes(searchLower)
        );
      }).slice(0, 2);

      taggedQuestions.forEach(question => {
        const matchingTags = question.Tags.filter(tag => 
          (tag.name || tag.Name || '').toLowerCase().includes(searchLower)
        );
        
        results.push({
          type: 'tagged',
          title: question.Title,
          subtitle: `🏷️ ${matchingTags.map(t => t.name || t.Name).join(', ')}`,
          value: question.Title,
          action: () => navigate(`/question/${question.Id}`)
        });
      });

      setSuggestions(results.slice(0, 6));
      setShowSuggestions(results.length > 0);

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.value);
    setShowSuggestions(false);
    suggestion.action();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="mini-search-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="mini-search-form">
        <div className="mini-search-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(suggestions.length > 0)}
            placeholder={placeholder}
            className="mini-search-input"
            autoComplete="off"
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
          <button 
            type="submit" 
            className="mini-search-btn"
            disabled={!searchTerm.trim()}
          >
            🔍
          </button>
        </div>

        {/* Suggestions intelligentes */}
        {showSuggestions && (
          <div className="mini-search-suggestions">
            {loading && (
              <div className="mini-suggestion-loading">
                🔄 Recherche...
              </div>
            )}
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`mini-search-suggestion ${suggestion.type}`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="mini-suggestion-title">{suggestion.title}</div>
                <div className="mini-suggestion-subtitle">{suggestion.subtitle}</div>
              </div>
            ))}
            {suggestions.length > 0 && (
              <div className="mini-suggestion-footer">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mini-view-all-btn"
                >
                  Tous les résultats →
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default MiniSearchBar;
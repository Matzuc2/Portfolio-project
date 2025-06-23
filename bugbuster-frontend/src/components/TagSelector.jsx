import React, { useState, useEffect } from 'react';
import tagService from '../services/tagService';
import { useNotification } from '../hooks/useNotification';
import '../css/TagSelector.css';

function TagSelector({ selectedTags = [], onTagsChange, maxTags = 5 }) {
  const { showError, showSuccess } = useNotification();
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les tags depuis la base de données
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const result = await tagService.getAllTags();
      
      if (result.success) {
        // Mapper les tags de la DB vers un format utilisable
        const tagNames = result.data.map(tag => tag.Name || tag.name);
        setAvailableTags(tagNames);
      } else {
        showError('Erreur lors du chargement des tags');
        // Fallback vers des tags prédéfinis
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
    'Git', 'Docker', 'AWS', 'Azure', 'Linux', 'Windows',
    'API', 'REST', 'GraphQL', 'JSON', 'XML',
    'Debugging', 'Performance', 'Security', 'Testing', 'Deployment'
  ];

  // Filtrer les tags basés sur l'input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  }, [inputValue, availableTags, selectedTags]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const addTag = async (tagName) => {
    if (!tagName) return;
    
    if (selectedTags.length >= maxTags) {
      showError(`Vous ne pouvez pas ajouter plus de ${maxTags} tags`);
      return;
    }

    if (selectedTags.includes(tagName)) {
      showError('Ce tag est déjà ajouté');
      return;
    }

    // Vérifier si le tag existe, sinon le créer
    if (!availableTags.includes(tagName)) {
      try {
        const result = await tagService.createTag(tagName);
        if (result.success) {
          showSuccess(`Tag "${tagName}" créé avec succès`);
          setAvailableTags(prev => [...prev, tagName]);
        } else {
          showError(result.error || 'Erreur lors de la création du tag');
          return;
        }
      } catch (error) {
        console.error('Erreur lors de la création du tag:', error);
        showError('Erreur lors de la création du tag');
        return;
      }
    }

    const newTags = [...selectedTags, tagName];
    onTagsChange(newTags);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  const handleSuggestionClick = (tag) => {
    addTag(tag);
  };

  const getPopularTags = () => {
    // Prendre les 6 premiers tags les plus populaires
    return availableTags.slice(0, 6);
  };

  return (
    <div className="tag-selector">
      <div className="tag-input-container">
        {/* Tags sélectionnés */}
        {selectedTags.map((tag, index) => (
          <span key={index} className="selected-tag">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="remove-tag-btn"
            >
              ✕
            </button>
          </span>
        ))}
        
        {/* Input pour ajouter des tags */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedTags.length === 0 ? "Tapez pour rechercher des tags..." : ""}
          className="tag-input"
          disabled={selectedTags.length >= maxTags || loading}
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && filteredTags.length > 0 && (
        <div className="tag-suggestions">
          {filteredTags.slice(0, 8).map((tag, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(tag)}
              className="tag-suggestion"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Compteur de tags */}
      <div className="tag-counter">
        {selectedTags.length}/{maxTags} tags sélectionnés
        {loading && <span className="loading-indicator"> (Chargement...)</span>}
      </div>

      {/* Tags populaires */}
      {selectedTags.length === 0 && !loading && (
        <div className="popular-tags">
          <p className="popular-tags-title">Tags populaires :</p>
          <div className="popular-tags-list">
            {getPopularTags().map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(tag)}
                className="popular-tag"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TagSelector;
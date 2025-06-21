import React, { useState, useEffect } from 'react';
import '../css/TagSelector.css';

function TagSelector({ selectedTags = [], onTagsChange, maxTags = 5 }) {
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Tags prédéfinis (vous pourrez les récupérer depuis une API plus tard)
  useEffect(() => {
    const predefinedTags = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go',
      'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
      'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
      'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis',
      'Git', 'Docker', 'AWS', 'Azure', 'Linux', 'Windows',
      'API', 'REST', 'GraphQL', 'JSON', 'XML',
      'Debugging', 'Performance', 'Security', 'Testing', 'Deployment',
      'Frontend', 'Backend', 'Fullstack', 'Mobile', 'Desktop',
      'Algorithm', 'Data Structure', 'Database', 'Network', 'AI/ML'
    ];
    setAvailableTags(predefinedTags);
  }, []);

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
      // Supprimer le dernier tag si l'input est vide
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const addTag = (tagName) => {
    if (!tagName) return;
    
    if (selectedTags.length >= maxTags) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxTags} tags`);
      return;
    }

    if (selectedTags.includes(tagName)) {
      alert('Ce tag est déjà ajouté');
      return;
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
          disabled={selectedTags.length >= maxTags}
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
      </div>

      {/* Tags populaires */}
      {selectedTags.length === 0 && (
        <div className="popular-tags">
          <p className="popular-tags-title">Tags populaires :</p>
          <div className="popular-tags-list">
            {['JavaScript', 'React', 'Python', 'CSS', 'Node.js', 'API'].map((tag, index) => (
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
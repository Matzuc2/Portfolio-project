import React, { useState, useEffect } from 'react';
import TagSelector from './TagSelector';
import '../css/QuestionForm.css';

function QuestionForm({ onSubmit, onDataChange, questionData, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: []
  });

  const [showCodeField, setShowCodeField] = useState(false);
  const [errors, setErrors] = useState({});

  // Synchroniser avec les données externes
  useEffect(() => {
    if (questionData) {
      setFormData(questionData);
    }
  }, [questionData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Notifier le parent du changement
    if (onDataChange) {
      onDataChange(newFormData);
    }

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagsChange = (newTags) => {
    const newFormData = {
      ...formData,
      tags: newTags
    };
    
    setFormData(newFormData);
    
    if (onDataChange) {
      onDataChange(newFormData);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Le titre doit contenir au moins 10 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('=== DEBUGGING QUESTIONFORM ===');
    console.log('formData AVANT soumission:', formData);
    console.log('formData.title:', formData.title);
    console.log('formData.description:', formData.description);
    console.log('formData.content:', formData.content);

    // MODIFICATION : S'assurer que les données sont correctes
    const submitData = {
      title: formData.title,
      description: formData.description,
      content: formData.content, // LE CODE SNIPPET
      tags: formData.tags || []
    };

    console.log('=== DONNÉES ENVOYÉES À ASKQUESTION ===');
    console.log('submitData:', submitData);

    if (onSubmit) {
      await onSubmit(submitData);
    }
  };

  const toggleCodeField = () => {
    setShowCodeField(!showCodeField);
    if (showCodeField) {
      // Vider le code si on masque le champ
      const newFormData = { ...formData, content: '' };
      setFormData(newFormData);
      if (onDataChange) {
        onDataChange(newFormData);
      }
    }
  };

  return (
    <div className="question-form-container">
      <form onSubmit={handleSubmit} className="question-form">
        {/* Titre de la question */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Titre de la question *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Décrivez votre problème en une phrase claire..."
            className={`form-input ${errors.title ? 'error' : ''}`}
            disabled={isSubmitting}
            required
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description détaillée *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Expliquez votre problème en détail, ce que vous avez essayé, les erreurs rencontrées..."
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            rows="6"
            disabled={isSubmitting}
            required
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {/* Bouton pour toggle le champ code */}
        <div className="code-toggle-section">
          <button
            type="button"
            onClick={toggleCodeField}
            className="code-toggle-btn"
            disabled={isSubmitting}
          >
            {showCodeField ? '❌ Supprimer le code' : '📝 Ajouter un code snippet'}
          </button>
        </div>

        {/* Champ de code conditionnel */}
        {showCodeField && (
          <div className="form-group code-field-animate">
            <label htmlFor="content" className="form-label">
              Code (optionnel)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Collez votre code ici..."
              className="code-textarea"
              rows="8"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Tags - NOUVEAU */}
        <div className="form-group">
          <label className="form-label">
            Tags (recommandé)
          </label>
          <TagSelector
            selectedTags={formData.tags}
            onTagsChange={handleTagsChange}
            maxTags={5}
            disabled={isSubmitting}
          />
          <small className="form-help">
            Ajoutez des tags pertinents pour aider les autres à trouver votre question
          </small>
        </div>

        {/* Bouton de soumission */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
          >
            {isSubmitting ? 'Publication en cours...' : 'Publier la question'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuestionForm;
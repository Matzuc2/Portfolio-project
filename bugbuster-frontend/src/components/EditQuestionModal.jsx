import React, { useState, useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';
import questionService from '../services/questionService';
import '../css/EditModal.css';

function EditQuestionModal({ question, onSave, onCancel }) {
  const { showError } = useNotification();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    codeSnippet: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.Title || question.title || '',
        content: question.Content || question.content || '',
        codeSnippet: question.CodeSnippet || question.codeSnippet || ''
      });
    }
  }, [question]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Le titre doit contenir au moins 10 caractères';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Le contenu doit contenir au moins 20 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const questionId = question.Id || question.id;
      const result = await questionService.updateQuestion(questionId, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        codeSnippet: formData.codeSnippet.trim() || null
      });

      if (result.success) {
        onSave(result.data.question);
      } else {
        showError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showError('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Modifier la question</h3>
          <button className="modal-close-btn" onClick={onCancel}>
            ❌
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Titre *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              disabled={isSubmitting}
              required
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Contenu *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              rows="6"
              disabled={isSubmitting}
              required
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="codeSnippet" className="form-label">
              Code snippet (optionnel)
            </label>
            <textarea
              id="codeSnippet"
              name="codeSnippet"
              value={formData.codeSnippet}
              onChange={handleInputChange}
              className="code-textarea"
              rows="6"
              disabled={isSubmitting}
              placeholder="Ajoutez votre code ici..."
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditQuestionModal;
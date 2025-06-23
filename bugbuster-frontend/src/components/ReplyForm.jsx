import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import '../css/ReplyForm.css';

function ReplyForm({ questionId, onReplySubmit, onCancel }) {
  const { isAuthenticated, getCurrentUserId } = useAuth();
  const { showError } = useNotification();
  
  const [replyContent, setReplyContent] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [showCodeField, setShowCodeField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      showError('Veuillez saisir une réponse');
      return;
    }

    if (!isAuthenticated) {
      showError('Vous devez être connecté pour répondre');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReply = {
        content: replyContent.trim(),
        codeContent: (showCodeField && codeContent.trim()) ? codeContent.trim() : null,
        questionId: questionId
      };

      console.log('Soumission de la réponse:', newReply);

      if (onReplySubmit) {
        await onReplySubmit(newReply);
      }

      // Réinitialiser le formulaire après succès
      setReplyContent('');
      setCodeContent('');
      setShowCodeField(false);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Erreur lors de la soumission de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReplyContent('');
    setCodeContent('');
    setShowCodeField(false);
    if (onCancel) {
      onCancel();
    }
  };

  const toggleCodeField = () => {
    setShowCodeField(!showCodeField);
    if (showCodeField) {
      setCodeContent('');
    }
  };

  return (
    <div className="reply-form-container">
      <h3 className="reply-form-title">Votre réponse</h3>
      
      <form onSubmit={handleSubmit} className="reply-form">
        <div className="form-group">
          <label htmlFor="reply-content" className="form-label">
            Réponse *
          </label>
          <textarea
            id="reply-content"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
            className="reply-textarea"
            rows="6"
            required
            disabled={isSubmitting}
          />
        </div>

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

        {showCodeField && (
          <div className="form-group code-field-animate">
            <label htmlFor="code-content" className="form-label">
              Code snippet
            </label>
            <textarea
              id="code-content"
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="Ajoutez votre code ici..."
              className="code-textarea"
              rows="6"
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !replyContent.trim()}
          >
            {isSubmitting ? 'Publication...' : 'Publier la réponse'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReplyForm;